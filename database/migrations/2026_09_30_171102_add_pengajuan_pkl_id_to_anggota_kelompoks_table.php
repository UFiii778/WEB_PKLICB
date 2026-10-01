<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('anggota_kelompoks', function (Blueprint $table) {
            if (!Schema::hasColumn('anggota_kelompoks', 'pengajuan_pkl_id')) {
                $table->foreignId('pengajuan_pkl_id')->nullable()->constrained('pengajuan_pkls')->onDelete('cascade');
            }
        });
    }

    public function down(): void
    {
        Schema::table('anggota_kelompoks', function (Blueprint $table) {
            $table->dropForeign(['pengajuan_pkl_id']);
            $table->dropColumn('pengajuan_pkl_id');
        });
    }
};
