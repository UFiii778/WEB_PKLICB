<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Perusahaan - SIM-PKL</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        html { scroll-behavior: smooth; }
        .glass { background: rgba(255,255,255,.86); backdrop-filter: blur(14px); }
        .sidebar-link.active { background:#03503b; color:#fff; box-shadow:0 12px 28px -14px rgba(3,80,59,.7); }
        .sidebar-link:not(.active):hover { background:#ecfdf5; color:#03503b; }
        .modal-backdrop { background:rgba(2,20,15,.55); backdrop-filter:blur(5px); }
        [x-cloak] { display:none !important; }
    </style>
</head>
<body class="bg-[#f4f6f8] text-slate-800 min-h-screen">
@php
    $statusLabel = [
        'disetujui_hubin' => 'Menunggu keputusan',
        'diterima_mitra' => 'Diterima',
        'ditolak_mitra' => 'Ditolak',
    ];
@endphp

<div class="min-h-screen lg:flex">
    <aside class="hidden lg:flex lg:w-72 lg:flex-col bg-white border-r border-slate-200 fixed inset-y-0 left-0 z-30">
        <div class="px-7 py-7 border-b border-slate-100">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-[#03503b] text-white grid place-items-center font-black text-xl">S</div>
                <div>
                    <div class="font-black text-xl tracking-tight">SIM-PKL</div>
                    <div class="text-sm text-emerald-700 font-semibold">Portal Perusahaan</div>
                </div>
            </div>
        </div>

        <nav class="p-5 space-y-2 text-sm font-semibold">
            <a href="#ringkasan" class="sidebar-link active flex items-center gap-3 rounded-xl px-4 py-3">▦ <span>Dashboard</span></a>
            <a href="#pengajuan" class="sidebar-link flex items-center gap-3 rounded-xl px-4 py-3 text-slate-500">▤ <span>Pengajuan PKL</span></a>
            <a href="#siswa" class="sidebar-link flex items-center gap-3 rounded-xl px-4 py-3 text-slate-500">♙ <span>Siswa PKL</span></a>
            <a href="#jadwal" class="sidebar-link flex items-center gap-3 rounded-xl px-4 py-3 text-slate-500">▣ <span>Jadwal PKL</span></a>
            <a href="#profil" class="sidebar-link flex items-center gap-3 rounded-xl px-4 py-3 text-slate-500">⚙ <span>Profil Perusahaan</span></a>
        </nav>

        <div class="mt-auto p-5">
            <div class="rounded-2xl bg-[#03503b] text-white p-5">
                <div class="text-xs text-emerald-100">Kuota tersedia</div>
                <div class="text-3xl font-black mt-1">{{ $stats['kuota'] }}</div>
                <div class="text-xs text-emerald-100 mt-1">siswa masih dapat diterima</div>
            </div>
        </div>
    </aside>

    <main class="lg:ml-72 flex-1">
        <header class="sticky top-0 z-20 glass border-b border-slate-200/80">
            <div class="max-w-[1500px] mx-auto px-5 sm:px-7 py-4 flex items-center justify-between gap-4">
                <div>
                    <div class="text-xs text-slate-400 font-semibold">PORTAL MITRA INDUSTRI</div>
                    <h1 class="font-black text-lg sm:text-xl">Dashboard Perusahaan</h1>
                </div>
                <div class="flex items-center gap-3">
                    <div class="hidden sm:block text-right">
                        <div class="font-bold text-sm">{{ $user->name }}</div>
                        <div class="text-xs text-slate-400">HRD / Mitra</div>
                    </div>
                    <div class="w-10 h-10 rounded-full bg-[#03503b] text-white grid place-items-center font-bold">
                        {{ strtoupper(substr($user->name, 0, 1)) }}
                    </div>
                    <form action="{{ route('logout') }}" method="POST">
                        @csrf
                        <button class="hidden sm:block px-3 py-2 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-xs font-bold transition">Logout</button>
                    </form>
                </div>
            </div>
        </header>

        <div class="max-w-[1500px] mx-auto px-5 sm:px-7 py-7 space-y-7">
            @if(session('success'))
                <div class="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">✓ {{ session('success') }}</div>
            @endif
            @if($errors->any())
                <div class="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800">
                    <div class="font-bold mb-1">Periksa kembali data:</div>
                    <ul class="list-disc ml-5 space-y-1">@foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul>
                </div>
            @endif

            @if(!$perusahaan)
                <section class="bg-white rounded-3xl border border-amber-200 shadow-sm p-7">
                    <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 grid place-items-center text-xl">!</div>
                    <h2 class="text-xl font-black mt-4">Akun belum terhubung ke perusahaan</h2>
                    <p class="text-slate-500 mt-2 max-w-2xl">Sistem saat ini menghubungkan akun HRD dengan data perusahaan melalui nomor HP. Pastikan nomor HP akun HRD sama dengan kolom <b>kontak_hrd</b> pada data perusahaan di Admin Hubin.</p>
                </section>
            @else
                <section id="ringkasan" class="scroll-mt-24">
                    <div class="rounded-3xl bg-[#03503b] text-white p-6 sm:p-8 shadow-xl shadow-emerald-950/10 overflow-hidden relative">
                        <div class="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-emerald-400/10"></div>
                        <div class="relative flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                            <div>
                                <div class="text-emerald-200 text-sm font-semibold">Selamat datang, {{ $user->name }} 👋</div>
                                <h2 class="text-2xl sm:text-3xl font-black mt-2">{{ $perusahaan->nama_perusahaan }}</h2>
                                <p class="text-emerald-100 text-sm mt-2 max-w-2xl">Kelola pengajuan siswa PKL, keputusan penerimaan, siswa aktif, dan informasi perusahaan dari satu tempat.</p>
                            </div>
                            <a href="#pengajuan" class="shrink-0 inline-flex justify-center px-5 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-sm">Lihat Pengajuan →</a>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
                        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"><div class="text-xs font-bold text-slate-400">Menunggu Review</div><div class="text-3xl font-black mt-2 text-amber-600">{{ $stats['menunggu'] }}</div><div class="text-xs text-slate-400 mt-1">pengajuan siap diproses</div></div>
                        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"><div class="text-xs font-bold text-slate-400">Diterima</div><div class="text-3xl font-black mt-2 text-emerald-600">{{ $stats['diterima'] }}</div><div class="text-xs text-slate-400 mt-1">kelompok diterima</div></div>
                        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"><div class="text-xs font-bold text-slate-400">Siswa Aktif</div><div class="text-3xl font-black mt-2 text-slate-800">{{ $stats['siswa_aktif'] }}</div><div class="text-xs text-slate-400 mt-1">siswa dari pengajuan diterima</div></div>
                        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"><div class="text-xs font-bold text-slate-400">Kuota Tersisa</div><div class="text-3xl font-black mt-2 text-[#03503b]">{{ $stats['kuota'] }}</div><div class="text-xs text-slate-400 mt-1">slot siswa tersedia</div></div>
                    </div>
                </section>

                <section id="pengajuan" class="scroll-mt-24 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div class="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div><h2 class="text-xl font-black">Pengajuan PKL</h2><p class="text-sm text-slate-400 mt-1">Periksa pengajuan yang sudah disetujui Hubin sebelum menerima siswa.</p></div>
                        <div class="flex gap-2">
                            <input id="searchPengajuan" type="search" placeholder="Cari nama / kode..." class="w-full sm:w-56 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500">
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full min-w-[900px] text-left">
                            <thead class="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                                <tr><th class="px-6 py-4">Pengajuan</th><th class="px-6 py-4">Ketua</th><th class="px-6 py-4">Periode</th><th class="px-6 py-4">Anggota</th><th class="px-6 py-4">Status</th><th class="px-6 py-4 text-right">Aksi</th></tr>
                            </thead>
                            <tbody id="pengajuanTable" class="divide-y divide-slate-100">
                            @forelse($pengajuanList as $item)
                                @php
                                    $searchText = strtolower(($item->kode_pengajuan ?? '') . ' ' . ($item->ketua->name ?? ''));
                                    $status = $item->status;
                                @endphp
                                <tr class="pengajuan-row hover:bg-slate-50/70" data-search="{{ $searchText }}">
                                    <td class="px-6 py-5"><div class="font-black text-[#03503b]">{{ $item->kode_pengajuan }}</div><div class="text-xs text-slate-400 mt-1">{{ $item->tgl_pengajuan ? \Carbon\Carbon::parse($item->tgl_pengajuan)->format('d M Y') : '-' }}</div></td>
                                    <td class="px-6 py-5"><div class="font-bold">{{ $item->ketua->name ?? '-' }}</div><div class="text-xs text-slate-400">{{ $item->ketua->kelas ?? '-' }}</div></td>
                                    <td class="px-6 py-5 text-sm"><div>{{ $item->tgl_mulai_pkl ? \Carbon\Carbon::parse($item->tgl_mulai_pkl)->format('d M Y') : '-' }}</div><div class="text-xs text-slate-400">s/d {{ $item->tgl_selesai_pkl ? \Carbon\Carbon::parse($item->tgl_selesai_pkl)->format('d M Y') : '-' }}</div></td>
                                    <td class="px-6 py-5 text-sm"><div class="font-semibold">{{ 1 + $item->anggota->count() }} siswa</div><div class="text-xs text-slate-400">{{ $item->anggota->pluck('siswa.name')->filter()->join(', ') ?: 'Mandiri' }}</div></td>
                                    <td class="px-6 py-5">
                                        @if($status === 'disetujui_hubin')
                                            <span class="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black">Menunggu keputusan</span>
                                        @elseif($status === 'diterima_mitra')
                                            <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">Diterima</span>
                                        @else
                                            <span class="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black">Ditolak</span>
                                        @endif
                                    </td>
                                    <td class="px-6 py-5 text-right">
                                        @if($status === 'disetujui_hubin')
                                            <div class="flex justify-end gap-2">
                                                <form action="{{ route('mitra.konfirmasi', $item->id) }}" method="POST" onsubmit="return confirm('Terima pengajuan {{ $item->kode_pengajuan }}?')">
                                                    @csrf
                                                    <input type="hidden" name="status" value="diterima_mitra">
                                                    <button class="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black">Terima</button>
                                                </form>
                                                <button type="button" onclick="openReject({{ $item->id }}, '{{ addslashes($item->kode_pengajuan) }}')" class="px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black">Tolak</button>
                                            </div>
                                        @else
                                            <button type="button" onclick="openDetail({{ $item->id }})" class="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black">Detail</button>
                                        @endif
                                    </td>
                                </tr>
                            @empty
                                <tr><td colspan="6" class="px-6 py-14 text-center"><div class="text-3xl">📭</div><div class="font-bold mt-3">Belum ada pengajuan masuk</div><div class="text-sm text-slate-400 mt-1">Pengajuan yang sudah disetujui Hubin akan muncul di sini.</div></td></tr>
                            @endforelse
                            </tbody>
                        </table>
                    </div>
                </section>

                <section id="siswa" class="scroll-mt-24">
                    <div class="flex items-end justify-between gap-4 mb-4"><div><h2 class="text-xl font-black">Siswa PKL</h2><p class="text-sm text-slate-400 mt-1">Daftar siswa dari kelompok yang sudah diterima perusahaan.</p></div></div>
                    <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                        @php $accepted = $pengajuanList->where('status', 'diterima_mitra'); @endphp
                        @forelse($accepted as $item)
                            <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                                <div class="flex items-start justify-between gap-3"><div><div class="font-black">{{ $item->ketua->name ?? '-' }}</div><div class="text-xs text-slate-400 mt-1">Ketua • {{ $item->ketua->kelas ?? '-' }}</div></div><span class="text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Aktif</span></div>
                                <div class="mt-4 text-sm text-slate-600">{{ $item->tgl_mulai_pkl ? \Carbon\Carbon::parse($item->tgl_mulai_pkl)->format('d M Y') : '-' }} — {{ $item->tgl_selesai_pkl ? \Carbon\Carbon::parse($item->tgl_selesai_pkl)->format('d M Y') : '-' }}</div>
                                @if($item->anggota->count())
                                    <div class="mt-4 pt-4 border-t border-slate-100"><div class="text-[10px] uppercase font-black text-slate-400 mb-2">Anggota</div>@foreach($item->anggota as $anggota)<div class="text-sm font-semibold">• {{ $anggota->siswa->name ?? '-' }}</div>@endforeach</div>
                                @endif
                            </div>
                        @empty
                            <div class="md:col-span-2 xl:col-span-3 bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400">Belum ada siswa yang diterima.</div>
                        @endforelse
                    </div>
                </section>

                <section id="jadwal" class="scroll-mt-24 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                    <div class="mb-5"><h2 class="text-xl font-black">Jadwal PKL</h2><p class="text-sm text-slate-400 mt-1">Periode siswa yang sudah diterima perusahaan.</p></div>
                    <div class="space-y-3">
                        @forelse($accepted as $item)
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4"><div><div class="font-bold">{{ $item->ketua->name ?? '-' }} @if($item->anggota->count()) + {{ $item->anggota->count() }} anggota @endif</div><div class="text-xs text-slate-400 mt-1">{{ $item->kode_pengajuan }}</div></div><div class="font-black text-sm text-[#03503b]">{{ $item->tgl_mulai_pkl ? \Carbon\Carbon::parse($item->tgl_mulai_pkl)->format('d M Y') : '-' }} — {{ $item->tgl_selesai_pkl ? \Carbon\Carbon::parse($item->tgl_selesai_pkl)->format('d M Y') : '-' }}</div></div>
                        @empty
                            <div class="py-8 text-center text-slate-400">Belum ada jadwal PKL aktif.</div>
                        @endforelse
                    </div>
                </section>

                <section id="profil" class="scroll-mt-24 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                    <div class="mb-5"><h2 class="text-xl font-black">Profil Perusahaan</h2><p class="text-sm text-slate-400 mt-1">Informasi ini juga digunakan oleh siswa saat memilih mitra.</p></div>
                    <form action="{{ route('mitra.profil.update') }}" method="POST" class="grid md:grid-cols-2 gap-5">
                        @csrf
                        @method('PUT')
                        <div class="md:col-span-2"><label class="text-xs font-black text-slate-500">Nama Perusahaan</label><input name="nama_perusahaan" value="{{ $perusahaan->nama_perusahaan }}" required class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"></div>
                        <div class="md:col-span-2"><label class="text-xs font-black text-slate-500">Alamat Lengkap</label><textarea name="alamat_lengkap" rows="4" required class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500">{{ $perusahaan->alamat_lengkap }}</textarea></div>
                        <div><label class="text-xs font-black text-slate-500">Kontak HRD / No. HP</label><input name="kontak_hrd" value="{{ $perusahaan->kontak_hrd }}" required class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"><p class="text-[11px] text-slate-400 mt-1">Perubahan akan disinkronkan dengan nomor HP akun HRD.</p></div>
                        <div class="flex items-end"><button class="w-full md:w-auto px-5 py-3 rounded-xl bg-[#03503b] hover:bg-[#04654b] text-white text-sm font-black">Simpan Profil</button></div>
                    </form>
                </section>
            @endif
        </div>
    </main>
</div>

<!-- Modal Tolak -->
<div id="rejectModal" class="hidden fixed inset-0 z-50 modal-backdrop items-center justify-center p-4">
    <div class="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl">
        <div class="flex items-center justify-between"><div><h3 class="text-lg font-black">Tolak Pengajuan</h3><p id="rejectCode" class="text-xs text-slate-400 mt-1"></p></div><button onclick="closeReject()" class="text-slate-400 hover:text-slate-700 text-xl">×</button></div>
        <form id="rejectForm" method="POST" class="mt-5 space-y-4">
            @csrf
            <input type="hidden" name="status" value="ditolak_mitra">
            <div><label class="text-xs font-black text-slate-500">Alasan penolakan</label><textarea name="alasan_penolakan" required minlength="5" maxlength="500" rows="5" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-rose-500" placeholder="Contoh: Kuota sudah penuh untuk periode tersebut."></textarea></div>
            <div class="flex justify-end gap-2"><button type="button" onclick="closeReject()" class="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold">Batal</button><button class="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-black">Tolak Pengajuan</button></div>
        </form>
    </div>
</div>

<script>
    const rejectModal = document.getElementById('rejectModal');
    function openReject(id, code) {
        document.getElementById('rejectForm').action = `/mitra/konfirmasi/${id}`;
        document.getElementById('rejectCode').textContent = `Pengajuan ${code}`;
        rejectModal.classList.remove('hidden');
        rejectModal.classList.add('flex');
    }
    function closeReject() {
        rejectModal.classList.add('hidden');
        rejectModal.classList.remove('flex');
    }
    document.getElementById('searchPengajuan')?.addEventListener('input', function () {
        const q = this.value.toLowerCase().trim();
        document.querySelectorAll('.pengajuan-row').forEach(row => {
            row.style.display = row.dataset.search.includes(q) ? '' : 'none';
        });
    });
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-link').forEach(x => x.classList.remove('active'));
            link.classList.add('active');
        });
    });
</script>
</body>
</html>
