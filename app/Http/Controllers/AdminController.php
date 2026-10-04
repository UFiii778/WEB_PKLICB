<?php

namespace App\Http\Controllers;

use App\Models\PengajuanPkl;
use App\Models\Perusahaan;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AdminController extends Controller
{
    /** Status yang sudah lolos validasi Hubin (surat pengantar boleh dicetak). */
    private const STATUS_DISETUJUI = [PengajuanPkl::DISETUJUI_HUBIN, PengajuanPkl::DITERIMA_MITRA];

    /** Status yang berarti pengajuan gugur. */
    private const STATUS_DITOLAK = [PengajuanPkl::DITOLAK_HUBIN, PengajuanPkl::DITOLAK_MITRA];

    /** Singkatan jurusan -> nama lengkap (fallback: singkatan itu sendiri). */
    private const JURUSAN = [
        'RPL'  => 'Rekayasa Perangkat Lunak',
        'TKJ'  => 'Teknik Komputer & Jaringan',
        'DKV'  => 'Desain Komunikasi Visual',
        'MM'   => 'Multimedia',
        'AKL'  => 'Akuntansi & Keuangan Lembaga',
        'OTKP' => 'Otomatisasi & Tata Kelola Perkantoran',
        'MPLB' => 'Manajemen Perkantoran & Layanan Bisnis',
        'BDP'  => 'Bisnis Daring & Pemasaran',
        'PM'   => 'Pemasaran',
    ];

    // =========================================================
    // 1. DASHBOARD + VALIDASI PENGAJUAN
    // =========================================================
    public function index()
    {
        return $this->dashboard();
    }

    public function dashboard()
    {
        $pengajuan = $this->allPengajuan();

        $stats = [
            'total'           => $pengajuan->count(),
            'aktif'           => $pengajuan->reject(fn ($p) => in_array($p->status, self::STATUS_DITOLAK))->count(),
            'siswa_terpenuhi' => $pengajuan->where('status', PengajuanPkl::DITERIMA_MITRA)
                ->sum(fn ($p) => 1 + $p->anggota->count()),
            'pending'         => $pengajuan->where('status', PengajuanPkl::PENDING)->count(),
            'mitra_aktif'     => Perusahaan::where('status_mitra', 'aktif')->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats'     => $stats,
            'pengajuan' => $pengajuan->map(fn ($p) => $this->serializePengajuan($p))->values(),
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status'           => 'required|in:' . PengajuanPkl::DISETUJUI_HUBIN . ',' . PengajuanPkl::DITOLAK_HUBIN,
            'alasan_penolakan' => 'required_if:status,' . PengajuanPkl::DITOLAK_HUBIN . '|nullable|string|min:5|max:500',
        ], [
            'alasan_penolakan.required_if' => 'Alasan penolakan wajib diisi.',
            'alasan_penolakan.min'         => 'Alasan penolakan minimal 5 karakter.',
            'alasan_penolakan.max'         => 'Alasan penolakan maksimal 500 karakter.',
        ]);

        $pengajuan = PengajuanPkl::findOrFail($id);

        if ($pengajuan->status !== PengajuanPkl::PENDING) {
            return back()->with('error', 'Pengajuan ini sudah divalidasi sebelumnya.');
        }

        $ditolak = $validated['status'] === PengajuanPkl::DITOLAK_HUBIN;

        $pengajuan->update([
            'status'           => $validated['status'],
            'alasan_penolakan' => $ditolak ? trim($validated['alasan_penolakan']) : null,
        ]);

        return back()->with('success', $ditolak
            ? "Pengajuan {$pengajuan->kode_pengajuan} ditolak. Alasan akan tampil di dashboard siswa."
            : "Pengajuan {$pengajuan->kode_pengajuan} disetujui. Surat pengantar siap dicetak.");
    }

    public function cetakSurat($id)
    {
        $pengajuan = PengajuanPkl::with(['ketua', 'perusahaan', 'anggota.siswa'])->findOrFail($id);

        if (! in_array($pengajuan->status, self::STATUS_DISETUJUI)) {
            abort(403, 'Surat pengantar hanya bisa dicetak setelah pengajuan disetujui Hubin.');
        }

        return Pdf::loadView('admin.surat_pengantar_pdf', compact('pengajuan'))
            ->setPaper('a4')
            ->stream('Surat-Pengantar-' . $pengajuan->kode_pengajuan . '.pdf');
    }

    // =========================================================
    // 2. MITRA & SISWA
    // =========================================================
    public function mitra()
    {
        $pengajuan = $this->allPengajuan()->groupBy('perusahaan_id');

        // Mengambil data perusahaan beserta relasi user_id (akun HRD)
        $mitra = Perusahaan::with('user')->orderBy('nama_perusahaan')->get()->map(function ($p) use ($pengajuan) {
            $list = $pengajuan->get($p->id, collect());

            return [
                'id'            => $p->id,
                'user_id'       => $p->user_id,
                'nama'          => $p->nama_perusahaan,
                'alamat'        => $p->alamat_lengkap,
                'kontak_hrd'    => $p->kontak_hrd,
                'nama_hrd'      => $p->user?->name ?? 'Belum ada akun',
                'email_hrd'     => $p->user?->email ?? '-',
                'kuota_sisa'    => (int) $p->kuota_tersedia,
                'status_mitra'  => $p->status_mitra,
                'siswa_diterima' => $list->where('status', PengajuanPkl::DITERIMA_MITRA)
                    ->sum(fn ($x) => 1 + $x->anggota->count()),
                'pengajuan'     => $list->map(fn ($x) => $this->serializePengajuan($x))->values(),
            ];
        });

        return Inertia::render('Admin/Mitra', ['mitra' => $mitra->values()]);
    }

    public function storePerusahaan(Request $request)
    {
        $validated = $request->validate([
            'nama_perusahaan' => 'required|string|max:255',
            'alamat_lengkap'  => 'required|string',
            'kontak_hrd'      => 'required|string|max:255',
            'kuota_tersedia'  => 'required|integer|min:1',
        ]);

        Perusahaan::create($validated + ['status_mitra' => 'aktif']);

        return back()->with('success', 'Perusahaan mitra berhasil ditambahkan!');
    }

    /** Membantu Admin membuatkan akun login HRD untuk perusahaan tertentu */
    public function buatAkunHrd(Request $request, $id)
    {
        $request->validate([
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $perusahaan = Perusahaan::findOrFail($id);

        $user = User::create([
            'name'     => 'HRD ' . $perusahaan->nama_perusahaan,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'perusahaan',
            'no_hp'    => $perusahaan->kontak_hrd,
        ]);

        $perusahaan->update(['user_id' => $user->id]);

        return back()->with('success', "Akun HRD untuk {$perusahaan->nama_perusahaan} berhasil dibuat!");
    }

    public function toggleMitra($id)
    {
        $perusahaan = Perusahaan::findOrFail($id);
        $perusahaan->status_mitra = $perusahaan->status_mitra === 'aktif' ? 'nonaktif' : 'aktif';
        $perusahaan->save();

        return back()->with('success', "{$perusahaan->nama_perusahaan} sekarang {$perusahaan->status_mitra}.");
    }

    // =========================================================
    // 3. JADWAL PKL (kalender)
    // =========================================================
    public function jadwal()
    {
        $jadwal = $this->allPengajuan()
            ->filter(fn ($p) => in_array($p->status, self::STATUS_DISETUJUI) && $p->tgl_mulai_pkl && $p->tgl_selesai_pkl)
            ->map(fn ($p) => $this->serializePengajuan($p))
            ->values();

        return Inertia::render('Admin/Jadwal', ['jadwal' => $jadwal]);
    }

    // =========================================================
    // 4. ANALISIS PEMINAT
    // =========================================================
    public function analisis()
    {
        $pengajuan = $this->allPengajuan()->groupBy('perusahaan_id');

        $rows = Perusahaan::all()->map(function ($p) use ($pengajuan) {
            $list = $pengajuan->get($p->id, collect());
            $siswa = fn ($statuses) => $list->whereIn('status', $statuses)->sum(fn ($x) => 1 + $x->anggota->count());

            return [
                'id'              => $p->id,
                'nama'            => $p->nama_perusahaan,
                'status_mitra'    => $p->status_mitra,
                'kuota_sisa'      => (int) $p->kuota_tersedia,
                'total_pengajuan' => $list->count(),
                'peminat'         => $list->sum(fn ($x) => 1 + $x->anggota->count()),
                'pending'         => $siswa([PengajuanPkl::PENDING]),
                'disetujui'       => $siswa([PengajuanPkl::DISETUJUI_HUBIN]),
                'diterima'        => $siswa([PengajuanPkl::DITERIMA_MITRA]),
                'ditolak'         => $siswa(self::STATUS_DITOLAK),
            ];
        })->sortByDesc('peminat')->values();

        return Inertia::render('Admin/Analisis', [
            'perusahaan'   => $rows,
            'total_peminat' => $rows->sum('peminat'),
        ]);
    }

    // =========================================================
    // 5. DATA SISWA (spreadsheet)
    // =========================================================
    public function siswa()
    {
        $map = [];
        foreach ($this->allPengajuan() as $p) {
            $ids = $p->anggota->pluck('siswa_id')->push($p->ketua_siswa_id)->unique();
            foreach ($ids as $sid) {
                $map[$sid][] = $p;
            }
        }

        $rows = User::where('role', 'siswa')->orderBy('kelas')->orderBy('name')->get()
            ->map(function ($s) use ($map) {
                $list = collect($map[$s->id] ?? []);

                $pilih = $list->first(fn ($p) => ! in_array($p->status, self::STATUS_DITOLAK))
                    ?? $list->first();

                return [
                    'id'         => $s->id,
                    'nama'       => $s->name,
                    'nis'        => $s->nis_nip,
                    'kelas'      => $s->kelas ?: '-',
                    'jurusan'    => $this->jurusanDariKelas($s->kelas),
                    'perusahaan' => $pilih?->perusahaan?->nama_perusahaan,
                    'status'     => $pilih?->status ?? 'belum_mengajukan',
                    'alasan'     => $pilih?->alasan_penolakan,
                ];
            });

        return Inertia::render('Admin/Siswa', ['siswa' => $rows->values()]);
    }

    // =========================================================
    // HELPER
    // =========================================================

    private function allPengajuan(): Collection
    {
        return PengajuanPkl::with(['ketua', 'perusahaan', 'anggota.siswa'])->latest()->get();
    }

    private function serializePengajuan(PengajuanPkl $p): array
    {
        $siswa = collect([$p->ketua])
            ->filter()
            ->map(fn ($u) => $this->serializeSiswa($u, true))
            ->concat(
                $p->anggota->map(fn ($a) => $a->siswa)->filter()
                    ->map(fn ($u) => $this->serializeSiswa($u, false))
            )
            ->values();

        return [
            'id'              => $p->id,
            'kode'            => $p->kode_pengajuan,
            'status'          => $p->status,
            'alasan'          => $p->alasan_penolakan,
            'siswa'           => $siswa,
            'perusahaan_id'   => $p->perusahaan_id,
            'perusahaan'      => $p->perusahaan?->nama_perusahaan,
            'kontak_hrd'      => $p->perusahaan?->kontak_hrd,
            'tgl_pengajuan'   => Carbon::parse($p->tgl_pengajuan ?? $p->created_at)->format('Y-m-d'),
            'tgl_mulai'       => $p->tgl_mulai_pkl ? Carbon::parse($p->tgl_mulai_pkl)->format('Y-m-d') : null,
            'tgl_selesai'     => $p->tgl_selesai_pkl ? Carbon::parse($p->tgl_selesai_pkl)->format('Y-m-d') : null,
        ];
    }

    private function serializeSiswa(User $u, bool $ketua): array
    {
        return [
            'id'      => $u->id,
            'nama'    => $u->name,
            'kelas'   => $u->kelas ?: '-',
            'jurusan' => $this->jurusanDariKelas($u->kelas),
            'ketua'   => $ketua,
        ];
    }

    private function jurusanDariKelas(?string $kelas): string
    {
        if (! $kelas || ! preg_match('/^(?:XII|XI|X)\s+(.+?)\s*\d*$/i', trim($kelas), $m)) {
            return '-';
        }

        $kode = strtoupper(trim($m[1]));

        return self::JURUSAN[$kode] ?? $kode;
    }
}