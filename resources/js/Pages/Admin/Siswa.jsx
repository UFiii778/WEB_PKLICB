import { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import { FileSpreadsheet, FileDown, ArrowDown, ArrowUp, ChevronsUpDown, SearchX } from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';
import Card, { PageTitle, EmptyState } from '../../Components/Card';
import StatusBadge from '../../Components/StatusBadge';
import { useSearch, matches } from '../../lib/search';
import { statusInfo, isDisetujui } from '../../lib/status';
import { buildXlsx, buildCsv, download } from '../../lib/xlsx';
import { todayISO } from '../../lib/format';

const PLACEHOLDER = 'Murid belum mengajukan tempat';

const COLUMNS = [
    { key: 'no',         label: 'No',                w: 'w-16',  align: 'text-center' },
    { key: 'nama',       label: 'Nama Siswa',        w: 'min-w-[220px]' },
    { key: 'kelas',      label: 'Kelas',             w: 'w-36' },
    { key: 'jurusan',    label: 'Jurusan',           w: 'min-w-[200px]' },
    { key: 'perusahaan', label: 'Perusahaan Tujuan', w: 'min-w-[260px]' },
    { key: 'status',     label: 'Status Validasi',   w: 'w-52' },
];

const STATUS_OPTIONS = [
    ['semua', 'Semua status'],
    ['belum_mengajukan', 'Belum Mengajukan'],
    ['pending', 'Pending'],
    ['disetujui_hubin', 'Disetujui Hubin'],
    ['diterima_mitra', 'Diterima Mitra'],
    ['ditolak', 'Ditolak'],
];

const colLetter = (i) => String.fromCharCode(65 + i);

export default function Siswa({ siswa }) {
    const query = useSearch();
    const [status, setStatus] = useState('semua');
    const [sort, setSort] = useState({ key: null, dir: 'asc' });
    const [cell, setCell] = useState(null); // { r, c }

    const rows = useMemo(() => {
        let list = siswa.filter(
            (s) =>
                (status === 'semua' ||
                    s.status === status ||
                    (status === 'ditolak' && s.status.startsWith('ditolak'))) &&
                matches(query, s.nama, s.kelas, s.jurusan, s.perusahaan, s.nis),
        );
        if (sort.key) {
            const get = (s) => (sort.key === 'status' ? statusInfo(s.status).label : (s[sort.key] ?? ''));
            list = [...list].sort((a, b) => String(get(a)).localeCompare(String(get(b)), 'id', { numeric: true }) * (sort.dir === 'asc' ? 1 : -1));
        }
        return list;
    }, [siswa, query, status, sort]);

    const toggleSort = (key) => {
        if (key === 'no') return;
        setSort((s) => (s.key !== key ? { key, dir: 'asc' } : s.dir === 'asc' ? { key, dir: 'desc' } : { key: null, dir: 'asc' }));
    };

    // Isi tiap sel sesuai aturan logika data
    const cellText = (s, key, idx) => {
        switch (key) {
            case 'no': return String(idx + 1);
            case 'perusahaan': return s.perusahaan ?? PLACEHOLDER;
            case 'status': return statusInfo(s.status).label;
            default: return s[key] ?? '';
        }
    };

    const exportData = () => ({
        headers: COLUMNS.map((c) => c.label),
        rows: siswa.map((s, i) => [
            i + 1,
            s.nama,
            s.kelas,
            s.jurusan,
            s.perusahaan ? s.perusahaan : { v: PLACEHOLDER, italic: true },
            statusInfo(s.status).label,
        ]),
        widths: [6, 30, 14, 36, 36, 20],
        sheetName: 'Data Siswa',
    });

    const stamp = todayISO();
    const exportXlsx = () => download(buildXlsx(exportData()), `Data-Siswa-PKL-${stamp}.xlsx`);
    const exportCsv = () => download(buildCsv(exportData()), `Data-Siswa-PKL-${stamp}.csv`);

    const formula = cell && rows[cell.r] ? cellText(rows[cell.r], COLUMNS[cell.c].key, cell.r) : '';

    return (
        <>
            <Head title="Data Siswa" />

            <PageTitle title="Data Siswa" subtitle="Rekapitulasi seluruh siswa beserta status dan perusahaan tujuan PKL.">
                <div className="flex flex-wrap gap-2">
                    <button onClick={exportXlsx} className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-extrabold text-white shadow-forest transition hover:bg-forest-soft">
                        <FileSpreadsheet className="h-4 w-4" /> Export to Excel (.xlsx)
                    </button>
                    <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-forest shadow-card transition hover:bg-emerald-50">
                        <FileDown className="h-4 w-4" /> CSV
                    </button>
                </div>
            </PageTitle>

            <Card className="overflow-hidden">
                {/* Toolbar ala Google Sheets */}
                <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-3">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:border-leaf"
                    >
                        {STATUS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <div className="flex min-w-[240px] flex-1 items-center overflow-hidden rounded-lg border border-slate-200 text-sm">
                        <span className="w-16 shrink-0 border-r border-slate-200 bg-slate-50 py-1.5 text-center text-xs font-bold text-slate-500">
                            {cell ? `${colLetter(cell.c)}${cell.r + 2}` : '—'}
                        </span>
                        <span className="px-3 py-1.5 text-slate-600">
                            <i className="mr-2 font-serif text-slate-300">fx</i>
                            {formula === PLACEHOLDER ? <em className="text-slate-400">{formula}</em> : formula}
                        </span>
                    </div>
                    <span className="ml-auto text-xs font-semibold text-slate-400">{rows.length} dari {siswa.length} siswa</span>
                </div>

                <div className="scrollbar-thin max-h-[calc(100vh-380px)] min-h-[320px] overflow-auto">
                    <table className="w-full border-separate border-spacing-0 text-sm">
                        <thead className="sticky top-0 z-10">
                            {/* Baris huruf kolom */}
                            <tr>
                                <th className="border-b border-r border-slate-200 bg-slate-100" />
                                {COLUMNS.map((c, i) => (
                                    <th key={c.key} className="border-b border-r border-slate-200 bg-slate-100 py-1 text-center text-[11px] font-bold text-slate-400">
                                        {colLetter(i)}
                                    </th>
                                ))}
                            </tr>
                            <tr>
                                <th className="border-b border-r border-slate-200 bg-slate-50 px-2 text-center text-[11px] font-bold text-slate-400">1</th>
                                {COLUMNS.map((c) => {
                                    const active = sort.key === c.key;
                                    return (
                                        <th
                                            key={c.key}
                                            onClick={() => toggleSort(c.key)}
                                            className={`${c.w} select-none whitespace-nowrap border-b border-r border-slate-200 bg-emerald-50 px-4 py-3 text-left text-xs font-extrabold tracking-wide text-forest ${c.key !== 'no' ? 'cursor-pointer hover:bg-emerald-100' : ''} ${c.align ?? ''}`}
                                        >
                                            <span className="inline-flex items-center gap-1.5">
                                                {c.label.toUpperCase()}
                                                {c.key !== 'no' && (active
                                                    ? (sort.dir === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />)
                                                    : <ChevronsUpDown className="h-3.5 w-3.5 opacity-30" />)}
                                            </span>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((s, r) => (
                                <tr key={s.id} className="group">
                                    <td className="border-b border-r border-slate-200 bg-slate-50 px-2 text-center text-[11px] font-bold text-slate-400">{r + 2}</td>
                                    {COLUMNS.map((c, ci) => {
                                        const selected = cell && cell.r === r && cell.c === ci;
                                        return (
                                            <td
                                                key={c.key}
                                                onClick={() => setCell({ r, c: ci })}
                                                className={`border-b border-r border-slate-200 px-4 py-2.5 ${c.align ?? ''} ${
                                                    selected ? 'bg-emerald-50 outline-2 -outline-offset-2 outline-leaf' : 'group-hover:bg-slate-50/70'
                                                }`}
                                            >
                                                <CellContent s={s} k={c.key} idx={r} />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {rows.length === 0 && (
                        <EmptyState icon={SearchX} title="Tidak ada data siswa" text={siswa.length ? 'Ubah filter atau kata kunci pencarian.' : 'Belum ada siswa yang terdaftar.'} />
                    )}
                </div>

                <div className="flex items-center gap-2 border-t border-slate-200 bg-slate-50 px-4 py-2">
                    <span className="rounded-t-lg border-b-2 border-forest bg-white px-4 py-1.5 text-xs font-extrabold text-forest">Data Siswa</span>
                    <span className="ml-auto text-[11px] text-slate-400">Klik judul kolom untuk mengurutkan · klik sel untuk memilih</span>
                </div>
            </Card>
        </>
    );
}

Siswa.layout = (page) => <AdminLayout>{page}</AdminLayout>;

function CellContent({ s, k, idx }) {
    if (k === 'no') return <span className="font-semibold text-slate-400">{idx + 1}</span>;
    if (k === 'nama') return <span className="font-bold text-ink">{s.nama}</span>;
    if (k === 'status') return <StatusBadge status={s.status} />;
    if (k === 'perusahaan') {
        if (!s.perusahaan) return <span className="italic text-slate-400">{PLACEHOLDER}</span>;
        if (isDisetujui(s.status)) return <span className="font-extrabold text-forest">{s.perusahaan}</span>;
        if (s.status.startsWith('ditolak')) return <span className="text-slate-400 line-through" title={s.alasan ?? undefined}>{s.perusahaan}</span>;
        return <span className="font-semibold text-slate-500">{s.perusahaan}</span>;
    }
    return <span className="text-slate-600">{s[k]}</span>;
}
