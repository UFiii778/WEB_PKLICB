<?php

namespace App\Http\Controllers;

use App\Models\PengajuanPkl;
use App\Models\Perusahaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MitraController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();

        // Cari data perusahaan berdasarkan nomor kontak HRD / Akun Mitra
        $perusahaan = Perusahaan::where('kontak_hrd', $user->no_hp)->first();

        if (!$perusahaan) {
            $perusahaan = Perusahaan::first();
        }

        // Ambil daftar pengajuan yang sudah disetujui Admin Hubin
        $pengajuanList = PengajuanPkl::with(['ketua', 'anggota.siswa'])
            ->where('perusahaan_id', $perusahaan->id ?? 0)
            ->whereIn('status', ['disetujui_hubin', 'diterima_mitra', 'ditolak_mitra'])
            ->latest()
            ->get();

        return view('mitra.dashboard', compact('perusahaan', 'pengajuanList'));
    }

    public function konfirmasi(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:diterima_mitra,ditolak_mitra'
        ]);

        $pengajuan = PengajuanPkl::findOrFail($id);
        $pengajuan->status = $request->status;
        $pengajuan->save();

        // Kurangi kuota perusahaan jika diterima
        if ($request->status === 'diterima_mitra') {
            $totalSiswa = 1 + $pengajuan->anggota->count();
            $perusahaan = Perusahaan::findOrFail($pengajuan->perusahaan_id);
            $perusahaan->kuota_tersedia = max(0, $perusahaan->kuota_tersedia - $totalSiswa);
            $perusahaan->save();
        }

        $statusText = $request->status === 'diterima_mitra' ? 'diterima' : 'ditolak';
        return redirect()->back()->with('success', "Pengajuan berhasil di-{$statusText}!");
    }
}