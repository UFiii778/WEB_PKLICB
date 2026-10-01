<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'nis_nip',
        'name',
        'kelas',
        'email',
        'password',
        'role',
        'no_hp',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    /**
     * Pengajuan PKL yang dibuat siswa ini sebagai ketua.
     */
    public function pengajuan()
    {
        return $this->hasMany(PengajuanPkl::class, 'ketua_siswa_id');
    }

    /**
     * Keanggotaan siswa ini di kelompok pengajuan PKL lain.
     */
    public function anggotaKelompok()
    {
        return $this->hasMany(AnggotaKelompok::class, 'siswa_id');
    }
}
