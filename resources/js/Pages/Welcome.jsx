import React, { useEffect, useRef } from 'react';
import { Link, Head } from '@inertiajs/react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
    Building2, ArrowRight, Users, FileCheck2, ShieldCheck, MapPin,
    GraduationCap, Check, Clock, Send, Search,
} from 'lucide-react';

const C = { blue: '#1d4ed8', blueSoft: '#eff6ff', yellow: '#facc15', green: '#16a34a', ink: '#0f1b3d' };

/* ReactBits: BlurText */
function BlurText({ text, className = '', delay = 70 }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    return (
        <span ref={ref} className={className} aria-label={text}>
            {text.split(' ').map((w, i) => (
                <motion.span
                    key={i}
                    aria-hidden
                    className="inline-block mr-[0.25em]"
                    initial={{ filter: 'blur(10px)', opacity: 0, y: 14 }}
                    animate={inView ? { filter: 'blur(0px)', opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.55, delay: (i * delay) / 1000, ease: 'easeOut' }}
                >
                    {w}
                </motion.span>
            ))}
        </span>
    );
}

/* Magic UI: NumberTicker */
function NumberTicker({ value }) {
    const ref = useRef(null);
    const raw = String(value ?? 0);
    const num = parseInt(raw.replace(/\D/g, ''), 10) || 0;
    const suffix = raw.replace(/[0-9]/g, '');
    const mv = useMotionValue(0);
    const spring = useSpring(mv, { damping: 60, stiffness: 100 });
    const inView = useInView(ref, { once: true });
    useEffect(() => { if (inView) mv.set(num); }, [inView, num, mv]);
    useEffect(
        () => spring.on('change', (v) => {
            if (ref.current) ref.current.textContent = Math.round(v).toLocaleString('id-ID') + suffix;
        }),
        [spring, suffix]
    );
    return <span ref={ref}>0{suffix}</span>;
}

/* Magic UI: Border Beam */
function BorderBeam({ color = C.yellow, duration = 7 }) {
    return (
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
            <div
                className="absolute aspect-square w-24 beam"
                style={{
                    background: `linear-gradient(to left, ${color}, ${C.blue}, transparent)`,
                    offsetPath: 'rect(0 auto auto 0 round 24px)',
                    animation: `beam ${duration}s linear infinite`,
                }}
            />
        </div>
    );
}

/* Magic UI: Shimmer Button */
function ShimmerButton({ children, href }) {
    return (
        <Link
            href={href}
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#1d4ed8] px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-blue-600/25 transition-transform hover:scale-[1.03] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
            <span className="absolute inset-0 shimmer" />
            <span className="relative flex items-center gap-2">{children}</span>
        </Link>
    );
}

/* Magic UI: Marquee */
function Marquee({ items }) {
    const row = [...items, ...items];
    return (
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
            <div className="marquee flex w-max gap-4 py-2">
                {row.map((n, i) => (
                    <div key={i} className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm">
                        <span className="h-2 w-2 rounded-full" style={{ background: [C.blue, C.yellow, C.green][i % 3] }} />
                        {n}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ReactBits: Spotlight Card */
function SpotlightCard({ children, className = '', color = 'rgba(29,78,216,.10)' }) {
    const ref = useRef(null);
    const move = (e) => {
        const r = ref.current.getBoundingClientRect();
        ref.current.style.setProperty('--x', `${e.clientX - r.left}px`);
        ref.current.style.setProperty('--y', `${e.clientY - r.top}px`);
    };
    return (
        <div ref={ref} onMouseMove={move} className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-white ${className}`}>
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: `radial-gradient(320px circle at var(--x) var(--y), ${color}, transparent 70%)` }}
            />
            <div className="relative">{children}</div>
        </div>
    );
}

const fade = (i = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' },
});

/* Kartu status pengajuan di hero */
function StatusCard() {
    const steps = [
        { icon: Send, title: 'Pengajuan dikirim', note: 'Kelompok RPL-3 · PT Cipta Digital', color: C.blue, done: true },
        { icon: ShieldCheck, title: 'Disetujui Hubin', note: 'Surat pengantar siap dicetak', color: C.green, done: true },
        { icon: Clock, title: 'Menunggu konfirmasi industri', note: 'HRD sedang meninjau', color: '#ca8a04', done: false },
    ];
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="relative mx-auto w-full max-w-md rounded-[24px] border border-slate-200 bg-white p-6 shadow-2xl shadow-blue-900/10"
        >
            <BorderBeam />
            <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Status pengajuan PKL</p>
                <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                    <span className="relative flex h-1.5 w-1.5"><span className="absolute h-full w-full animate-ping rounded-full bg-green-500 opacity-70" /><span className="h-1.5 w-1.5 rounded-full bg-green-600" /></span>
                    Real-time
                </span>
            </div>
            <ol className="relative space-y-5">
                <span className="absolute left-[19px] top-3 h-[calc(100%-1.5rem)] w-px bg-slate-200" />
                {steps.map((s, i) => (
                    <motion.li
                        key={s.title}
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + i * 0.45 }}
                        className="relative flex items-start gap-4"
                    >
                        <span
                            className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4 ring-white"
                            style={{ background: s.done ? s.color : '#fef9c3', color: s.done ? '#fff' : '#a16207' }}
                        >
                            {s.done ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                        </span>
                        <div className="pt-0.5">
                            <p className="text-sm font-semibold text-slate-900">{s.title}</p>
                            <p className="text-xs text-slate-500">{s.note}</p>
                        </div>
                    </motion.li>
                ))}
            </ol>
        </motion.div>
    );
}

export default function Welcome({ auth, stats, mitraList }) {
    const dash =
        auth?.user?.role === 'admin' ? '/admin/dashboard' :
            auth?.user?.role === 'perusahaan' ? '/mitra/dashboard' : '/siswa/dashboard';
    const cta = auth?.user ? dash : '/login';
    const mitraNames = (mitraList?.length ? mitraList.map((m) => m.nama_perusahaan) : ['Mitra industri segera hadir']);

    const features = [
        { icon: Users, color: C.blue, bg: '#eff6ff', title: 'Kelompok tanpa bentrok', text: 'Ketua mengundang teman sekelas. Satu siswa tidak bisa masuk dua kelompok sekaligus.' },
        { icon: ShieldCheck, color: '#a16207', bg: '#fef9c3', title: 'Dua tahap validasi', text: 'Hubin sekolah memeriksa berkas, lalu HRD perusahaan mengonfirmasi sesuai kuota.' },
        { icon: FileCheck2, color: C.green, bg: '#f0fdf4', title: 'Surat pengantar otomatis', text: 'Setelah disetujui Hubin, surat pengantar langsung jadi PDF siap cetak.' },
    ];

    const flow = [
        { icon: Search, color: C.blue, title: 'Pilih mitra bersama kelompok', text: 'Masuk, buat kelompok, lalu pilih perusahaan yang masih punya kuota.' },
        { icon: ShieldCheck, color: '#ca8a04', title: 'Tunggu validasi Hubin', text: 'Tim Hubin memeriksa berkas dan menerbitkan surat pengantar resmi.' },
        { icon: Check, color: C.green, title: 'Dapat konfirmasi industri', text: 'HRD perusahaan menjawab pengajuan. Kamu bisa memantaunya di dashboard.' },
    ];

    return (
        <>
            <Head title="SIM-PKL SMK ICB Cinta Niaga - Pengajuan PKL Online">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            </Head>

            <style>{`
                .pkl { font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif; }
                @keyframes beam { to { offset-distance: 100%; } }
                .beam { offset-distance: 0%; }
                @keyframes shimmer { 0% { transform: translateX(-120%) skewX(-20deg); } 60%,100% { transform: translateX(220%) skewX(-20deg); } }
                .shimmer::before { content:''; position:absolute; inset:0; width:40%; background:linear-gradient(90deg,transparent,rgba(250,204,21,.45),transparent); animation: shimmer 3.2s infinite; }
                @keyframes marquee { to { transform: translateX(-50%); } }
                .marquee { animation: marquee 35s linear infinite; }
                .marquee:hover { animation-play-state: paused; }
                @keyframes floaty { 50% { transform: translateY(-10px); } }
                @media (prefers-reduced-motion: reduce) { .marquee, .beam, .shimmer::before { animation: none !important; } }
            `}</style>

            <div className="pkl min-h-screen bg-white text-slate-700 selection:bg-yellow-200 selection:text-slate-900">
                {/* Navbar */}
                <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1d4ed8] text-white">
                                <GraduationCap className="h-5 w-5" />
                            </span>
                            <span className="text-lg font-extrabold text-[#0f1b3d]">
                                SIM-PKL <span className="font-medium text-slate-400">ICB</span>
                            </span>
                        </div>
                        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
                            <a href="#fitur" className="transition-colors hover:text-[#1d4ed8]">Fitur</a>
                            <a href="#mitra" className="transition-colors hover:text-[#1d4ed8]">Mitra</a>
                            <a href="#alur" className="transition-colors hover:text-[#1d4ed8]">Alur</a>
                        </nav>
                        {auth?.user ? (
                            <Link
                                href={dash}
                                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-[#0f1b3d] transition-colors hover:border-[#1d4ed8] hover:text-[#1d4ed8]"
                            >
                                Buka dashboard
                            </Link>
                        ) : (
                            <a
                                href="/login"
                                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-[#0f1b3d] transition-colors hover:border-[#1d4ed8] hover:text-[#1d4ed8]"
                            >
                                Masuk
                            </a>
                        )}
                    </div>
                </header>

                {/* Hero */}
                <section className="relative overflow-hidden">
                    <div
                        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,#000,transparent)]"
                        style={{ backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)', backgroundSize: '24px 24px' }}
                    />
                    <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl" />
                    <div className="pointer-events-none absolute -left-24 top-48 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

                    <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pt-24">
                        <div>
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 rounded-full border border-yellow-300 bg-yellow-50 px-3.5 py-1.5 text-xs font-semibold text-yellow-800"
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                                Untuk siswa SMK ICB Cinta Niaga
                            </motion.span>

                            <h1 className="mt-6 text-4xl font-extrabold leading-[1.12] tracking-tight text-[#0f1b3d] sm:text-5xl lg:text-[3.4rem]">
                                <BlurText text="Ajukan PKL tanpa bolak-balik ke ruang Hubin" />
                            </h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.9 }}
                                className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600"
                            >
                                Buat kelompok, pilih perusahaan mitra, lalu pantau persetujuan Hubin dan konfirmasi industri dari satu halaman.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.1 }}
                                className="mt-9 flex flex-wrap items-center gap-4"
                            >
                                <ShimmerButton href={cta}>
                                    Ajukan PKL sekarang <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </ShimmerButton>
                                <a href="#mitra" className="rounded-full px-5 py-3.5 text-[15px] font-semibold text-[#0f1b3d] transition-colors hover:bg-slate-100">
                                    Lihat perusahaan mitra
                                </a>
                            </motion.div>
                        </div>

                        <div style={{ animation: 'floaty 6s ease-in-out infinite' }}>
                            <StatusCard />
                        </div>
                    </div>

                    {/* Statistik */}
                    <div className="relative mx-auto max-w-6xl px-5 pb-20">
                        <div className="grid divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                            {[
                                { v: stats?.total_mitra ?? 7, l: 'Perusahaan mitra', c: C.blue },
                                { v: stats?.total_pengajuan ?? 0, l: 'Pengajuan masuk', c: '#ca8a04' },
                                { v: stats?.siswa_terpenuhi ?? 0, l: 'Siswa sudah dapat tempat', c: C.green },
                            ].map((s, i) => (
                                <motion.div key={s.l} {...fade(i)} className="px-8 py-7">
                                    <div className="text-4xl font-extrabold" style={{ color: s.c }}><NumberTicker value={s.v} /></div>
                                    <div className="mt-1 text-sm font-medium text-slate-500">{s.l}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Fitur */}
                <section id="fitur" className="bg-slate-50/70 py-24">
                    <div className="mx-auto max-w-6xl px-5">
                        <motion.div {...fade()} className="max-w-xl">
                            <h2 className="text-3xl font-extrabold tracking-tight text-[#0f1b3d] sm:text-4xl">Semua urusan PKL, dalam satu alur</h2>
                            <p className="mt-4 text-slate-600">Dibuat untuk siswa, tim Hubin, dan HRD perusahaan mitra.</p>
                        </motion.div>
                        <div className="mt-12 grid gap-5 md:grid-cols-3">
                            {features.map((f, i) => (
                                <motion.div key={f.title} {...fade(i)}>
                                    <SpotlightCard className="h-full p-7" color={`${f.color}1f`}>
                                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: f.bg, color: f.color }}>
                                            <f.icon className="h-6 w-6" />
                                        </span>
                                        <h3 className="mt-6 text-lg font-bold text-[#0f1b3d]">{f.title}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.text}</p>
                                    </SpotlightCard>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mitra */}
                <section id="mitra" className="py-24">
                    <div className="mx-auto max-w-6xl px-5">
                        <motion.div {...fade()} className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                            <h2 className="max-w-md text-3xl font-extrabold tracking-tight text-[#0f1b3d] sm:text-4xl">Perusahaan yang siap menerima kamu</h2>
                            <p className="max-w-sm text-slate-600">Cek sisa kuota sebelum memilih, supaya kelompokmu tidak ditolak karena penuh.</p>
                        </motion.div>
                    </div>
                    <Marquee items={mitraNames} />
                    <div className="mx-auto mt-10 max-w-6xl px-5">
                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {mitraList?.length > 0 ? (
                                mitraList.slice(0, 6).map((m, i) => (
                                    <motion.div key={m.id} {...fade(i % 3)}>
                                        <SpotlightCard className="h-full p-6" color="rgba(250,204,21,.18)">
                                            <div className="mb-4 flex items-start justify-between">
                                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#1d4ed8] transition-colors group-hover:bg-[#1d4ed8] group-hover:text-white">
                                                    <Building2 className="h-5 w-5" />
                                                </span>
                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${m.kuota_tersedia > 0 ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {m.kuota_tersedia > 0 ? `Sisa ${m.kuota_tersedia} kuota` : 'Kuota penuh'}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-[#0f1b3d]">{m.nama_perusahaan}</h3>
                                            <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-500">
                                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                                                <span className="line-clamp-2">{m.alamat_lengkap || 'Bandung, Jawa Barat'}</span>
                                            </p>
                                        </SpotlightCard>
                                    </motion.div>
                                ))
                            ) : (
                                <p className="col-span-full rounded-2xl border border-dashed border-slate-300 py-10 text-center text-slate-500">
                                    Belum ada perusahaan mitra. Daftar mitra akan muncul di sini setelah diterbitkan Hubin.
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Alur */}
                <section id="alur" className="bg-slate-50/70 py-24">
                    <div className="mx-auto max-w-6xl px-5">
                        <motion.div {...fade()} className="mx-auto max-w-xl text-center">
                            <h2 className="text-3xl font-extrabold tracking-tight text-[#0f1b3d] sm:text-4xl">Tiga langkah sampai diterima</h2>
                            <p className="mt-4 text-slate-600">Kamu hanya perlu mengurus langkah pertama. Sisanya terpantau otomatis.</p>
                        </motion.div>
                        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
                            <div className="absolute left-[16%] right-[16%] top-8 hidden h-px bg-gradient-to-r from-[#1d4ed8] via-yellow-400 to-[#16a34a] md:block" />
                            {flow.map((s, i) => (
                                <motion.div key={s.title} {...fade(i)} className="relative text-center">
                                    <span
                                        className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg ring-8 ring-slate-50"
                                        style={{ background: s.color }}
                                    >
                                        <s.icon className="h-7 w-7" />
                                    </span>
                                    <h3 className="mt-6 text-lg font-bold text-[#0f1b3d]">{i + 1}. {s.title}</h3>
                                    <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-600">{s.text}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA penutup */}
                <section className="px-5 py-24">
                    <motion.div
                        {...fade()}
                        className="relative mx-auto max-w-4xl overflow-hidden rounded-[32px] bg-[#1d4ed8] px-8 py-16 text-center text-white"
                    >
                        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-yellow-400/90" />
                        <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-[#16a34a]/90" />
                        <div className="relative">
                            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Siap mulai PKL?</h2>
                            <p className="mx-auto mt-3 max-w-md text-blue-100">Login dengan akun siswamu dan ajukan bersama kelompok hari ini.</p>
                            {auth?.user ? (
                                <Link
                                    href={dash}
                                    className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-[#1d4ed8] transition-transform hover:scale-[1.03] active:scale-95"
                                >
                                    Buka dashboard
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            ) : (
                                <a
                                    href="/login"
                                    className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-[#1d4ed8] transition-transform hover:scale-[1.03] active:scale-95"
                                >
                                    Masuk dan ajukan
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </a>
                            )}
                        </div>
                    </motion.div>
                </section>

                <footer className="border-t border-slate-100 py-10">
                    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 text-sm text-slate-500 md:flex-row">
                        <span className="flex items-center gap-2 font-semibold text-[#0f1b3d]">
                            <GraduationCap className="h-5 w-5 text-[#1d4ed8]" /> SMK ICB Cinta Niaga Bandung
                        </span>
                        <p>&copy; {new Date().getFullYear()} SIM-PKL ICB. Seluruh hak cipta dilindungi.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}