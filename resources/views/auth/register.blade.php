<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daftar Akun Baru - SIM-PKL</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="bg-slate-100 min-h-screen flex items-center justify-center py-10 px-4">

    <div class="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-8" x-data="{ roleTab: 'siswa' }">
        
        <!-- Header -->
        <div class="text-center mb-6">
            <h1 class="text-2xl font-black text-slate-800 tracking-wider">SIM-PKL</h1>
            <p class="text-xs text-slate-500 mt-1">Buat akun baru untuk mengakses sistem</p>
        </div>

        <!-- Alert Error Validasi -->
        @if ($errors->any())
            <div class="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6 text-xs">
                <ul class="list-disc list-inside space-y-1">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <!-- Switch Tab Mode -->
        <div class="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button type="button" 
                @click="roleTab = 'siswa'" 
                :class="roleTab === 'siswa' ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'text-slate-500 font-medium'"
                class="w-1/2 py-2 text-xs rounded-lg transition duration-200">
                Daftar Siswa
            </button>
            <button type="button" 
                @click="roleTab = 'hrd'" 
                :class="roleTab === 'hrd' ? 'bg-white text-emerald-600 shadow-sm font-bold' : 'text-slate-500 font-medium'"
                class="w-1/2 py-2 text-xs rounded-lg transition duration-200">
                Daftar HRD Perusahaan
            </button>
        </div>

        <!-- Form Register SISWA -->
        <form x-show="roleTab === 'siswa'" action="{{ route('register.siswa') }}" method="POST" class="space-y-4">
            @csrf
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">NIS</label>
                    <input type="text" name="nis_nip" value="{{ old('nis_nip') }}" placeholder="12345678" required class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Kelas / Jurusan</label>
                    <input type="text" name="kelas" value="{{ old('kelas') }}" placeholder="XII RPL 1" required class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none">
                </div>
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap</label>
                <input type="text" name="name" value="{{ old('name') }}" placeholder="Nama Siswa" required class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none">
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                    <input type="email" name="email" value="{{ old('email') }}" placeholder="siswa@gmail.com" required class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">No. HP / WhatsApp</label>
                    <input type="text" name="no_hp" value="{{ old('no_hp') }}" placeholder="081234567890" required class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                    <input type="password" name="password" required class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Konfirmasi Password</label>
                    <input type="password" name="password_confirmation" required class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none">
                </div>
            </div>

            <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition duration-200 mt-2">
                Daftar Sebagai Siswa
            </button>
        </form>

        <!-- Form Register HRD -->
        <form x-show="roleTab === 'hrd'" action="{{ route('register.hrd') }}" method="POST" class="space-y-4" x-cloak>
            @csrf
            <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap HRD / Penanggung Jawab</label>
                <input type="text" name="name" value="{{ old('name') }}" placeholder="Nama HRD" required class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none">
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Email Perusahaan</label>
                    <input type="email" name="email" value="{{ old('email') }}" placeholder="hrd@perusahaan.com" required class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">No. HP / WhatsApp Kontak</label>
                    <input type="text" name="no_hp" value="{{ old('no_hp') }}" placeholder="081234567890" required class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                    <input type="password" name="password" required class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1">Konfirmasi Password</label>
                    <input type="password" name="password_confirmation" required class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none">
                </div>
            </div>

            <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition duration-200 mt-2">
                Daftar Sebagai HRD Perusahaan
            </button>
        </form>

        <!-- Footer Direct Login -->
        <div class="text-center mt-6 pt-4 border-t border-slate-100">
            <p class="text-xs text-slate-500">Sudah punya akun? 
                <a href="{{ route('login') }}" class="font-bold text-indigo-600 hover:underline">Login di sini</a>
            </p>
        </div>

    </div>

</body>
</html>