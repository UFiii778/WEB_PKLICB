<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Siswa - SIM-PKL SMK ICB Cinta Niaga</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>

<body class="bg-slate-50 min-h-screen text-slate-800" x-data="{ openModal: false, selectedPerusahaan: null, namaPerusahaan: '' }">

    <!-- Navbar -->
    <nav class="bg-indigo-700 text-white shadow-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <span class="font-black text-xl tracking-wider">SIM-PKL</span>
                <span class="text-xs bg-indigo-500 px-2.5 py-1 rounded-full font-semibold">SMK ICB Cinta Niaga</span>
            </div>
            <div class="flex items-center gap-4">
                <div class="text-right hidden md:block">
                    <p class="font-semibold text-sm">{{ Auth::user()->name }}</p>
                    <p class="text-xs text-indigo-200">{{ Auth::user()->kelas ?? 'Siswa' }} | {{ Auth::user()->nis_nip }}</p>
                </div>
                <form action="{{ route('logout') }}" method="POST">
                    @csrf
                    <button type="submit" class="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition">
                        Logout
                    </button>
                </form>
            </div>
        </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        <!-- Flash Messages -->
        @if(session('success'))
        <div class="bg-emerald-100 border border-emerald-400 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium">
            {{ session('success') }}
        </div>
        @endif
        @if(session('error'))
        <div class="bg-rose-100 border border-rose-400 text-rose-800 px-4 py-3 rounded-xl text-sm font-medium">
            {{ session('error') }}
        </div>
        @endif

        <!-- Status Pengajuan Aktif -->
        @if($pengajuanAktif)
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 9 0 0118 0z"></path>
                </svg>
                Status Pengajuan PKL Anda
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span class="text-xs text-slate-500 block">Kode Pengajuan</span>
                    <span class="font-bold text-indigo-600">{{ $pengajuanAktif->kode_pengajuan }}</span>
                </div>
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span class="text-xs text-slate-500 block">Perusahaan Tujuan</span>
                    <span class="font-bold text-slate-700">{{ $pengajuanAktif->perusahaan->nama_perusahaan }}</span>
                </div>
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span class="text-xs text-slate-500 block">Status Saat Ini</span>
                    <span class="inline-block mt-1 px-3 py-1 text-xs font-bold rounded-full 
                        @if($pengajuanAktif->status == 'pending') bg-amber-100 text-amber-800 
                        @elseif($pengajuanAktif->status == 'disetujui_hubin') bg-blue-100 text-blue-800 
                        @elseif($pengajuanAktif->status == 'diterima_mitra') bg-emerald-100 text-emerald-800 
                        @else bg-rose-100 text-rose-800 @endif">
                        {{ strtoupper(str_replace('_', ' ', $pengajuanAktif->status)) }}
                    </span>
                </div>
            </div>

            @if($pengajuanAktif->status == 'ditolak_hubin')
            <div class="mb-6 bg-rose-50 border border-rose-200 rounded-xl p-4">
                <span class="text-xs font-bold text-rose-700 block mb-1">Pengajuan ditolak oleh Hubin</span>
                <p class="text-sm text-rose-800">Alasan: {{ $pengajuanAktif->alasan_penolakan ?: 'Tidak ada keterangan.' }}</p>
                <p class="text-xs text-rose-600 mt-2">Silakan ajukan ulang ke perusahaan mitra lain pada katalog di bawah.</p>
            </div>
            @endif

            <!-- Visual Progress Tracker -->
            <div class="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-xl">
                <div class="flex items-center gap-2 text-xs font-bold text-indigo-600">
                    <span class="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">1</span>
                    Pengajuan Dikirim
                </div>
                <div class="h-0.5 w-full md:w-16 bg-slate-300"></div>
                <div class="flex items-center gap-2 text-xs font-bold {{ in_array($pengajuanAktif->status, ['disetujui_hubin', 'diterima_mitra']) ? 'text-indigo-600' : 'text-slate-400' }}">
                    <span class="w-6 h-6 rounded-full {{ in_array($pengajuanAktif->status, ['disetujui_hubin', 'diterima_mitra']) ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-600' }} flex items-center justify-center">2</span>
                    Disetujui Hubin
                </div>
                <div class="h-0.5 w-full md:w-16 bg-slate-300"></div>
                <div class="flex items-center gap-2 text-xs font-bold {{ $pengajuanAktif->status == 'diterima_mitra' ? 'text-emerald-600' : 'text-slate-400' }}">
                    <span class="w-6 h-6 rounded-full {{ $pengajuanAktif->status == 'diterima_mitra' ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600' }} flex items-center justify-center">3</span>
                    Konfirmasi Perusahaan
                </div>
            </div>
        </div>
        @endif

        <!-- Katalog Perusahaan -->
        <div>
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-slate-800">Katalog Perusahaan Mitra</h1>
                <p class="text-sm text-slate-500">Pilih mitra tempat PKL yang tersedia untuk mengajukan permohonan.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @foreach($perusahaan as $item)
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition duration-200">
                    <div>
                        <div class="flex justify-between items-start mb-3">
                            <h3 class="font-bold text-lg text-slate-800 line-clamp-1">{{ $item->nama_perusahaan }}</h3>
                            <span class="px-2.5 py-1 text-xs font-bold rounded-full {{ $item->kuota_tersedia > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800' }}">
                                Kuota: {{ $item->kuota_tersedia }}
                            </span>
                        </div>
                        <p class="text-xs text-slate-500 mb-4 line-clamp-2">{{ $item->alamat_lengkap }}</p>
                        <p class="text-xs text-slate-600 font-medium mb-6">Kontak: {{ $item->kontak_hrd }}</p>
                    </div>

                    <!-- Tombol Pengajuan (Disabled jika kuota 0 atau siswa sudah ada pengajuan) -->
                    @if($item->kuota_tersedia > 0)
                    <button
                        @click="openModal = true; selectedPerusahaan = {{ $item->id }}; namaPerusahaan = '{{ $item->nama_perusahaan }}'"
                        {{ $pengajuanAktif ? 'disabled' : '' }}
                        class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ $pengajuanAktif ? 'Pengajuan Sedang Berjalan' : 'Ajukan Tempat PKL' }}
                    </button>
                    @else
                    <button disabled class="w-full py-2.5 bg-slate-200 text-slate-400 text-sm font-semibold rounded-xl cursor-not-allowed">
                        Kuota Habis
                    </button>
                    @endif
                </div>
                @endforeach
            </div>
        </div>
    </div>

    <!-- Modal Form Pengajuan -->
    <div x-show="openModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" x-cloak>
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4" @click.outside="openModal = false">
            <div class="flex justify-between items-center border-b pb-3">
                <h3 class="font-bold text-slate-800 text-lg">Form Pengajuan PKL</h3>
                <button @click="openModal = false" class="text-slate-400 hover:text-slate-600">&times;</button>
            </div>

            <form action="{{ route('siswa.pengajuan.store') }}" method="POST" class="space-y-4">
                @csrf
                <input type="hidden" name="perusahaan_id" :value="selectedPerusahaan">

                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Perusahaan Tujuan</label>
                    <input type="text" :value="namaPerusahaan" readonly class="w-full px-3 py-2 bg-slate-100 border rounded-xl text-sm font-bold text-slate-700">
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Tanggal Mulai</label>
                        <input type="date" name="tgl_mulai_pkl" required class="w-full px-3 py-2 border rounded-xl text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Tanggal Selesai</label>
                        <input type="date" name="tgl_selesai_pkl" required class="w-full px-3 py-2 border rounded-xl text-sm">
                    </div>
                </div>

                <!-- Opsi Tambah Anggota (Max 2 Anggota Tambahan, Total 3 Orang) -->
                <div class="border-t pt-3">
                    <label class="block text-xs font-bold text-slate-700 mb-1">Anggota Kelompok (Opsional, Max 2 Rekan)</label>
                    <p class="text-[11px] text-slate-500 mb-2">Kosongkan jika Anda mengajukan secara Mandiri/Individu.</p>

                    <div class="space-y-2">
                        <select name="anggota_id[]" class="w-full px-3 py-2 border rounded-xl text-sm bg-white">
                            <option value="">-- Pilih Anggota 1 (Opsional) --</option>
                            @foreach($daftarSiswa as $s)
                            <option value="{{ $s->id }}">{{ $s->name }} ({{ $s->kelas }})</option>
                            @endforeach
                        </select>

                        <select name="anggota_id[]" class="w-full px-3 py-2 border rounded-xl text-sm bg-white">
                            <option value="">-- Pilih Anggota 2 (Opsional) --</option>
                            @foreach($daftarSiswa as $s)
                            <option value="{{ $s->id }}">{{ $s->name }} ({{ $s->kelas }})</option>
                            @endforeach
                        </select>
                    </div>
                </div>

                <div class="flex justify-end gap-2 border-t pt-4">
                    <button type="button" @click="openModal = false" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Batal</button>
                    <button type="submit" class="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">Kirim Pengajuan</button>
                </div>
            </form>
        </div>
    </div>

</body>

</html>