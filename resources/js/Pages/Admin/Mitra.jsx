import { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Building2, ChevronDown, MapPin, Phone, UserRound, Users, Power, SearchX } from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';
import Card, { PageTitle, EmptyState } from '../../Components/Card';
import StatusBadge from '../../Components/StatusBadge';
import { useSearch, matches } from '../../lib/search';
import { fmtDate } from '../../lib/format';

export default function Mitra({ mitra }) {
    const query = useSearch();
    const [open, setOpen] = useState(() => new Set());
    const [filter, setFilter] = useState('semua'); // semua | aktif | nonaktif

    const toggle = (id) =>
        setOpen((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    // Pencarian: nama perusahaan ATAU nama siswa di dalamnya
    const list = useMemo(
        () =>
            mitra.filter(
                (m) =>
                    (filter === 'semua' || m.status_mitra === filter) &&
                    (matches(query, m.nama, m.alamat) ||
                        m.pengajuan.some((p) => p.siswa.some((s) => matches(query, s.nama)))),
            ),
        [mitra, query, filter],
    );

    const totalSiswa = mitra.reduce((n, m) => n + m.pengajuan.reduce((a, p) => a + p.siswa.length, 0), 0);

    return (
        <>
            <Head title="Mitra & Siswa" />

            <PageTitle
                title="Mitra & Siswa"
                subtitle="Relasi perusahaan mitra dengan siswa yang mengajukan atau diterima. Klik perusahaan untuk melihat daftar siswa."
            >
                <div className="flex gap-2">
                    {['semua', 'aktif', 'nonaktif'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`rounded-full px-4 py-2 text-xs font-extrabold capitalize transition ${
                                filter === f ? 'bg-forest text-white' : 'bg-white text-slate-500 shadow-card hover:text-forest'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </PageTitle>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Mini label="Total Mitra" value={mitra.length} />
                <Mini label="Mitra Aktif" value={mitra.filter((m) => m.status_mitra === 'aktif').length} />
                <Mini label="Total Sisa Kuota" value={mitra.filter((m) => m.status_mitra === 'aktif').reduce((n, m) => n + m.kuota_sisa, 0)} />
                <Mini label="Siswa Terhubung" value={totalSiswa} />
            </div>

            <div className="space-y-4">
                {list.map((m) => {
                    const isOpen = open.has(m.id) || (query.trim() && m.pengajuan.some((p) => p.siswa.some((s) => matches(query, s.nama))));
                    const aktif = m.status_mitra === 'aktif';
                    const penuh = m.kuota_sisa <= 0;
                    const siswaRows = m.pengajuan.flatMap((p) => p.siswa.map((s) => ({ ...s, p })));

                    return (
                        <Card key={m.id} className="overflow-hidden">
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => toggle(m.id)}
                                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle(m.id)}
                                className="flex flex-wrap items-center gap-4 p-5 transition hover:bg-slate-50/60 sm:px-7"
                            >
                                <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${aktif ? 'bg-emerald-50 text-forest' : 'bg-slate-100 text-slate-400'}`}>
                                    <Building2 className="h-6 w-6" />
                                </div>

                                <div className="min-w-[220px] flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-extrabold text-ink">{m.nama}</h3>
                                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${aktif ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                                            {aktif ? 'AKTIF' : 'NONAKTIF'}
                                        </span>
                                    </div>
                                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                                        <MapPin className="h-3.5 w-3.5 shrink-0" /> {m.alamat}
                                    </p>
                                </div>

                                <div className="flex items-center gap-6 text-center">
                                    <div>
                                        <p className={`text-2xl font-black leading-none ${penuh ? 'text-rose-500' : 'text-ink'}`}>{m.kuota_sisa}</p>
                                        <p className="mt-1 text-[11px] font-bold text-slate-400">{penuh ? 'KUOTA PENUH' : 'SISA KUOTA'}</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black leading-none text-forest">{m.siswa_diterima}</p>
                                        <p className="mt-1 text-[11px] font-bold text-slate-400">DITERIMA</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black leading-none text-ink">{siswaRows.length}</p>
                                        <p className="mt-1 text-[11px] font-bold text-slate-400">PENGAJU</p>
                                    </div>
                                </div>

                                <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {isOpen && (
                                <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-5 sm:px-7">
                                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                        <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500">
                                            <span className="inline-flex items-center gap-1.5">
                                                <UserRound className="h-4 w-4 text-slate-400" />
                                                HRD: <b className="text-ink">{m.nama_hrd ?? 'Belum ada akun HRD'}</b>
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <Phone className="h-4 w-4 text-slate-400" /> <b className="text-ink">{m.kontak_hrd}</b>
                                            </span>
                                        </p>
                                        <button
                                            onClick={() => router.post(`/admin/perusahaan/${m.id}/toggle`, {}, { preserveScroll: true })}
                                            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold transition ${
                                                aktif ? 'bg-white text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50' : 'bg-forest text-white hover:bg-forest-soft'
                                            }`}
                                        >
                                            <Power className="h-3.5 w-3.5" /> {aktif ? 'Nonaktifkan Mitra' : 'Aktifkan Mitra'}
                                        </button>
                                    </div>

                                    {siswaRows.length === 0 ? (
                                        <p className="rounded-2xl bg-white py-8 text-center text-sm italic text-slate-400">
                                            Belum ada siswa yang mengajukan ke perusahaan ini.
                                        </p>
                                    ) : (
                                        <div className="scrollbar-thin overflow-x-auto rounded-2xl bg-white">
                                            <table className="w-full min-w-[720px] text-left text-sm">
                                                <thead>
                                                    <tr className="border-b border-slate-100 text-[11px] font-extrabold tracking-wide text-slate-400">
                                                        <th className="px-5 py-3">NAMA SISWA</th>
                                                        <th className="px-5 py-3">KELAS / JURUSAN</th>
                                                        <th className="px-5 py-3">TGL PENGAJUAN</th>
                                                        <th className="px-5 py-3">STATUS</th>
                                                        <th className="px-5 py-3">KONTAK HRD</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {siswaRows.map((s) => (
                                                        <tr key={`${s.p.id}-${s.id}`} className={matches(query, s.nama) && query.trim() ? 'bg-emerald-50/60' : ''}>
                                                            <td className="px-5 py-3.5">
                                                                <p className="font-bold text-ink">{s.nama}</p>
                                                                <p className="text-[11px] text-slate-400">
                                                                    {s.p.kode} · {s.ketua ? 'Ketua' : 'Anggota'}
                                                                </p>
                                                            </td>
                                                            <td className="px-5 py-3.5 text-slate-600">
                                                                {s.kelas}
                                                                <span className="block text-[11px] text-slate-400">{s.jurusan}</span>
                                                            </td>
                                                            <td className="px-5 py-3.5 text-slate-600">{fmtDate(s.p.tgl_pengajuan)}</td>
                                                            <td className="px-5 py-3.5">
                                                                <StatusBadge status={s.p.status} />
                                                            </td>
                                                            <td className="px-5 py-3.5 text-slate-600">{m.kontak_hrd}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    );
                })}

                {list.length === 0 && (
                    <Card>
                        <EmptyState
                            icon={mitra.length ? SearchX : Users}
                            title={mitra.length ? 'Tidak ada mitra yang cocok' : 'Belum ada perusahaan mitra'}
                            text={mitra.length ? 'Coba ubah filter atau kata kunci pencarian.' : 'Tambahkan mitra lewat tombol "Tambah Mitra" di sidebar.'}
                        />
                    </Card>
                )}
            </div>
        </>
    );
}

Mitra.layout = (page) => <AdminLayout>{page}</AdminLayout>;

function Mini({ label, value }) {
    return (
        <Card className="px-6 py-5">
            <p className="text-xs font-extrabold tracking-wide text-slate-400">{label.toUpperCase()}</p>
            <p className="mt-1 text-3xl font-black text-ink">{value}</p>
        </Card>
    );
}
