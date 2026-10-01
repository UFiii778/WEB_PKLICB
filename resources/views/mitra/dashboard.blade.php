<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Perusahaan Mitra - SIM-PKL</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 min-h-screen text-slate-800">

    <nav class="bg-slate-900 text-white shadow-md">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <span class="font-black text-xl tracking-wider text-emerald-400">SIM-PKL</span>
                <span class="text-xs bg-slate-800 px-2.5 py-1 rounded-full font-semibold border border-slate-700">Portal Mitra Industry</span>
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

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold text-slate-800">{{ $perusahaan->nama_perusahaan ?? 'Data Perusahaan' }}</h1>
                <p class="text-xs text-slate-500 mt-1">{{ $perusahaan->alamat_lengkap ?? '-' }}</p>
            </div>
            <div class="bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl text-right">
                <span class="text-xs text-emerald-600 block font-semibold">Sisa Kuota Penerimaan</span>
                <span class="text-2xl font-black text-emerald-700">{{ $perusahaan->kuota_tersedia ?? 0 }} Siswa</span>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="p-6 border-b border-slate-100">
                <h2 class="text-lg font-bold text-slate-800">Daftar Pengajuan Siswa SMK ICB</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 text-slate-500 text-xs font-semibold border-b border-slate-100">
                            <th class="p-4">Kode & Tanggal</th>
                            <th class="p-4">Ketua / Pelamar</th>
                            <th class="p-4">Anggota Kelompok</th>
                            <th class="p-4">Status</th>
                            <th class="p-4 text-center">Aksi Konfirmasi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-sm">
                        @forelse($pengajuanList as $item)
                        <tr class="hover:bg-slate-50/50">
                            <td class="p-4">
                                <span class="font-bold text-indigo-600 block">{{ $item->kode_pengajuan }}</span>
                                <span class="text-xs text-slate-400">{{ \Carbon\Carbon::parse($item->tgl_pengajuan)->format('d M Y') }}</span>
                            </td>
                            <td class="p-4">
                                <span class="font-semibold text-slate-800 block">{{ $item->ketua->name }}</span>
                                <span class="text-xs text-slate-500">{{ $item->ketua->kelas }}</span>
                            </td>
                            <td class="p-4 text-xs text-slate-600">
                                @if($item->anggota->count() > 0)
                                    @foreach($item->anggota as $a)
                                        <div>- {{ $a->siswa->name }}</div>
                                    @endforeach
                                @else
                                    <span class="italic text-slate-400">Mandiri</span>
                                @endif
                            </td>
                            <td class="p-4">
                                <span class="px-2.5 py-1 text-xs font-bold rounded-full 
                                    @if($item->status == 'disetujui_hubin') bg-amber-100 text-amber-800 
                                    @elseif($item->status == 'diterima_mitra') bg-emerald-100 text-emerald-800 
                                    @else bg-rose-100 text-rose-800 @endif">
                                    {{ strtoupper(str_replace('_', ' ', $item->status)) }}
                                </span>
                            </td>
                            <td class="p-4 text-center">
                                @if($item->status == 'disetujui_hubin')
                                    <div class="flex justify-center gap-2">
                                        <form action="{{ route('mitra.konfirmasi', $item->id) }}" method="POST">
                                            @csrf
                                            <input type="hidden" name="status" value="diterima_mitra">
                                            <button type="submit" onclick="return confirm('Terima pengajuan ini?')" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">Terima</button>
                                        </form>
                                        <form action="{{ route('mitra.konfirmasi', $item->id) }}" method="POST">
                                            @csrf
                                            <input type="hidden" name="status" value="ditolak_mitra">
                                            <button type="submit" onclick="return confirm('Tolak pengajuan ini?')" class="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">Tolak</button>
                                        </form>
                                    </div>
                                @else
                                    <span class="text-xs text-slate-400 italic">Sudah Diproses</span>
                                @endif
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

</body>
</html>