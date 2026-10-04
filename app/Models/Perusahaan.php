<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Perusahaan extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', // <--- Tambahkan kolom ini
        'nama_perusahaan',
        'alamat_lengkap',
        'kontak_hrd',
        'kuota_tersedia',
        'status_mitra',
    ];

    // Relasi ke User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke Pengajuan PKL
    public function pengajuanPkl()
    {
        return $this->hasMany(PengajuanPkl::class);
    }
}