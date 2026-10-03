import React from 'react';
import { Link, router } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { Building2, FileCheck, Download, MapPin, Phone, ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react';

const statusText = {
    pending: 'Menunggu Validasi Hubin',
    disetujui_hubin: 'Disetujui Hubin',
    diterima_mitra: 'Diterima Perusahaan',
    ditolak_hubin: 'Ditolak Hubin',
    ditolak_mitra: 'Ditolak Perusahaan',
};

export default function Dashboard({ pengajuan, perusahaanList = [] }) {
    const canPrint = pengajuan && ['disetujui_hubin', 'diterima_mitra'].includes(pengajuan.status);
    const rejected = pengajuan?.ditolak;

    return (
        <SiswaLayout>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Stat title="Status Pengajuan" value={pengajuan ? statusText[pengajuan.status] || pengajuan.status : 'Belum Mengajukan'} icon={ArrowUpRight} dark />
                <Stat title="Perusahaan Tujuan" value={pengajuan?.perusahaan || '-'} subtitle={pengajuan ? 'Tujuan PKL' : 'Belum ada pengajuan'} icon={Building2} />
                <Stat title="Kode Pengajuan" value={pengajuan?.kode || '-'} subtitle={pengajuan ? 'Gunakan untuk verifikasi' : 'Akan muncul setelah mengajukan'} icon={FileCheck} />
                <Stat title="Katalog Perusahaan" value={perusahaanList.length} subtitle="Mitra aktif tersedia" icon={Building2} />
            </div>

            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Status Pengajuan PKL Anda</h3>
                        <p className="mt-0.5 text-xs text-slate-400">Pantau proses pengajuan dari Hubin sampai perusahaan.</p>
                    </div>
                    {canPrint && (
                        <a href={`/siswa/pengajuan/${pengajuan.id}/cetak-surat`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#004d38] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#003829]">
                            <Download className="h-4 w-4" /> Cetak Surat Pengantar
                        </a>
                    )}
                </div>

                {rejected ? (
                    <div className="mt-5 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <div><b>{statusText[pengajuan.status]}</b><p className="mt-1 text-xs">{pengajuan.alasan || 'Tidak ada alasan yang dicantumkan.'}</p></div>
                    </div>
                ) : pengajuan ? (
                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Step active={pengajuan.step >= 1} number="1" title="Pengajuan Dikirim" text="Berkas diterima sistem" />
                        <Step active={pengajuan.step >= 2} number="2" title="Disetujui Hubin" text="Menunggu/siap ke perusahaan" />
                        <Step active={pengajuan.step >= 3} number="3" title="Konfirmasi Perusahaan" text="Diterima oleh HRD" />
                    </div>
                ) : (
                    <div className="mt-5 rounded-2xl bg-slate-50 p-6 text-center">
                        <p className="font-bold text-slate-700">Kamu belum memiliki pengajuan PKL.</p>
                        <Link href="/siswa/mitra" className="mt-3 inline-flex rounded-xl bg-[#004d38] px-4 py-2.5 text-xs font-bold text-white">Cari Mitra & Ajukan PKL</Link>
                    </div>
                )}
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-end justify-between gap-3">
                    <div><h3 className="text-lg font-bold text-slate-900">Katalog Perusahaan Mitra</h3><p className="mt-0.5 text-xs text-slate-400">Mitra aktif yang tersedia untuk pengajuan.</p></div>
                    <Link href="/siswa/mitra" className="text-xs font-bold text-[#004d38] hover:underline">Lihat semua</Link>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {perusahaanList.slice(0, 6).map((item) => (
                        <div key={item.id} className="flex flex-col justify-between space-y-4 rounded-2xl border border-slate-100 bg-slate-50/30 p-5">
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2"><h4 className="text-base font-bold text-slate-900">{item.nama}</h4><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${item.kuota > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>Kuota: {item.kuota}</span></div>
                                <p className="flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />{item.alamat}</p>
                                <p className="flex items-center gap-1.5 text-xs text-slate-500"><Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />{item.kontak}</p>
                            </div>
                            <Link href={`/siswa/mitra?perusahaan=${item.id}`} className={`w-full rounded-xl py-2.5 text-center text-xs font-bold ${item.kuota > 0 ? 'bg-[#004d38] text-white hover:bg-[#003829]' : 'pointer-events-none bg-slate-200 text-slate-400'}`}>{item.kuota > 0 ? 'Ajukan PKL' : 'Kuota Penuh'}</Link>
                        </div>
                    ))}
                </div>
                {perusahaanList.length === 0 && <p className="py-8 text-center text-sm italic text-slate-400">Belum ada perusahaan mitra aktif.</p>}
            </section>
        </SiswaLayout>
    );
}

function Stat({ title, value, subtitle, icon: Icon, dark }) {
    return <div className={`${dark ? 'bg-[#004d38] text-white' : 'border border-slate-100 bg-white text-slate-800'} flex min-h-[145px] items-center justify-between rounded-2xl p-5 shadow-sm`}><div><p className={`text-xs font-medium ${dark ? 'text-emerald-100' : 'text-slate-400'}`}>{title}</p><h3 className="mt-1 break-words text-xl font-extrabold">{value}</h3>{subtitle && <p className={`mt-1 text-xs font-semibold ${dark ? 'text-emerald-200' : 'text-emerald-600'}`}>{subtitle}</p>}</div><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${dark ? 'bg-white/10' : 'bg-emerald-50 text-emerald-600'}`}><Icon className="h-5 w-5" /></div></div>;
}

function Step({ active, number, title, text }) {
    return <div className={`flex items-center gap-3 rounded-xl border p-4 ${active ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-slate-50'}`}><div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${active ? 'bg-[#004d38] text-white' : 'bg-slate-300 text-slate-600'}`}>{active ? <CheckCircle2 className="h-4 w-4" /> : number}</div><div><p className="text-xs font-bold text-slate-900">{title}</p><p className="text-[11px] text-slate-400">{text}</p></div></div>;
}
