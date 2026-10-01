import { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Trophy, TrendingUp, TriangleAlert, ChartPie, SearchX } from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';
import Card, { PageTitle, EmptyState } from '../../Components/Card';
import { useSearch, matches } from '../../lib/search';

const COLORS = ['#03503b', '#10b981', '#6ee7b7', '#f59e0b', '#cbd5e1'];
const pct = (n, total) => (total > 0 ? Math.round((n / total) * 1000) / 10 : 0);

export default function Analisis({ perusahaan, total_peminat }) {
    const query = useSearch();
    const [hover, setHover] = useState(null);

    const visible = useMemo(() => perusahaan.filter((p) => matches(query, p.nama)), [perusahaan, query]);
    const withMinat = perusahaan.filter((p) => p.peminat > 0);

    // Donut: 4 teratas + "Perusahaan Lain"
    const slices = useMemo(() => {
        const top = withMinat.slice(0, 4).map((p, i) => ({ nama: p.nama, n: p.peminat, color: COLORS[i] }));
        const restN = withMinat.slice(4).reduce((n, p) => n + p.peminat, 0);
        if (restN > 0) top.push({ nama: 'Perusahaan Lain', n: restN, color: COLORS[4] });
        return top.map((s) => ({ ...s, pct: pct(s.n, total_peminat) }));
    }, [withMinat, total_peminat]);

    const terfavorit = withMinat[0];
    const rate = (p) => pct(p.diterima, p.peminat);
    const terbaik = [...withMinat].filter((p) => p.peminat >= 1).sort((a, b) => rate(b) - rate(a) || b.peminat - a.peminat)[0];
    const kritis = perusahaan.filter((p) => p.status_mitra === 'aktif' && p.pending + p.disetujui > p.kuota_sisa);

    if (perusahaan.length === 0 || total_peminat === 0) {
        return (
            <>
                <Head title="Analisis Peminat" />
                <PageTitle title="Analisis Peminat" subtitle="Tren minat siswa terhadap lokasi PKL." />
                <Card><EmptyState icon={ChartPie} title="Belum ada data peminat" text="Grafik akan muncul setelah siswa mulai mengajukan PKL ke perusahaan mitra." /></Card>
            </>
        );
    }

    return (
        <>
            <Head title="Analisis Peminat" />
            <PageTitle title="Analisis Peminat" subtitle={`Tren minat ${total_peminat} siswa terhadap lokasi PKL, berdasarkan seluruh pengajuan yang masuk.`} />

            {/* Insight */}
            <div className="grid gap-5 md:grid-cols-3">
                <Insight icon={Trophy} tone="bg-amber-50 text-amber-600" title="Paling diminati">
                    <b>{terfavorit.nama}</b> dipilih <b>{pct(terfavorit.peminat, total_peminat)}%</b> siswa ({terfavorit.peminat} dari {total_peminat} siswa).
                </Insight>
                <Insight icon={TrendingUp} tone="bg-emerald-50 text-emerald-600" title="Track record terbaik">
                    {terbaik && terbaik.diterima > 0 ? (
                        <><b>{terbaik.nama}</b> menerima {terbaik.diterima} dari {terbaik.peminat} pengaju (<b>{rate(terbaik)}%</b>).</>
                    ) : (
                        'Belum ada perusahaan yang mengonfirmasi penerimaan siswa.'
                    )}
                </Insight>
                <Insight icon={TriangleAlert} tone="bg-rose-50 text-rose-600" title="Perlu perhatian">
                    {kritis.length ? (
                        <>Peminat melebihi sisa kuota di <b>{kritis.map((k) => k.nama).join(', ')}</b>. Pertimbangkan menambah kuota.</>
                    ) : (
                        'Semua pengajuan yang menunggu masih tertampung oleh sisa kuota mitra.'
                    )}
                </Insight>
            </div>

            <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
                {/* Donut / pie */}
                <Card className="p-7">
                    <h3 className="font-extrabold text-ink">Distribusi Minat Mitra</h3>
                    <p className="text-sm text-slate-400">Persentase siswa per perusahaan tujuan</p>

                    <div className="relative mx-auto my-6 h-[220px] w-[220px]">
                        <Donut slices={slices} hover={hover} setHover={setHover} />
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-12 text-center">
                            {hover !== null ? (
                                <>
                                    <p className="text-3xl font-black text-ink">{slices[hover].pct}%</p>
                                    <p className="line-clamp-2 text-[11px] font-bold text-slate-400">{slices[hover].nama}</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-3xl font-black text-ink">{total_peminat}</p>
                                    <p className="text-[11px] font-bold text-slate-400">TOTAL SISWA</p>
                                </>
                            )}
                        </div>
                    </div>

                    <ul className="space-y-1">
                        {slices.map((s, i) => (
                            <li
                                key={s.nama}
                                onMouseEnter={() => setHover(i)}
                                onMouseLeave={() => setHover(null)}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${hover === i ? 'bg-slate-50' : ''}`}
                            >
                                <i className="h-3 w-3 shrink-0 rounded-full" style={{ background: s.color }} />
                                <span className="flex-1 truncate font-semibold text-slate-600">{s.nama}</span>
                                <span className="font-extrabold text-ink">{s.pct}%</span>
                            </li>
                        ))}
                    </ul>
                </Card>

                {/* Bar chart */}
                <Card className="p-7">
                    <h3 className="font-extrabold text-ink">Peringkat Peminat per Perusahaan</h3>
                    <p className="mb-6 text-sm text-slate-400">Jumlah siswa yang mengajukan, dipecah per status</p>

                    {visible.length === 0 ? (
                        <EmptyState icon={SearchX} title="Perusahaan tidak ditemukan" />
                    ) : (
                        <div className="space-y-5">
                            {visible.map((p) => {
                                const max = Math.max(...perusahaan.map((x) => x.peminat), 1);
                                const seg = [
                                    { n: p.diterima, c: 'bg-emerald-500', t: 'Diterima Mitra' },
                                    { n: p.disetujui, c: 'bg-blue-400', t: 'Disetujui Hubin' },
                                    { n: p.pending, c: 'bg-amber-400', t: 'Pending' },
                                    { n: p.ditolak, c: 'bg-rose-300', t: 'Ditolak' },
                                ];
                                return (
                                    <div key={p.id}>
                                        <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                                            <span className="truncate font-bold text-ink">{p.nama}</span>
                                            <span className="shrink-0 font-extrabold text-forest">
                                                {pct(p.peminat, total_peminat)}% <span className="font-semibold text-slate-400">· {p.peminat} siswa</span>
                                            </span>
                                        </div>
                                        <div className="flex h-3.5 overflow-hidden rounded-full bg-slate-100" style={{ width: '100%' }}>
                                            <div className="flex h-full" style={{ width: `${(p.peminat / max) * 100}%` }}>
                                                {seg.map((s) => s.n > 0 && (
                                                    <div key={s.t} title={`${s.t}: ${s.n}`} className={`${s.c} h-full`} style={{ width: `${(s.n / p.peminat) * 100}%` }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="flex flex-wrap gap-4 pt-1 text-xs font-semibold text-slate-500">
                                <Legend c="bg-emerald-500" t="Diterima Mitra" />
                                <Legend c="bg-blue-400" t="Disetujui Hubin" />
                                <Legend c="bg-amber-400" t="Pending" />
                                <Legend c="bg-rose-300" t="Ditolak" />
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Tabel track record */}
            <Card className="p-7">
                <h3 className="font-extrabold text-ink">Track Record Kerja Sama</h3>
                <p className="mb-5 text-sm text-slate-400">Statistik tiap mitra untuk membantu keputusan penempatan dan negosiasi kuota</p>
                <div className="scrollbar-thin overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-[11px] font-extrabold tracking-wide text-slate-400">
                                <th className="px-4 py-3">#</th>
                                <th className="px-4 py-3">PERUSAHAAN</th>
                                <th className="px-4 py-3 text-right">PEMINAT</th>
                                <th className="px-4 py-3 text-right">DITERIMA</th>
                                <th className="px-4 py-3 text-right">DITOLAK</th>
                                <th className="px-4 py-3 text-right">TINGKAT PENERIMAAN</th>
                                <th className="px-4 py-3 text-right">SISA KUOTA</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {visible.map((p, i) => (
                                <tr key={p.id} className="hover:bg-slate-50/60">
                                    <td className="px-4 py-3.5 font-bold text-slate-300">{i + 1}</td>
                                    <td className="px-4 py-3.5 font-bold text-ink">
                                        {p.nama}
                                        {p.status_mitra !== 'aktif' && <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-extrabold text-slate-500">NONAKTIF</span>}
                                    </td>
                                    <td className="px-4 py-3.5 text-right font-bold">{p.peminat}</td>
                                    <td className="px-4 py-3.5 text-right font-bold text-emerald-700">{p.diterima}</td>
                                    <td className="px-4 py-3.5 text-right font-bold text-rose-600">{p.ditolak}</td>
                                    <td className="px-4 py-3.5 text-right">
                                        {p.peminat ? <span className="font-extrabold text-forest">{rate(p)}%</span> : <span className="text-slate-300">–</span>}
                                    </td>
                                    <td className={`px-4 py-3.5 text-right font-bold ${p.kuota_sisa <= 0 ? 'text-rose-500' : ''}`}>
                                        {p.kuota_sisa <= 0 ? 'Penuh' : p.kuota_sisa}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </>
    );
}

Analisis.layout = (page) => <AdminLayout>{page}</AdminLayout>;

function Insight({ icon: Icon, tone, title, children }) {
    return (
        <Card className="flex gap-4 p-6">
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tone}`}><Icon className="h-6 w-6" /></span>
            <div>
                <p className="text-xs font-extrabold tracking-wide text-slate-400">{title.toUpperCase()}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{children}</p>
            </div>
        </Card>
    );
}

function Legend({ c, t }) {
    return <span className="flex items-center gap-2"><i className={`h-2.5 w-2.5 rounded-full ${c}`} /> {t}</span>;
}

function Donut({ slices, hover, setHover }) {
    const r = 80;
    const C = 2 * Math.PI * r;
    const total = slices.reduce((n, s) => n + s.n, 0);
    let acc = 0;

    return (
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
            <circle cx="100" cy="100" r={r} fill="none" stroke="#f1f5f9" strokeWidth="26" />
            {slices.map((s, i) => {
                const len = (s.n / total) * C;
                const el = (
                    <circle
                        key={s.nama}
                        cx="100" cy="100" r={r} fill="none"
                        stroke={s.color}
                        strokeWidth={hover === i ? 32 : 26}
                        strokeDasharray={`${Math.max(len - 2, 0)} ${C - Math.max(len - 2, 0)}`}
                        strokeDashoffset={-acc}
                        style={{ transition: 'stroke-width .15s', cursor: 'pointer' }}
                        onMouseEnter={() => setHover(i)}
                        onMouseLeave={() => setHover(null)}
                    >
                        <title>{`${s.nama}: ${s.pct}% (${s.n} siswa)`}</title>
                    </circle>
                );
                acc += len;
                return el;
            })}
        </svg>
    );
}
