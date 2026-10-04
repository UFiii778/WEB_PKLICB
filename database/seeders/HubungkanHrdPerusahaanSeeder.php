<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Perusahaan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class HubungkanHrdPerusahaanSeeder extends Seeder
{
    public function run(): void
    {
        $perusahaans = Perusahaan::whereNull('user_id')->get();

        foreach ($perusahaans as $index => $perusahaan) {
            // Buat email otomatis berdasarkan nama perusahaan
            $slug = Str::slug($perusahaan->nama_perusahaan);
            $email = "hrd@{$slug}.com";

            // Buat User HRD baru jika belum ada
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name'     => 'HRD ' . $perusahaan->nama_perusahaan,
                    'role'     => 'perusahaan',
                    'password' => Hash::make('password123'), // Default password
                    'no_hp'    => $perusahaan->kontak_hrd,
                ]
            );

            // Hubungkan user_id ke perusahaan
            $perusahaan->update(['user_id' => $user->id]);
        }
    }
}