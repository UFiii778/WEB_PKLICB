import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  Calendar, 
  Search, 
  LogOut, 
} from 'lucide-react';

export default function SiswaLayout({ children }) {
  const { auth } = usePage().props;
  const { url } = usePage();
  const user = auth?.user || { name: 'Siswa', kelas: '', nis_nip: '' };
  const userDetail = [user.kelas, user.nis_nip].filter(Boolean).join(' | ');


  const navigation = [
    { name: 'Dashboard', href: '/siswa/dashboard', icon: LayoutDashboard },
    { name: 'Katalog Mitra', href: '/siswa/mitra', icon: Building2 },
    { name: 'Status Pengajuan', href: '/siswa/pengajuan', icon: FileText },
    { name: 'Jadwal PKL', href: '/siswa/jadwal', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-[#f3f6f5] flex text-slate-800 font-sans p-4 gap-5">
      {/* Sidebar Kiri */}
      <aside className="w-64 bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo Brand */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-2xl bg-[#004d38] text-white flex items-center justify-center font-bold text-xl shadow-md">
              S
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg leading-tight">SIM–PKL</h1>
              <p className="text-xs text-slate-400 font-medium">Portal Siswa</p>
            </div>
          </div>

          {/* Menu Navigasi */}
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Menu Siswa</p>
          <nav className="space-y-1.5">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${url.startsWith(item.href) ? 'bg-[#004d38] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-[#004d38]'}`}
              >
                <item.icon className={`w-5 h-5 ${url.startsWith(item.href) ? 'text-white' : 'text-slate-500'}`} />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Card CTA Bawah Sidebar */}
        <div className="bg-[#004d38] text-white p-5 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <h4 className="font-bold text-sm mb-1">Ajukan Tempat PKL</h4>
            <p className="text-xs text-emerald-100/80 mb-3">Pilih mitra pilihanmu sebelum kuota penuh.</p>
            <Link
              href="/siswa/mitra"
              className="inline-block w-full text-center bg-[#00c875] hover:bg-[#00b067] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow"
            >
              Cari Mitra
            </Link>
          </div>
        </div>
      </aside>

      {/* Area Konten Utama */}
      <div className="flex-1 flex flex-col gap-5">
        {/* Topbar Header */}
        <header className="bg-white rounded-2xl p-3 px-5 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari perusahaan mitra atau info PKL..."
              className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#004d38] outline-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="w-9 h-9 rounded-full bg-[#004d38] text-white flex items-center justify-center font-bold text-sm">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-right hidden sm:block">
                <p className="font-bold text-xs text-slate-900 leading-snug">{user.name}</p>
                <p className="text-[11px] text-slate-400 font-medium">{userDetail || 'Portal Siswa'}</p>
              </div>
            </div>
            <Link
              href="/logout"
              method="post"
              as="button"
              className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* Body Content */}
        <main className="flex-1 space-y-5">{children}</main>
      </div>
    </div>
  );
}