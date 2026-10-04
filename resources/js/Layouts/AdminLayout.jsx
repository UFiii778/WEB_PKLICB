import { useEffect, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutGrid, Building2, CalendarDays, ChartColumn, Table2, Search, Plus,
    LogOut, Menu, X, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { SearchContext } from '../lib/search';
import { initials } from '../lib/format';
import Modal from '../Components/Modal';

const MENU = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/admin/mitra-siswa', label: 'Mitra & Siswa', icon: Building2 },
    { href: '/admin/jadwal-pkl', label: 'Jadwal PKL', icon: CalendarDays },
    { href: '/admin/analisis-peminat', label: 'Analisis Peminat', icon: ChartColumn },
    { href: '/admin/data-siswa', label: 'Data Siswa', icon: Table2 },
];

const SEARCH_HINT = {
    '/admin/dashboard': 'Cari kode, siswa, atau perusahaan…',
    '/admin/mitra-siswa': 'Cari perusahaan atau siswa…',
    '/admin/jadwal-pkl': 'Cari siswa atau perusahaan di jadwal…',
    '/admin/analisis-peminat': 'Cari perusahaan…',
    '/admin/data-siswa': 'Cari nama, kelas, atau perusahaan…',
};

export default function AdminLayout({ children }) {
    const { url, props } = usePage();
    const path = url.split('?')[0];
    const user = props.auth?.user;
    const flash = props.flash ?? {};

    const [query, setQuery] = useState('');
    const [drawer, setDrawer] = useState(false);
    const [mitraModal, setMitraModal] = useState(false);
    const [toast, setToast] = useState(null);

    // Reset pencarian & tutup drawer saat pindah halaman
    useEffect(() => {
        setQuery('');
        setDrawer(false);
    }, [path]);

    // Toast dari flash message server
    useEffect(() => {
        const msg = flash.success || flash.error;
        if (!msg) return;
        setToast({ text: msg, error: !!flash.error && !flash.success });
        const t = setTimeout(() => setToast(null), 4500);
        return () => clearTimeout(t);
    }, [flash]);

    const logout = () => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/logout';

        const token = document.querySelector('meta[name="csrf-token"]');

        if (token) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = '_token';
            input.value = token.getAttribute('content');
            form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
    };

    const sidebar = (
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 px-3 pt-2">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-forest text-2xl font-black text-white shadow-forest">S</div>
                <div className="leading-tight">
                    <p className="text-2xl font-black tracking-tight text-ink">SIM-PKL</p>
                    <p className="text-sm font-semibold text-forest-soft/80">Admin Hubin</p>
                </div>
            </div>

            <p className="mt-10 px-5 text-xs font-extrabold tracking-[0.16em] text-slate-400">MENU</p>
            <nav className="mt-3 space-y-1.5">
                {MENU.map(({ href, label, icon: Icon }) => {
                    const active = path === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-4 rounded-2xl px-5 py-3.5 text-[15px] font-bold transition ${active
                                ? 'bg-forest text-white shadow-forest'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-forest'
                                }`}
                        >
                            <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto rounded-3xl bg-forest p-5 text-white shadow-forest">
                <p className="font-extrabold">Tambah Perusahaan</p>
                <p className="mt-1 text-xs text-emerald-100/80">Daftarkan lokasi mitra PKL baru.</p>
                <button
                    onClick={() => setMitraModal(true)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf-bright py-3 text-sm font-extrabold text-white transition hover:brightness-110"
                >
                    <Plus className="h-4 w-4" strokeWidth={3} /> Tambah Mitra
                </button>
            </div>
        </div>
    );

    return (
        <SearchContext.Provider value={{ query, setQuery }}>
            <div className="min-h-screen bg-canvas lg:flex lg:gap-6 lg:p-6">
                {/* Sidebar desktop */}
                <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-[300px] shrink-0 rounded-[32px] bg-white p-6 shadow-card lg:block xl:w-[330px]">
                    {sidebar}
                </aside>

                {/* Sidebar mobile (drawer) */}
                {drawer && (
                    <div className="fixed inset-0 z-40 lg:hidden">
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDrawer(false)} />
                        <aside className="animate-pop absolute inset-y-3 left-3 w-[300px] max-w-[85vw] rounded-[28px] bg-white p-5 shadow-2xl">
                            <button onClick={() => setDrawer(false)} className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100">
                                <X className="h-5 w-5" />
                            </button>
                            {sidebar}
                        </aside>
                    </div>
                )}

                <div className="min-w-0 flex-1 space-y-6 p-4 lg:p-0">
                    {/* Header */}
                    <header className="flex items-center gap-3 rounded-[28px] bg-white px-4 py-3 shadow-card sm:px-8 sm:py-5">
                        <button onClick={() => setDrawer(true)} className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Menu">
                            <Menu className="h-6 w-6" />
                        </button>
                        <label className="flex max-w-xl flex-1 items-center gap-3 rounded-full bg-canvas px-5 py-3 ring-1 ring-slate-200/70 focus-within:ring-2 focus-within:ring-leaf">
                            <Search className="h-5 w-5 shrink-0 text-slate-400" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={SEARCH_HINT[path] ?? 'Cari perusahaan atau siswa…'}
                                className="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-slate-400"
                            />
                            {query && (
                                <button type="button" onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600" aria-label="Hapus pencarian">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </label>

                        <div className="ml-auto flex items-center gap-4 sm:gap-5">
                            <div className="hidden h-12 w-px bg-slate-200 sm:block" />
                            <div className="flex items-center gap-3">
                                <div className="grid h-12 w-12 place-items-center rounded-full bg-forest text-base font-extrabold text-white">
                                    {initials(user?.name)}
                                </div>
                                <div className="hidden leading-tight sm:block">
                                    <p className="font-extrabold text-ink">{user?.name}</p>
                                    <p className="text-xs text-slate-400">Admin SIM-PKL</p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                title="Keluar"
                                className="rounded-full p-2.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </header>

                    <main className="space-y-6">{children}</main>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div
                    className={`animate-pop fixed bottom-6 right-6 z-[60] flex max-w-sm items-start gap-3 rounded-2xl px-5 py-4 text-sm font-semibold text-white shadow-2xl ${toast.error ? 'bg-rose-600' : 'bg-forest'
                        }`}
                >
                    {toast.error ? <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />}
                    <span>{toast.text}</span>
                </div>
            )}

            <TambahMitraModal open={mitraModal} onClose={() => setMitraModal(false)} />
        </SearchContext.Provider>
    );
}

function TambahMitraModal({ open, onClose }) {
    const empty = { nama_perusahaan: '', alamat_lengkap: '', kontak_hrd: '', kuota_tersedia: '' };
    const [form, setForm] = useState(empty);
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const submit = (e) => {
        e.preventDefault();
        router.post('/admin/perusahaan', form, {
            preserveScroll: true,
            onStart: () => setBusy(true),
            onFinish: () => setBusy(false),
            onError: setErrors,
            onSuccess: () => {
                setForm(empty);
                setErrors({});
                onClose();
            },
        });
    };

    const field = (k, label, props = {}) => (
        <div>
            <label className="mb-1.5 block text-xs font-extrabold text-slate-500">{label}</label>
            {props.area ? (
                <textarea rows={2} value={form[k]} onChange={set(k)} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/30" />
            ) : (
                <input value={form[k]} onChange={set(k)} required {...props} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/30" />
            )}
            {errors[k] && <p className="mt-1 text-xs font-semibold text-rose-600">{errors[k]}</p>}
        </div>
    );

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Tambah Perusahaan Mitra"
            subtitle="Perusahaan baru langsung aktif dan muncul di katalog siswa."
            footer={
                <>
                    <button type="button" onClick={onClose} className="rounded-2xl px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100">Batal</button>
                    <button form="form-mitra" disabled={busy} className="rounded-2xl bg-forest px-6 py-2.5 text-sm font-extrabold text-white hover:bg-forest-soft disabled:opacity-60">
                        {busy ? 'Menyimpan…' : 'Simpan Mitra'}
                    </button>
                </>
            }
        >
            <form id="form-mitra" onSubmit={submit} className="space-y-4">
                {field('nama_perusahaan', 'Nama Perusahaan')}
                {field('alamat_lengkap', 'Alamat Lengkap', { area: true })}
                <div className="grid grid-cols-2 gap-4">
                    {field('kontak_hrd', 'Kontak HRD (No. HP)')}
                    {field('kuota_tersedia', 'Kuota Tempat', { type: 'number', min: 1 })}
                </div>
            </form>
        </Modal>
    );
}
