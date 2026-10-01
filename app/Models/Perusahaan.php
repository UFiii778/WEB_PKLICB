<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Perusahaan extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    /**
     * Relasi ke model PengajuanPkl (1 Perusahaan bisa punya banyak Pengajuan PKL)
     */
    public function pengajuanPkl()
    {
        return $this->hasMany(PengajuanPkl::class, 'perusahaan_id');
    }
}