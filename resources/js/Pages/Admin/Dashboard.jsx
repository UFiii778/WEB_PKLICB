import { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    ArrowUpRight, CircleCheck, Clock3, Building, FileText, Check, X, FileSearch, Info,
} from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';
import Card, { EmptyState } from '../../Components/Card';
import Modal from '../../Components/Modal';
import StatusBadge from '../../Components/StatusBadge';
import { useSearch, matches } from '../../lib/search';
import { isDisetujui, isDitolak } from '../../lib/status';
import { fmtDate } from '../../lib/format';

const FILTERS = [
    { key: 'semua',    label: 'Semua',    test: () => true },
    { key: 'pending',  label: 'Pending',  test: (p) => p.status === 'pending' },
    { key: 'disetujui', label: 'Disetujui', test: (p) => p.status === 'disetujui_hubin' },
    { key: 'diterima', label: 'Diterima', test: (p) => p.status === 'diterima_mitra' },
    { key: 'ditolak',  label: 'Ditolak',  test: (p) => isDitolak(p.status) },
];

const ALASAN_CEPAT = [
    'Kuota perusahaan sudah penuh',
    'Perusahaan tidak sesuai dengan kriteria jurusan',
    'Jadwal PKL tidak sesuai kalender akademik',
];

export default function Dashboard({ stats, pengajuan }) {
    const query = useSearch();
    const [filter, setFilter] = useState('semua');
    const [approving, setApproving] = useState(null);
    const [rejecting, setRejecting] = useState(null);
    const [viewReason, setViewReason] = useState(null);

    const counts = useMemo(
        () => Object.fromEntries(FILTERS.map((f) => [f.key, pengajuan.filter(f.test).length])),
        [pengajuan],
    );

    const rows = useMemo(() => {
        const test = FILTERS.find((f) => f.key === filter).test;
        return pengajuan.filter(
            (p) => test(p) && matches(query, p.kode, p.perusahaan, ...p.siswa.map((s) => s.nama)),
        );
    }, [pengajuan, filter, query]);

    return (
        <>
            <Head title="Dashboard Admin Hubin" />

            {/* Kartu statistik */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <div className="flex min-h-[218px] flex-col justify-between rounded-[28px] bg-forest p-7 text-white shadow-forest">
                    <div className="flex items-start justify-between">
                        <p className="font-bold text-emerald-50">Total Pengajuan</p>
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-emerald-200">
                            <ArrowUpRight className="h-5 w-5" />
                        </span>
                    </div>
                    <div>
                        <p className="text-6xl font-black leading-none">{stats.total}</p>
                        <span className="mt-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-emerald-200">
                            {stats.aktif} Aktif
                        </span>
                    </div>
                </div>

                <StatCard
                    title="Diterima HRD" value={stats.siswa_terpenuhi} note="Siswa Terpenuhi"
                    noteClass="text-emerald-600" icon={CircleCheck} iconClass="bg-emerald-50 text-emerald-600"
                />
                <StatCard
                    title="Pending Validasi" value={stats.pending} note="Butuh Persetujuan"
                    noteClass="text-orange-500" icon={Clock3} iconClass="bg-amber-50 text-orange-500"
                />
                <StatCard
                    title="Perusahaan Mitra" value={stats.mitra_aktif} note="Mitra Aktif"
                    noteClass="text-slate-400" icon={Building} iconClass="bg-slate-100 text-slate-500"
                />
            </div>

            {/* Tabel validasi */}
            <Card className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-ink">Validasi Pengajuan PKL Siswa</h2>
                        <p className="mt-1 text-sm text-slate-400">Setujui pengajuan untuk menerbitkan Surat Pengantar PDF</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {FILTERS.map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition ${
                                    filter === f.key ? 'bg-forest text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                            >
                                {f.label} <span className="opacity-60">{counts[f.key]}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="scrollbar-thin mt-6 overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs font-extrabold tracking-wide text-slate-400">
                                <th className="px-5 py-4">KODE &amp; PELAMAR</th>
                                <th className="px-5 py-4">PERUSAHAAN TUJUAN</th>
                                <th className="px-5 py-4">STATUS</th>
                                <th className="px-5 py-4 text-center">AKSI VALIDASI / SURAT</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((p) => {
                                const ketua = p.siswa[0];
                                const anggota = p.siswa.length - 1;
                                return (
                                    <tr key={p.id} className="transition hover:bg-slate-50/60">
                                        <td className="px-5 py-5">
                                            <p className="font-extrabold text-forest">{p.kode}</p>
                                            <p className="mt-0.5 text-[15px] font-semibold text-ink">
                                                {ketua?.nama ?? '-'}
                                                {anggota > 0 && (
                                                    <span
                                                        className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500"
                                                        title={p.siswa.slice(1).map((s) => s.nama).join(', ')}
                                                    >
                                                        +{anggota} anggota
                                                    </span>
                                                )}
                                            </p>
                                        </td>
                                        <td className="px-5 py-5">
                                            <p className="font-semibold text-slate-700">{p.perusahaan ?? '-'}</p>
                                            <p className="text-xs text-slate-400">
                                                {p.tgl_mulai ? `${fmtDate(p.tgl_mulai)} – ${fmtDate(p.tgl_selesai)}` : 'Periode belum ditentukan'}
                                            </p>
                                        </td>
                                        <td className="px-5 py-5">
                                            <StatusBadge status={p.status} />
                                        </td>
                                        <td className="px-5 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                {p.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => setApproving(p)}
                                                            className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-extrabold text-white transition hover:bg-forest-soft"
                                                        >
                                                            <Check className="h-3.5 w-3.5" strokeWidth={3} /> Setuju
                                                        </button>
                                                        <button
                                                            onClick={() => setRejecting(p)}
                                                            className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-extrabold text-rose-700 transition hover:bg-rose-100"
                                                        >
                                                            <X className="h-3.5 w-3.5" strokeWidth={3} /> Tolak
                                                        </button>
                                                    </>
                                                )}
                                                {isDisetujui(p.status) && (
                                                    <a
                                                        href={`/admin/pengajuan/${p.id}/cetak-surat`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-extrabold text-forest transition hover:bg-emerald-100"
                                                    >
                                                        <FileText className="h-4 w-4" /> Cetak PDF
                                                    </a>
                                                )}
                                                {isDitolak(p.status) && (
                                                    <button
                                                        onClick={() => p.alasan && setViewReason(p)}
                                                        className={`inline-flex items-center gap-1.5 text-sm italic text-slate-400 ${p.alasan ? 'hover:text-rose-600' : 'cursor-default'}`}
                                                        title={p.alasan ? 'Lihat alasan penolakan' : undefined}
                                                    >
                                                        Ditolak {p.alasan && <FileSearch className="h-3.5 w-3.5" />}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {rows.length === 0 && (
                        <EmptyState
                            icon={FileSearch}
                            title={pengajuan.length === 0 ? 'Belum ada pengajuan masuk' : 'Tidak ada pengajuan yang cocok'}
                            text={pengajuan.length === 0 ? 'Pengajuan siswa akan muncul di sini untuk divalidasi.' : 'Coba ubah filter atau kata kunci pencarian.'}
                        />
                    )}
                </div>
            </Card>

            <ApproveModal item={approving} onClose={() => setApproving(null)} />
            <RejectModal item={rejecting} onClose={() => setRejecting(null)} />

            <Modal
                open={!!viewReason}
                onClose={() => setViewReason(null)}
                size="sm"
                title="Alasan Penolakan"
                subtitle={viewReason ? `${viewReason.kode} · ${viewReason.siswa[0]?.nama}` : ''}
            >
                <div className="flex gap-3 rounded-2xl bg-rose-50 p-4 text-sm text-rose-900">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{viewReason?.alasan}</p>
                </div>
                <p className="mt-3 text-xs text-slate-400">Alasan ini juga tampil di dashboard siswa yang bersangkutan.</p>
            </Modal>
        </>
    );
}

Dashboard.layout = (page) => <AdminLayout>{page}</AdminLayout>;

function StatCard({ title, value, note, noteClass, icon: Icon, iconClass }) {
    return (
        <Card className="flex min-h-[218px] flex-col justify-between p-7">
            <div className="flex items-start justify-between">
                <p className="font-bold text-slate-400">{title}</p>
                <span className={`grid h-11 w-11 place-items-center rounded-full ${iconClass}`}>
                    <Icon className="h-5 w-5" />
                </span>
            </div>
            <div>
                <p className="text-6xl font-black leading-none text-ink">{value}</p>
                <p className={`mt-4 text-sm font-extrabold ${noteClass}`}>{note}</p>
            </div>
        </Card>
    );
}

function ApproveModal({ item, onClose }) {
    const [busy, setBusy] = useState(false);

    const approve = () =>
        router.post(
            `/admin/pengajuan/${item.id}/status`,
            { status: 'disetujui_hubin' },
            { preserveScroll: true, onStart: () => setBusy(true), onFinish: () => setBusy(false), onSuccess: onClose },
        );

    return (
        <Modal
            open={!!item}
            onClose={onClose}
            size="sm"
            title="Setujui Pengajuan?"
            subtitle={item ? `${item.kode} · ${item.siswa[0]?.nama} → ${item.perusahaan}` : ''}
            footer={
                <>
                    <button onClick={onClose} className="rounded-2xl px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100">Batal</button>
                    <button onClick={approve} disabled={busy} className="rounded-2xl bg-forest px-6 py-2.5 text-sm font-extrabold text-white hover:bg-forest-soft disabled:opacity-60">
                        {busy ? 'Memproses…' : 'Ya, Setujui'}
                    </button>
                </>
            }
        >
            <p className="text-sm leading-relaxed text-slate-600">
                Status akan berubah menjadi <b>DISETUJUI HUBIN</b> dan tombol <b>Cetak PDF</b> surat pengantar langsung aktif.
                Pengajuan kemudian diteruskan ke HRD perusahaan untuk konfirmasi.
            </p>
        </Modal>
    );
}

function RejectModal({ item, onClose }) {
    const [alasan, setAlasan] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const close = () => {
        setAlasan('');
        setError('');
        onClose();
    };

    const submit = (e) => {
        e.preventDefault();
        if (alasan.trim().length < 5) return setError('Alasan penolakan wajib diisi (minimal 5 karakter).');
        setError('');
        router.post(
            `/admin/pengajuan/${item.id}/status`,
            { status: 'ditolak_hubin', alasan_penolakan: alasan.trim() },
            {
                preserveScroll: true,
                onStart: () => setBusy(true),
                onFinish: () => setBusy(false),
                onError: (errs) => setError(errs.alasan_penolakan || errs.status || 'Gagal menolak pengajuan.'),
                onSuccess: close,
            },
        );
    };

    return (
        <Modal
            open={!!item}
            onClose={close}
            title="Tolak Pengajuan PKL"
            subtitle={item ? `${item.kode} · ${item.siswa[0]?.nama} → ${item.perusahaan}` : ''}
            footer={
                <>
                    <button type="button" onClick={close} className="rounded-2xl px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100">Batal</button>
                    <button form="form-tolak" disabled={busy} className="rounded-2xl bg-rose-600 px-6 py-2.5 text-sm font-extrabold text-white hover:bg-rose-700 disabled:opacity-60">
                        {busy ? 'Mengirim…' : 'Tolak Pengajuan'}
                    </button>
                </>
            }
        >
            <form id="form-tolak" onSubmit={submit}>
                <label className="mb-2 block text-xs font-extrabold text-slate-500">
                    ALASAN PENOLAKAN <span className="text-rose-500">*</span>
                </label>
                <textarea
                    autoFocus
                    rows={4}
                    maxLength={500}
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                    placeholder="Contoh: Kuota perusahaan sudah penuh"
                    className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 ${
                        error ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:border-leaf focus:ring-leaf/30'
                    }`}
                />
                <div className="mt-1 flex justify-between text-xs">
                    <span className="font-semibold text-rose-600">{error}</span>
                    <span className="text-slate-400">{alasan.length}/500</span>
                </div>

                <p className="mb-2 mt-4 text-xs font-extrabold text-slate-400">ALASAN CEPAT</p>
                <div className="flex flex-wrap gap-2">
                    {ALASAN_CEPAT.map((a) => (
                        <button
                            type="button"
                            key={a}
                            onClick={() => { setAlasan(a); setError(''); }}
                            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-emerald-50 hover:text-forest"
                        >
                            {a}
                        </button>
                    ))}
                </div>
                <p className="mt-4 text-xs text-slate-400">Alasan disimpan dan dapat dilihat siswa di dashboard mereka.</p>
            </form>
        </Modal>
    );
}
