import { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, CalendarDays, Phone, Rocket, Flag, Activity, Building2 } from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';
import Card, { PageTitle } from '../../Components/Card';
import Modal from '../../Components/Modal';
import StatusBadge from '../../Components/StatusBadge';
import { useSearch, matches } from '../../lib/search';
import { BULAN, HARI_PENDEK, parseISO, toISO, todayISO, fmtDate, fmtDateLong, daysBetween } from '../../lib/format';

const pad = (n) => String(n).padStart(2, '0');
const monthStart = (y, m) => `${y}-${pad(m + 1)}-01`;
const monthEnd = (y, m) => toISO(new Date(y, m + 1, 0));

export default function Jadwal({ jadwal }) {
    const query = useSearch();
    const today = todayISO();

    const events = useMemo(
        () => jadwal.filter((e) => matches(query, e.perusahaan, e.kode, ...e.siswa.map((s) => s.nama))),
        [jadwal, query],
    );

    // Bulan awal: bulan ini; kalau kosong, loncat ke jadwal terdekat
    const [cursor, setCursor] = useState(() => {
        const now = new Date();
        const overlaps = (y, m) => jadwal.some((e) => e.tgl_mulai <= monthEnd(y, m) && e.tgl_selesai >= monthStart(y, m));
        if (jadwal.length && !overlaps(now.getFullYear(), now.getMonth())) {
            const sorted = [...jadwal].sort((a, b) => a.tgl_mulai.localeCompare(b.tgl_mulai));
            const target = sorted.find((e) => e.tgl_mulai >= today) ?? sorted[sorted.length - 1];
            const d = parseISO(target.tgl_mulai);
            return { y: d.getFullYear(), m: d.getMonth() };
        }
        return { y: now.getFullYear(), m: now.getMonth() };
    });
    const [selected, setSelected] = useState(null);

    const go = (delta) =>
        setCursor(({ y, m }) => {
            const d = new Date(y, m + delta, 1);
            return { y: d.getFullYear(), m: d.getMonth() };
        });

    // 6 minggu penuh, mulai hari Senin
    const cells = useMemo(() => {
        const first = new Date(cursor.y, cursor.m, 1);
        const offset = (first.getDay() + 6) % 7;
        return Array.from({ length: 42 }, (_, i) => new Date(cursor.y, cursor.m, 1 - offset + i));
    }, [cursor]);

    const info = (iso) => {
        const starts = events.filter((e) => e.tgl_mulai === iso);
        const ends = events.filter((e) => e.tgl_selesai === iso);
        const ongoing = events.filter((e) => e.tgl_mulai < iso && iso < e.tgl_selesai);
        return { starts, ends, ongoing, active: starts.length + ends.length + ongoing.length > 0 };
    };

    const chipsFor = ({ starts, ends }) => {
        const group = (list) => {
            const map = new Map();
            list.forEach((e) => map.set(e.perusahaan, (map.get(e.perusahaan) ?? 0) + e.siswa.length));
            return [...map.entries()];
        };
        return [
            ...group(starts).map(([nama, n]) => ({ kind: 'mulai', text: `${n} Siswa PKL`, sub: nama })),
            ...group(ends).map(([nama, n]) => ({ kind: 'selesai', text: `Selesai · ${n} siswa`, sub: nama })),
        ];
    };

    const mulaiBulanIni = events.filter((e) => e.tgl_mulai >= monthStart(cursor.y, cursor.m) && e.tgl_mulai <= monthEnd(cursor.y, cursor.m));
    const berjalan = events.filter((e) => e.tgl_mulai <= today && today <= e.tgl_selesai);
    const agenda = (() => {
        const map = new Map();
        events.filter((e) => e.tgl_mulai >= today).forEach((e) => {
            const k = `${e.tgl_mulai}|${e.perusahaan}`;
            const cur = map.get(k) ?? { key: k, tgl_mulai: e.tgl_mulai, tgl_selesai: e.tgl_selesai, perusahaan: e.perusahaan, jumlah: 0 };
            cur.jumlah += e.siswa.length;
            map.set(k, cur);
        });
        return [...map.values()].sort((a, b) => a.tgl_mulai.localeCompare(b.tgl_mulai)).slice(0, 5);
    })();
    const sumSiswa = (list) => list.reduce((n, e) => n + e.siswa.length, 0);

    return (
        <>
            <Head title="Jadwal PKL" />
            <PageTitle title="Jadwal PKL" subtitle="Kalender pelaksanaan PKL. Klik tanggal yang bertanda untuk melihat detail siswa." />

            <div className="grid gap-6 2xl:grid-cols-[1fr_320px]">
                <Card className="p-5 sm:p-7">
                    {/* Toolbar kalender */}
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                        <h3 className="mr-auto text-2xl font-extrabold tracking-tight text-ink">
                            {BULAN[cursor.m]} <span className="text-slate-400">{cursor.y}</span>
                        </h3>
                        <button
                            onClick={() => { const n = new Date(); setCursor({ y: n.getFullYear(), m: n.getMonth() }); }}
                            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-50"
                        >
                            Hari ini
                        </button>
                        <div className="flex gap-1">
                            <button onClick={() => go(-1)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Bulan sebelumnya"><ChevronLeft className="h-5 w-5" /></button>
                            <button onClick={() => go(1)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Bulan berikutnya"><ChevronRight className="h-5 w-5" /></button>
                        </div>
                    </div>

                    <div className="scrollbar-thin overflow-x-auto">
                        <div className="min-w-[720px]">
                            <div className="grid grid-cols-7 border-b border-slate-100 pb-2">
                                {HARI_PENDEK.map((h) => (
                                    <div key={h} className="px-2 text-xs font-extrabold tracking-wide text-slate-400">{h.toUpperCase()}</div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7">
                                {cells.map((d) => {
                                    const iso = toISO(d);
                                    const inMonth = d.getMonth() === cursor.m;
                                    const i = info(iso);
                                    const chips = chipsFor(i);
                                    const isToday = iso === today;

                                    return (
                                        <div
                                            key={iso}
                                            onClick={() => i.active && setSelected(iso)}
                                            role={i.active ? 'button' : undefined}
                                            className={`min-h-[108px] border-b border-r border-slate-100 p-1.5 transition first:border-l-0 ${
                                                i.active ? 'cursor-pointer hover:bg-emerald-50/70' : ''
                                            } ${i.ongoing.length || (i.active && !chips.length) ? 'bg-emerald-50/40' : ''} ${inMonth ? '' : 'bg-slate-50/60'}`}
                                        >
                                            <span
                                                className={`mb-1 grid h-7 w-7 place-items-center rounded-full text-sm font-bold ${
                                                    isToday ? 'bg-forest text-white' : inMonth ? 'text-ink' : 'text-slate-300'
                                                }`}
                                            >
                                                {d.getDate()}
                                            </span>
                                            <div className="space-y-1">
                                                {chips.slice(0, 2).map((c, k) => (
                                                    <div
                                                        key={k}
                                                        title={`${c.text} — ${c.sub}`}
                                                        className={`rounded-lg px-2 py-1 text-[11px] leading-tight ${
                                                            c.kind === 'mulai'
                                                                ? 'bg-forest text-white'
                                                                : 'border border-slate-200 bg-white text-slate-500'
                                                        }`}
                                                    >
                                                        <p className="truncate font-extrabold">{c.text}</p>
                                                        <p className={`truncate ${c.kind === 'mulai' ? 'text-emerald-100/90' : 'text-slate-400'}`}>{c.sub}</p>
                                                    </div>
                                                ))}
                                                {chips.length > 2 && <p className="px-1 text-[11px] font-bold text-slate-400">+{chips.length - 2} lagi</p>}
                                                {i.ongoing.length > 0 && (
                                                    <div
                                                        title={`${sumSiswa(i.ongoing)} siswa sedang PKL`}
                                                        className="mx-0.5 h-1.5 rounded-full bg-emerald-200"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-5 text-xs font-semibold text-slate-500">
                        <span className="flex items-center gap-2"><i className="h-3 w-3 rounded bg-forest" /> Tanggal mulai PKL</span>
                        <span className="flex items-center gap-2"><i className="h-3 w-3 rounded border border-slate-300 bg-white" /> Tanggal selesai</span>
                        <span className="flex items-center gap-2"><i className="h-3 w-3 rounded bg-emerald-100" /> PKL sedang berjalan</span>
                    </div>
                </Card>

                {/* Panel samping */}
                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4 2xl:grid-cols-1">
                        <Card className="p-5">
                            <p className="flex items-center gap-2 text-xs font-extrabold text-slate-400"><Rocket className="h-4 w-4" /> MULAI BULAN INI</p>
                            <p className="mt-2 text-3xl font-black text-ink">{sumSiswa(mulaiBulanIni)} <span className="text-sm font-bold text-slate-400">siswa</span></p>
                        </Card>
                        <Card className="p-5">
                            <p className="flex items-center gap-2 text-xs font-extrabold text-slate-400"><Activity className="h-4 w-4" /> BERJALAN HARI INI</p>
                            <p className="mt-2 text-3xl font-black text-forest">{sumSiswa(berjalan)} <span className="text-sm font-bold text-slate-400">siswa</span></p>
                        </Card>
                    </div>

                    <Card className="p-5">
                        <p className="mb-3 text-xs font-extrabold text-slate-400">AGENDA TERDEKAT</p>
                        {agenda.length === 0 ? (
                            <p className="py-4 text-sm italic text-slate-400">Belum ada jadwal mendatang.</p>
                        ) : (
                            <ul className="space-y-3">
                                {agenda.map((e) => (
                                    <li key={e.key}>
                                        <button
                                            onClick={() => { const d = parseISO(e.tgl_mulai); setCursor({ y: d.getFullYear(), m: d.getMonth() }); setSelected(e.tgl_mulai); }}
                                            className="w-full rounded-2xl p-3 text-left transition hover:bg-slate-50"
                                        >
                                            <p className="text-xs font-extrabold text-forest">{fmtDate(e.tgl_mulai)}</p>
                                            <p className="font-bold text-ink">{e.perusahaan}</p>
                                            <p className="text-xs text-slate-400">{e.jumlah} siswa · {daysBetween(e.tgl_mulai, e.tgl_selesai)} hari</p>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>
            </div>

            <DetailModal iso={selected} info={selected ? info(selected) : null} onClose={() => setSelected(null)} />
        </>
    );
}

Jadwal.layout = (page) => <AdminLayout>{page}</AdminLayout>;

function DetailModal({ iso, info, onClose }) {
    const sections = info
        ? [
              { key: 'mulai', title: 'Mulai PKL', icon: Rocket, list: info.starts, tone: 'text-forest' },
              { key: 'selesai', title: 'Selesai PKL', icon: Flag, list: info.ends, tone: 'text-slate-500' },
              { key: 'jalan', title: 'Sedang berlangsung', icon: Activity, list: info.ongoing, tone: 'text-emerald-600' },
          ].filter((s) => s.list.length)
        : [];

    return (
        <Modal open={!!iso} onClose={onClose} size="lg" title={iso ? fmtDateLong(iso) : ''} subtitle="Detail pelaksanaan PKL pada tanggal ini">
            <div className="space-y-6">
                {sections.map(({ key, title, icon: Icon, list, tone }) => (
                    <section key={key}>
                        <h4 className={`mb-3 flex items-center gap-2 text-sm font-extrabold ${tone}`}>
                            <Icon className="h-4 w-4" /> {title}
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                                {list.reduce((n, e) => n + e.siswa.length, 0)} siswa
                            </span>
                        </h4>
                        <div className="space-y-3">
                            {list.map((e) => (
                                <div key={e.id} className="rounded-2xl border border-slate-100 p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                            <p className="flex items-center gap-2 font-extrabold text-ink">
                                                <Building2 className="h-4 w-4 text-slate-400" /> {e.perusahaan}
                                            </p>
                                            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                {fmtDate(e.tgl_mulai)} s.d. {fmtDate(e.tgl_selesai)} · {daysBetween(e.tgl_mulai, e.tgl_selesai)} hari
                                            </p>
                                        </div>
                                        <StatusBadge status={e.status} />
                                    </div>
                                    <ul className="mt-3 divide-y divide-slate-100 rounded-xl bg-slate-50/70">
                                        {e.siswa.map((s) => (
                                            <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                                                <span className="font-bold text-ink">
                                                    {s.nama}
                                                    {s.ketua && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">KETUA</span>}
                                                </span>
                                                <span className="text-xs text-slate-400">{s.kelas}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                                        <Phone className="h-3.5 w-3.5" /> Kontak HRD: <b className="text-slate-600">{e.kontak_hrd ?? '-'}</b> · Kode {e.kode}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </Modal>
    );
}
