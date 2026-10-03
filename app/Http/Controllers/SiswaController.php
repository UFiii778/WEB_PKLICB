<?php

namespace App\Http\Controllers;

use App\Models\AnggotaKelompok;
use App\Models\PengajuanPkl;
use App\Models\Perusahaan;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SiswaController extends Controller
{
    private const STATUS_DISETUJUI = [
        PengajuanPkl::DISETUJUI_HUBIN,
        PengajuanPkl::DITERIMA_MITRA,
    ];

    private function currentPengajuan(?int $userId = null)
    {
        $userId ??= Auth::id();

        return PengajuanPkl::with(['ketua', 'perusahaan', 'anggota.siswa'])
            ->where(function ($query) use ($userId) {
                $query->where('ketua_siswa_id', $userId)
                    ->orWhereHas('anggota', function ($memberQuery) use ($userId) {
                        $memberQuery->where('siswa_id', $userId);
                    });
            })
            ->latest('id')
            ->first();
    }

    private function serializePengajuan(?PengajuanPkl $p): ?array
    {
        if (! $p) {
            return null;
        }

        $step = match ($p->status) {
            PengajuanPkl::PENDING => 1,
            PengajuanPkl::DISETUJUI_HUBIN => 2,
            PengajuanPkl::DITERIMA_MITRA => 3,
            default => 1,
        };

        return [
            'id'             => $p->id,
            'kode'           => $p->kode_pengajuan,
            'status'         => $p->status,
            'status_label'   => match ($p->status) {
                PengajuanPkl::PENDING => 'Menunggu Validasi Hubin',
                PengajuanPkl::DISETUJUI_HUBIN => 'Disetujui Hubin',
                PengajuanPkl::DITERIMA_MITRA => 'Diterima Perusahaan',
                PengajuanPkl::DITOLAK_HUBIN => 'Ditolak Hubin',
                PengajuanPkl::DITOLAK_MITRA => 'Ditolak Perusahaan',
                default => ucfirst($p->status),
            },
            'step'           => $step,
            'ditolak'        => in_array($p->status, [PengajuanPkl::DITOLAK_HUBIN, PengajuanPkl::DITOLAK_MITRA]),
            'alasan'         => $p->alasan_penolakan,
            'perusahaan_id'  => $p->perusahaan_id,
            'perusahaan'     => $p->perusahaan?->nama_perusahaan,
            'alamat'         => $p->perusahaan?->alamat_lengkap,
            'kontak'         => $p->perusahaan?->kontak_hrd,
            'tgl_pengajuan' => $p->tgl_pengajuan
                ? \Carbon\Carbon::parse($p->tgl_pengajuan)->format('Y-m-d')
                : ($p->created_at
                    ? \Carbon\Carbon::parse($p->created_at)->format('Y-m-d')
                    : null),

            'tgl_mulai' => $p->tgl_mulai_pkl
                ? \Carbon\Carbon::parse($p->tgl_mulai_pkl)->format('Y-m-d')
                : null,

            'tgl_selesai' => $p->tgl_selesai_pkl
                ? \Carbon\Carbon::parse($p->tgl_selesai_pkl)->format('Y-m-d')
                : null,
            'ketua'          => $p->ketua ? [
                'id' => $p->ketua->id,
                'nama' => $p->ketua->name,
                'kelas' => $p->ketua->kelas,
            ] : null,
            'anggota'        => $p->anggota->map(fn($a) => [
                'id' => $a->siswa_id,
                'nama' => $a->siswa?->name,
                'kelas' => $a->siswa?->kelas,
            ])->filter(fn($a) => $a['nama'])->values()->all(),
        ];
    }

    public function dashboard()
    {
        $user = Auth::user();
        $pengajuan = $this->currentPengajuan($user->id);

        return Inertia::render('Siswa/Dashboard', [
            'pengajuan' => $this->serializePengajuan($pengajuan),
            'perusahaanList' => $this->perusahaanList(),
        ]);
    }

    public function mitra()
    {
        return Inertia::render('Siswa/Mitra', [
            'perusahaanList' => $this->perusahaanList(),
            'pengajuan' => $this->serializePengajuan($this->currentPengajuan()),
            'daftarSiswa' => $this->daftarSiswa(),
        ]);
    }

    public function pengajuan()
    {
        return Inertia::render('Siswa/Pengajuan', [
            'pengajuan' => $this->serializePengajuan($this->currentPengajuan()),
        ]);
    }

    public function jadwal()
    {
        $pengajuan = $this->currentPengajuan();

        return Inertia::render('Siswa/Jadwal', [
            'pengajuan' => $this->serializePengajuan($pengajuan),
        ]);
    }

    public function cetakSurat($id)
    {
        $pengajuan = PengajuanPkl::with(['ketua', 'perusahaan', 'anggota.siswa'])
            ->findOrFail($id);

        $userId = Auth::id();
        $terlibat = $pengajuan->ketua_siswa_id === $userId
            || $pengajuan->anggota->contains('siswa_id', $userId);

        if (! $terlibat) {
            abort(403);
        }

        if (! in_array($pengajuan->status, self::STATUS_DISETUJUI)) {
            abort(403, 'Surat pengantar belum dapat dicetak karena pengajuan belum disetujui Hubin.');
        }

        return Pdf::loadView('admin.surat_pengantar_pdf', compact('pengajuan'))
            ->setPaper('a4')
            ->stream('Surat-Pengantar-' . $pengajuan->kode_pengajuan . '.pdf');
    }

    public function storePengajuan(Request $request)
    {
        $validated = $request->validate([
            'perusahaan_id' => ['required', 'exists:perusahaans,id'],
            'tgl_mulai_pkl' => ['required', 'date', 'after_or_equal:today'],
            'tgl_selesai_pkl' => ['required', 'date', 'after:tgl_mulai_pkl'],
            'anggota_id' => ['nullable', 'array', 'max:2'],
            'anggota_id.*' => ['integer', 'distinct', 'exists:users,id'],
        ]);

        $userId = Auth::id();
        $perusahaan = Perusahaan::findOrFail($validated['perusahaan_id']);

        if ($perusahaan->status_mitra !== 'aktif') {
            return back()->with('error', 'Perusahaan tersebut sedang nonaktif.');
        }

        if ((int) $perusahaan->kuota_tersedia <= 0) {
            return back()->with('error', 'Maaf, kuota perusahaan ini sudah habis!');
        }

        // Siswa hanya boleh punya satu pengajuan aktif, baik sebagai ketua maupun anggota.
        $hasActive = PengajuanPkl::where(function ($query) use ($userId) {
            $query->where('ketua_siswa_id', $userId)
                ->orWhereHas('anggota', fn($q) => $q->where('siswa_id', $userId));
        })->whereIn('status', [
            PengajuanPkl::PENDING,
            PengajuanPkl::DISETUJUI_HUBIN,
            PengajuanPkl::DITERIMA_MITRA,
        ])->exists();

        if ($hasActive) {
            return back()->with('error', 'Anda sudah memiliki pengajuan PKL yang sedang berjalan.');
        }

        $anggotaIds = collect($validated['anggota_id'] ?? [])->map(fn($id) => (int) $id)->unique()->values();

        if ($anggotaIds->contains($userId)) {
            return back()->with('error', 'Ketua tidak boleh dipilih lagi sebagai anggota kelompok.');
        }

        if ($anggotaIds->isNotEmpty()) {
            $validStudents = User::whereIn('id', $anggotaIds)
                ->where('role', 'siswa')
                ->pluck('id');

            if ($validStudents->count() !== $anggotaIds->count()) {
                return back()->with('error', 'Anggota kelompok harus merupakan akun siswa yang valid.');
            }

            $memberHasActive = PengajuanPkl::whereIn('status', [
                PengajuanPkl::PENDING,
                PengajuanPkl::DISETUJUI_HUBIN,
                PengajuanPkl::DITERIMA_MITRA,
            ])->where(function ($query) use ($anggotaIds) {
                $query->whereIn('ketua_siswa_id', $anggotaIds)
                    ->orWhereHas('anggota', fn($q) => $q->whereIn('siswa_id', $anggotaIds));
            })->exists();

            if ($memberHasActive) {
                return back()->with('error', 'Salah satu anggota sudah memiliki pengajuan PKL yang sedang berjalan.');
            }
        }

        $pengajuan = DB::transaction(function () use ($validated, $userId, $anggotaIds, $perusahaan) {
            $pengajuan = PengajuanPkl::create([
                'kode_pengajuan' => 'PKL-' . strtoupper(Str::random(6)),
                'ketua_siswa_id' => $userId,
                'perusahaan_id' => $perusahaan->id,
                'tgl_pengajuan' => now()->toDateString(),
                'tgl_mulai_pkl' => $validated['tgl_mulai_pkl'],
                'tgl_selesai_pkl' => $validated['tgl_selesai_pkl'],
                'status' => PengajuanPkl::PENDING,
            ]);

            foreach ($anggotaIds as $siswaId) {
                AnggotaKelompok::create([
                    'pengajuan_id' => $pengajuan->id,
                    'siswa_id' => $siswaId,
                ]);
            }

            return $pengajuan;
        });

        return redirect()->route('siswa.pengajuan')->with('success', "Pengajuan {$pengajuan->kode_pengajuan} berhasil dikirim.");
    }

    private function perusahaanList()
    {
        return Perusahaan::where('status_mitra', 'aktif')
            ->orderBy('nama_perusahaan')
            ->get(['id', 'nama_perusahaan', 'alamat_lengkap', 'kontak_hrd', 'kuota_tersedia'])
            ->map(fn($item) => [
                'id' => $item->id,
                'nama' => $item->nama_perusahaan,
                'alamat' => $item->alamat_lengkap ?: 'Alamat belum diisi',
                'kontak' => $item->kontak_hrd ?: '-',
                'kuota' => (int) $item->kuota_tersedia,
            ])->values();
    }

    private function daftarSiswa()
    {
        return User::where('role', 'siswa')
            ->whereKeyNot(Auth::id())
            ->orderBy('name')
            ->get(['id', 'name', 'kelas', 'nis_nip'])
            ->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'kelas' => $s->kelas ?: '-',
                'nis' => $s->nis_nip ?: '-',
            ])->values();
    }
}
