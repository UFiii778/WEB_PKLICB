<?php

namespace App\Http\Controllers;

use App\Models\PengajuanPkl;
use App\Models\Perusahaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class MitraController extends Controller
{
    /**
     * Ambil perusahaan milik akun HRD berdasarkan nomor HP.
     * Struktur project saat ini menghubungkan akun perusahaan
     * dengan data perusahaan melalui kontak_hrd = users.no_hp.
     */
    private function perusahaanMilikUser()
    {
        return Perusahaan::where('kontak_hrd', Auth::user()->no_hp)->first();
    }

    public function dashboard()
    {
        $user = Auth::user();
        $perusahaan = $this->perusahaanMilikUser();

        if (! $perusahaan) {
            return view('mitra.dashboard', [
                'perusahaan' => null,
                'pengajuanList' => collect(),
                'stats' => [
                    'menunggu' => 0,
                    'diterima' => 0,
                    'ditolak' => 0,
                    'siswa_aktif' => 0,
                    'kuota' => 0,
                ],
                'user' => $user,
            ]);
        }

        $pengajuanList = PengajuanPkl::with([
            'ketua',
            'anggota.siswa',
        ])
            ->where('perusahaan_id', $perusahaan->id)
            ->whereIn('status', [
                PengajuanPkl::DISETUJUI_HUBIN,
                PengajuanPkl::DITERIMA_MITRA,
                PengajuanPkl::DITOLAK_MITRA,
            ])
            ->latest('id')
            ->get();

        $stats = [
            'menunggu' => $pengajuanList->where('status', PengajuanPkl::DISETUJUI_HUBIN)->count(),
            'diterima' => $pengajuanList->where('status', PengajuanPkl::DITERIMA_MITRA)->count(),
            'ditolak' => $pengajuanList->where('status', PengajuanPkl::DITOLAK_MITRA)->count(),
            'siswa_aktif' => $pengajuanList
                ->where('status', PengajuanPkl::DITERIMA_MITRA)
                ->sum(fn ($p) => 1 + $p->anggota->count()),
            'kuota' => (int) $perusahaan->kuota_tersedia,
        ];

        return view('mitra.dashboard', compact('perusahaan', 'pengajuanList', 'stats', 'user'));
    }

    public function konfirmasi(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in([
                PengajuanPkl::DITERIMA_MITRA,
                PengajuanPkl::DITOLAK_MITRA,
            ])],
            'alasan_penolakan' => [
                'nullable',
                'string',
                'min:5',
                'max:500',
                Rule::requiredIf(fn () => $request->status === PengajuanPkl::DITOLAK_MITRA),
            ],
        ], [
            'alasan_penolakan.required' => 'Alasan penolakan wajib diisi.',
            'alasan_penolakan.min' => 'Alasan penolakan minimal 5 karakter.',
            'alasan_penolakan.max' => 'Alasan penolakan maksimal 500 karakter.',
        ]);

        $perusahaan = $this->perusahaanMilikUser();
        abort_unless($perusahaan, 403, 'Akun ini belum terhubung ke data perusahaan.');

        DB::transaction(function () use ($validated, $id, $perusahaan) {
            $pengajuan = PengajuanPkl::with('anggota')
                ->where('id', $id)
                ->where('perusahaan_id', $perusahaan->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($pengajuan->status !== PengajuanPkl::DISETUJUI_HUBIN) {
                abort(422, 'Pengajuan ini sudah diproses atau belum disetujui Hubin.');
            }

            if ($validated['status'] === PengajuanPkl::DITERIMA_MITRA) {
                $jumlahSiswa = 1 + $pengajuan->anggota->count();

                $perusahaan = Perusahaan::whereKey($perusahaan->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                if ((int) $perusahaan->kuota_tersedia < $jumlahSiswa) {
                    abort(422, "Kuota perusahaan tidak cukup. Pengajuan ini membutuhkan {$jumlahSiswa} slot siswa.");
                }

                $perusahaan->decrement('kuota_tersedia', $jumlahSiswa);
            }

            $pengajuan->update([
                'status' => $validated['status'],
                'alasan_penolakan' => $validated['status'] === PengajuanPkl::DITOLAK_MITRA
                    ? trim($validated['alasan_penolakan'])
                    : null,
            ]);
        });

        return back()->with(
            'success',
            $validated['status'] === PengajuanPkl::DITERIMA_MITRA
                ? 'Pengajuan berhasil diterima. Kuota perusahaan telah diperbarui.'
                : 'Pengajuan berhasil ditolak.'
        );
    }

    public function updateProfile(Request $request)
    {
        $perusahaan = $this->perusahaanMilikUser();
        abort_unless($perusahaan, 403, 'Akun ini belum terhubung ke data perusahaan.');

        $validated = $request->validate([
            'nama_perusahaan' => ['required', 'string', 'max:255'],
            'alamat_lengkap' => ['required', 'string', 'max:2000'],
            'kontak_hrd' => ['required', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($validated, $perusahaan) {
            $perusahaan->update($validated);

            // Agar hubungan akun HRD <-> perusahaan tetap konsisten
            // setelah nomor kontak diubah.
            Auth::user()->update([
                'no_hp' => $validated['kontak_hrd'],
            ]);
        });

        return back()->with('success', 'Profil perusahaan berhasil diperbarui.');
    }
}
