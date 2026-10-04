<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Perusahaan;
use App\Models\PengajuanPkl;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SiswaController;
use App\Http\Controllers\MitraController;
use App\Http\Controllers\AdminController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// ==========================================
// LANDING PAGE (Public / Tampilan Awal)
// ==========================================
Route::get('/', function () {
    // Ambil statistik & data mitra aktif untuk ditampilkan di landing page
    $stats = [
        'total_mitra'     => Perusahaan::where('status_mitra', 'aktif')->count(),
        'total_pengajuan' => PengajuanPkl::count(),
        'siswa_terpenuhi' => PengajuanPkl::whereIn('status', ['diterima', 'diterima_mitra'])->count(),
    ];

    $mitraList = Perusahaan::where('status_mitra', 'aktif')
        ->select('id', 'nama_perusahaan', 'alamat_lengkap', 'kuota_tersedia')
        ->take(6)
        ->get();

    return Inertia::render('Welcome', [
        'auth'      => ['user' => Auth::user()],
        'stats'     => $stats,
        'mitraList' => $mitraList,
    ]);
})->name('home');

// Route khusus pengarah dashboard berdasarkan role user
Route::get('/dashboard', function () {
    if (! Auth::check()) {
        return redirect()->route('login');
    }

    return match (Auth::user()->role) {
        'siswa'                      => redirect()->route('siswa.dashboard'),
        'admin'                      => redirect()->route('admin.dashboard'),
        'perusahaan', 'mitra', 'hrd' => redirect()->route('mitra.dashboard'),
        default                      => redirect()->route('login')->withErrors([
            'email' => 'Role akun tidak dikenali. Silakan login kembali.'
        ]),
    };
})->name('dashboard');

// ==========================================
// 1. ROUTE PUBLIC / GUEST
// ==========================================
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);

    Route::get('/register', [AuthController::class, 'showRegisterForm'])->name('register');
    Route::post('/register/siswa', [AuthController::class, 'registerSiswa'])->name('register.siswa');
    Route::post('/register/hrd', [AuthController::class, 'registerHrd'])->name('register.hrd');
});

// ==========================================
// 2. ROUTE TERPROTEKSI (Wajib Login)
// ==========================================
Route::middleware('auth')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // --- Akses Khusus Siswa ---
    Route::middleware('ensureRole:siswa')->group(function () {
        Route::get('/siswa/dashboard', [SiswaController::class, 'dashboard'])->name('siswa.dashboard');
        Route::get('/siswa/mitra', [SiswaController::class, 'mitra'])->name('siswa.mitra');
        Route::get('/siswa/pengajuan', [SiswaController::class, 'pengajuan'])->name('siswa.pengajuan');
        Route::get('/siswa/jadwal', [SiswaController::class, 'jadwal'])->name('siswa.jadwal');
        Route::get('/siswa/pengajuan/{id}/cetak-surat', [SiswaController::class, 'cetakSurat'])->name('siswa.pengajuan.cetak');
        Route::post('/siswa/pengajuan', [SiswaController::class, 'storePengajuan'])->name('siswa.pengajuan.store');
    });

    // --- Akses Khusus Mitra / HRD ---
    Route::middleware('ensureRole:mitra,perusahaan,hrd')->group(function () {
        Route::get('/mitra/dashboard', [MitraController::class, 'dashboard'])
            ->name('mitra.dashboard');

        Route::post('/mitra/konfirmasi/{id}', [MitraController::class, 'konfirmasi'])
            ->name('mitra.konfirmasi');

        Route::put('/mitra/profil', [MitraController::class, 'updateProfile'])
            ->name('mitra.profil.update');
    });

    // --- Akses Khusus Admin Hubin ---
    Route::middleware('ensureRole:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
        Route::get('/mitra-siswa', [AdminController::class, 'mitra'])->name('admin.mitra');
        Route::get('/jadwal-pkl', [AdminController::class, 'jadwal'])->name('admin.jadwal');
        Route::get('/analisis-peminat', [AdminController::class, 'analisis'])->name('admin.analisis');
        Route::get('/data-siswa', [AdminController::class, 'siswa'])->name('admin.siswa');

        Route::post('/perusahaan', [AdminController::class, 'storePerusahaan'])->name('admin.perusahaan.store');
        Route::post('/perusahaan/{id}/toggle', [AdminController::class, 'toggleMitra'])->name('admin.perusahaan.toggle');
        Route::post('/pengajuan/{id}/status', [AdminController::class, 'updateStatus'])->name('admin.pengajuan.status');
        Route::get('/pengajuan/{id}/cetak-surat', [AdminController::class, 'cetakSurat'])->name('admin.pengajuan.cetak');
    });
});