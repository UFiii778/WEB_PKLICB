<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Perusahaan;
use App\Models\PengajuanPkl;
use App\Models\AnggotaKelompok;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class SiswaController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();

        // 1. Ambil Katalog Perusahaan Aktif
        $perusahaan = Perusahaan::where('status_mitra', 'aktif')->get();

        // 2. Cek apakah siswa sudah punya pengajuan aktif
        $pengajuanAktif = PengajuanPkl::with(['perusahaan', 'anggota.siswa'])
            ->where('ketua_siswa_id', $user->id)
            ->orWhereHas('anggota', function ($query) use ($user) {
                $query->where('siswa_id', $user->id);
            })
            ->latest()
            ->first();

        // 3. Ambil daftar siswa lain untuk pilihan anggota kelompok (max 3 orang)
        $daftarSiswa = User::where('role', 'siswa')
            ->where('id', '!=', $user->id)
            ->get();

        return view('siswa.dashboard', compact('perusahaan', 'pengajuanAktif', 'daftarSiswa'));
    }

    public function storePengajuan(Request $request)
    {
        $request->validate([
            'perusahaan_id' => 'required|exists:perusahaans,id',
            'tgl_mulai_pkl' => 'required|date|after_or_equal:today',
            'tgl_selesai_pkl' => 'required|date|after:tgl_mulai_pkl',
            'anggota_id' => 'nullable|array|max:2', // Max 2 anggota tambahan (total 3 dengan ketua)
        ]);

        $perusahaan = Perusahaan::findOrFail($request->perusahaan_id);

        // Validasi Kuota
        if ($perusahaan->kuota_tersedia <= 0) {
            return back()->with('error', 'Maaf, kuota perusahaan ini sudah habis!');
        }

        // Cek apakah siswa sudah ada di pengajuan lain
        $existing = PengajuanPkl::where('ketua_siswa_id', Auth::id())
            ->whereIn('status', ['pending', 'disetujui_hubin', 'diterima_mitra'])
            ->exists();

        if ($existing) {
            return back()->with('error', 'Anda sudah memiliki pengajuan PKL yang sedang berjalan!');
        }

        // Generate Kode Pengajuan Unik
        $kodePengajuan = 'PKL-' . strtoupper(Str::random(6));

        // Simpan Data Pengajuan Utama
        $pengajuan = PengajuanPkl::create([
            'kode_pengajuan' => $kodePengajuan,
            'ketua_siswa_id' => Auth::id(),
            'perusahaan_id' => $perusahaan->id,
            'tgl_pengajuan' => now(),
            'tgl_mulai_pkl' => $request->tgl_mulai_pkl,
            'tgl_selesai_pkl' => $request->tgl_selesai_pkl,
            'status' => 'pending',
        ]);

        // Simpan Anggota Kelompok jika ada
        if ($request->has('anggota_id')) {
            foreach ($request->anggota_id as $siswaId) {
                if ($siswaId) {
                    AnggotaKelompok::create([
                        'pengajuan_id' => $pengajuan->id,
                        'siswa_id' => $siswaId,
                    ]);
                }
            }
        }

        return redirect()->back()->with('success', 'Pengajuan PKL berhasil dikirim! Silakan tunggu konfirmasi Admin Hubin.');
    }
}