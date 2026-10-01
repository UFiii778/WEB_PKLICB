<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Admin Hubin - SIM-PKL</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>

<body class="bg-slate-50 min-h-screen text-slate-800" x-data="{ modalPerusahaan: false }">

    <!-- Navbar -->
    <nav class="bg-blue-900 text-white shadow-md">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <span class="font-black text-xl tracking-wider text-amber-400">SIM-PKL</span>
                <span class="text-xs bg-blue-800 px-2.5 py-1 rounded-full font-semibold border border-blue-700">Admin Hubin</span>
            </div>
            <div class="flex items-center gap-4">
                <span class="font-semibold text-sm">{{ Auth::user()->name }}</span>
                <form action="{{ route('logout') }}" method="POST">
                    @csrf
                    <button type="submit" class="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition">
                        Logout
                    </button>
                </form>
            </div>
        </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">

        @if(session('success'))
        <div class="bg-emerald-100 border border-emerald-400 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium">{{ session('success') }}</div>
        @endif
        @if(session('error'))
        <div class="bg-rose-100 border border-rose-400 text-rose-800 px-4 py-3 rounded-xl text-sm font-medium">{{ session('error') }}</div>
        @endif

        <!-- Card Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <span class="text-xs text-slate-500 font-semibold block">Total Pengajuan</span>
                <span class="text-3xl font-black text-indigo-600">{{ $totalPengajuan }}</span>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <span class="text-xs text-slate-500 font-semibold block">Perusahaan Mitra</span>
                <span class="text-3xl font-black text-emerald-600">{{ $totalPerusahaan }}</span>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <span class="text-xs text-slate-500 font-semibold block">Total Siswa Terdaftar</span>
                <span class="text-3xl font-black text-amber-600">{{ $totalSiswa }}</span>
            </div>
        </div>

        <!-- Tabel Pengajuan Siswa & Aksi Admin -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-bold text-slate-800">Validasi Pengajuan PKL Siswa</h2>
                    <p class="text-xs text-slate-500">Approve pengajuan siswa untuk mengunduh Surat Pengantar PDF resmi.</p>
                </div>
                <button @click="modalPerusahaan = true" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition">
                    + Tambah Perusahaan Mitra
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 text-slate-500 text-xs font-semibold border-b border-slate-100">
                            <th class="p-4">Kode & Pelamar</th>
                            <th class="p-4">Perusahaan Tujuan</th>
                            <th class="p-4">Anggota</th>
                            <th class="p-4">Status</th>
                            <th class="p-4 text-center">Aksi Validasi / Surat</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-sm">
                        @forelse($pengajuanList as $item)
                        <tr class="hover:bg-slate-50/50">
                            <td class="p-4">
                                <span class="font-bold text-indigo-600 block">{{ $item->kode_pengajuan }}</span>
                                <span class="font-semibold text-slate-800">{{ $item->ketua->name }}</span>
                                <span class="text-xs text-slate-400 block">{{ $item->ketua->kelas }}</span>
                            </td>
                            <td class="p-4 font-medium text-slate-700">{{ $item->perusahaan->nama_perusahaan }}</td>
                            <td class="p-4 text-xs text-slate-500">
                                @if($item->anggota->count() > 0)
                                {{ $item->anggota->count() }} Orang Rekan
                                @else
                                Mandiri
                                @endif
                            </td>
                            <td class="p-4">
                                <span class="px-2.5 py-1 text-xs font-bold rounded-full 
                                    @if($item->status == 'pending') bg-amber-100 text-amber-800 
                                    @elseif($item->status == 'disetujui_hubin') bg-blue-100 text-blue-800 
                                    @elseif($item->status == 'diterima_mitra') bg-emerald-100 text-emerald-800 
                                    @else bg-rose-100 text-rose-800 @endif">
                                    {{ strtoupper(str_replace('_', ' ', $item->status)) }}
                                </span>
                            </td>
                            <td class="p-4 text-center">
                                <div class="flex justify-center items-center gap-2">
                                    @if($item->status == 'pending')
                                    <form action="{{ route('admin.pengajuan.status', $item->id) }}" method="POST">
                                        @csrf
                                        <input type="hidden" name="status" value="disetujui_hubin">
                                        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">Approve</button>
                                    </form>
                                    <form action="{{ route('admin.pengajuan.status', $item->id) }}" method="POST">
                                        @csrf
                                        <input type="hidden" name="status" value="ditolak_hubin">
                                        <button type="submit" class="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">Tolak</button>
                                    </form>
                                    @elseif(in_array($item->status, ['disetujui_hubin', 'diterima_mitra']))
                                    <a href="{{ route('admin.pengajuan.cetak', $item->id) }}" target="_blank" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                                        Cetak PDF
                                    </a>
                                    @else
                                    <span class="text-xs text-slate-400 italic">Ditolak</span>
                                    @endif
                                </div>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="5" class="p-8 text-center text-slate-400 text-xs">Belum ada pengajuan masuk.</td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Modal Tambah Perusahaan -->
    <div x-show="modalPerusahaan" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" x-cloak>
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4" @click.outside="modalPerusahaan = false">
            <h3 class="font-bold text-slate-800 text-lg border-b pb-2">Tambah Perusahaan Mitra</h3>
            <form action="{{ route('admin.perusahaan.store') }}" method="POST" class="space-y-3">
                @csrf
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Nama Perusahaan</label>
                    <input type="text" name="nama_perusahaan" required class="w-full px-3 py-2 border rounded-xl text-sm">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Alamat Lengkap</label>
                    <textarea name="alamat_lengkap" required class="w-full px-3 py-2 border rounded-xl text-sm" rows="2"></textarea>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Kontak HRD</label>
                        <input type="text" name="kontak_hrd" required class="w-full px-3 py-2 border rounded-xl text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Kuota Tempat</label>
                        <input type="number" name="kuota_tersedia" min="1" required class="w-full px-3 py-2 border rounded-xl text-sm">
                    </div>
                </div>
                <div class="flex justify-end gap-2 border-t pt-3">
                    <button type="button" @click="modalPerusahaan = false" class="px-4 py-2 text-xs font-semibold text-slate-600">Batal</button>
                    <button type="submit" class="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl">Simpan</button>
                </div>
            </form>
        </div>
    </div>

</body>

</html>