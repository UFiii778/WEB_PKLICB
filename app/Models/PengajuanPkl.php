<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengajuanPkl extends Model
{
    use HasFactory;

    public const PENDING         = 'pending';
    public const DISETUJUI_HUBIN = 'disetujui_hubin';
    public const DITERIMA_MITRA  = 'diterima_mitra';
    public const DITOLAK_HUBIN   = 'ditolak_hubin';
    public const DITOLAK_MITRA   = 'ditolak_mitra';

    protected $guarded = ['id'];

    // Relasi ke User/Siswa (Ketua yang mengajukan)
    public function siswa()
    {
        return $this->belongsTo(User::class, 'ketua_siswa_id');
    }

    public function ketua()
    {
        return $this->belongsTo(User::class, 'ketua_siswa_id');
    }

    // Relasi ke Perusahaan
    public function perusahaan()
    {
        return $this->belongsTo(Perusahaan::class, 'perusahaan_id');
    }

    // Relasi ke Anggota Kelompok
    public function anggota()
    {
        return $this->hasMany(AnggotaKelompok::class, 'pengajuan_id');
    }

    // Alias lama supaya kode yang sudah ada tetap jalan
    public function anggotaKelompok()
    {
        return $this->anggota();
    }
}
