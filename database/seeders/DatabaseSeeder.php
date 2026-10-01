<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Perusahaan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'nis_nip' => '198501012010011001',
            'name' => 'Admin Hubin',
            'kelas' => null,
            'email' => 'admin@hubin.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'no_hp' => '081234567890',
        ]);

        User::create([
            'nis_nip' => '23241001',
            'name' => 'Luthfi Abdillah',
            'kelas' => 'XII RPL 1',
            'email' => 'siswa@icb.com',
            'password' => Hash::make('password123'),
            'role' => 'siswa',
            'no_hp' => '089876543210',
        ]);

        User::create([
            'nis_nip' => 'MITRA-001',
            'name' => 'HRD PT Telkom Indonesia',
            'kelas' => null,
            'email' => 'hrd@telkom.com',
            'password' => Hash::make('password123'),
            'role' => 'perusahaan',
            'no_hp' => '082112233445',
        ]);

        Perusahaan::create([
            'nama_perusahaan' => 'PT Telkom Indonesia',
            'alamat_lengkap' => 'Jl. Japati No. 1, Bandung',
            'kontak_hrd' => '082112233445',
            'kuota_tersedia' => 5,
            'status_mitra' => 'aktif',
        ]);

        Perusahaan::create([
            'nama_perusahaan' => 'PT Bandung Digital Solution',
            'alamat_lengkap' => 'Jl. Asia Afrika No. 100, Bandung',
            'kontak_hrd' => '085678901234',
            'kuota_tersedia' => 0,
            'status_mitra' => 'aktif',
        ]);
    }
}