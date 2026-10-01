<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Catatan: file ini sebelumnya berisi migrasi "alter" sehingga instalasi baru
     * gagal (tabel belum ada). Sekarang kembali membuat tabel utuh. Database yang
     * sudah termigrasi tidak terpengaruh (migrasi ini sudah tercatat), dan
     * penyesuaian untuk database lama ada di migrasi 2026_10_01_000000.
     */
    public function up(): void
    {
        if (Schema::hasTable('pengajuan_pkls')) {
            return;
        }

        Schema::create('pengajuan_pkls', function (Blueprint $table) {
            $table->id();
            $table->string('kode_pengajuan')->unique();
            $table->foreignId('ketua_siswa_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('perusahaan_id')->constrained('perusahaans')->onDelete('cascade');
            $table->date('tgl_pengajuan')->nullable();
            $table->date('tgl_mulai_pkl')->nullable();
            $table->date('tgl_selesai_pkl')->nullable();
            // pending | disetujui_hubin | diterima_mitra | ditolak_hubin | ditolak_mitra
            $table->string('status', 30)->default('pending');
            $table->text('alasan_penolakan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengajuan_pkls');
    }
};
