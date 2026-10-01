<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SiswaController;
use App\Http\Controllers\MitraController;
use App\Http\Controllers\AdminController;

// Redirect root '/' ke halaman login
Route::get('/', function () {
    return redirect()->route('login');
});

// ==========================================
// 1. ROUTE PUBLIC / GUEST (Tanpa Middleware Auth)
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
Route::middleware(['auth'])->group(function () {

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Modul Siswa
    Route::get('/siswa/dashboard', [SiswaController::class, 'dashboard'])->name('siswa.dashboard');
    Route::post('/siswa/pengajuan', [SiswaController::class, 'storePengajuan'])->name('siswa.pengajuan.store');

    // Modul Mitra / HRD
    Route::get('/mitra/dashboard', [MitraController::class, 'dashboard'])->name('mitra.dashboard');
    Route::post('/mitra/konfirmasi/{id}', [MitraController::class, 'konfirmasi'])->name('mitra.konfirmasi');

    // Modul Admin Hubin
    Route::prefix('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');

        // Halaman navigasi Admin Hubin
        Route::get('/mitra-siswa', [AdminController::class, 'mitra'])->name('admin.mitra');
        Route::get('/jadwal-pkl', [AdminController::class, 'jadwal'])->name('admin.jadwal');
        Route::get('/analisis-peminat', [AdminController::class, 'analisis'])->name('admin.analisis');
        Route::get('/data-siswa', [AdminController::class, 'siswa'])->name('admin.siswa');

        // Aksi perusahaan & pengajuan
        Route::post('/perusahaan', [AdminController::class, 'storePerusahaan'])->name('admin.perusahaan.store');
        Route::post('/pengajuan/{id}/status', [AdminController::class, 'updateStatus'])->name('admin.pengajuan.status');
        Route::get('/pengajuan/{id}/cetak-surat', [AdminController::class, 'cetakSurat'])->name('admin.pengajuan.cetak');
    });

});