<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menyelaraskan tabel pengajuan_pkls dengan alur Hubin:
     *  - status menjadi string (bukan enum) agar bisa memuat
     *    pending, disetujui_hubin, diterima_mitra, ditolak_hubin, ditolak_mitra
     *  - kolom alasan_penolakan tersedia (wajib saat Hubin menolak)
     * Aman dijalankan berulang: setiap kolom dicek dulu.
     */
    public function up(): void
    {
        if (! Schema::hasTable('pengajuan_pkls')) {
            return;
        }

        Schema::table('pengajuan_pkls', function (Blueprint $table) {
            if (! Schema::hasColumn('pengajuan_pkls', 'alasan_penolakan')) {
                $table->text('alasan_penolakan')->nullable();
            }
        });

        if (Schema::hasColumn('pengajuan_pkls', 'status')) {
            Schema::table('pengajuan_pkls', function (Blueprint $table) {
                $table->string('status', 30)->default('pending')->change();
            });
        } else {
            Schema::table('pengajuan_pkls', function (Blueprint $table) {
                $table->string('status', 30)->default('pending');
            });
        }

        // Normalisasi nilai lama dari versi sebelumnya
        DB::table('pengajuan_pkls')->where('status', 'disetujui')->update(['status' => 'disetujui_hubin']);
        DB::table('pengajuan_pkls')->where('status', 'ditolak')->update(['status' => 'ditolak_hubin']);
    }

    public function down(): void
    {
        // Sengaja kosong: perubahan ini bersifat penyelarasan, tidak perlu dibalik.
    }
};
