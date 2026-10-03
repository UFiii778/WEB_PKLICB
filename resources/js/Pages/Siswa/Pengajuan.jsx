import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { Download, CheckCircle2, XCircle, Clock, Users } from 'lucide-react';

const labels = { pending: 'Menunggu Validasi Hubin', disetujui_hubin: 'Disetujui Hubin', diterima_mitra: 'Diterima Perusahaan', ditolak_hubin: 'Ditolak Hubin', ditolak_mitra: 'Ditolak Perusahaan' };
export default function Pengajuan({ pengajuan }) {
    const { flash } = usePage().props;
    return <SiswaLayout>
        {flash?.success && <Notice text={flash.success} />}
        {flash?.error && <Notice text={flash.error} error />}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><h2 className="text-2xl font-extrabold">Status Pengajuan</h2><p className="mt-1 text-sm text-slate-400">Detail pengajuan PKL yang sedang kamu ikuti.</p></div>
        {!pengajuan ? <Empty /> : <div className="space-y-5"><div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold text-slate-400">KODE PENGAJUAN</p><h3 className="mt-1 text-2xl font-black text-[#004d38]">{pengajuan.kode}</h3></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${pengajuan.ditolak ? 'bg-red-100 text-red-700' : pengajuan.status === 'diterima_mitra' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{labels[pengajuan.status] || pengajuan.status}</span></div><div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3"><Info label="Perusahaan" value={pengajuan.perusahaan || '-'} /><Info label="Tanggal PKL" value={`${pengajuan.tgl_mulai || '-'} s/d ${pengajuan.tgl_selesai || '-'}`} /><Info label="Tanggal Pengajuan" value={pengajuan.tgl_pengajuan || '-'} /></div></div>
        {pengajuan.ditolak && <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700"><XCircle className="h-5 w-5 shrink-0" /><div><b>Pengajuan ditolak</b><p className="mt-1 text-sm">{pengajuan.alasan || 'Tidak ada alasan yang diberikan.'}</p></div></div>}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><h3 className="font-extrabold">Anggota Kelompok</h3><div className="mt-4 space-y-2"><Person name={pengajuan.ketua?.nama} kelas={pengajuan.ketua?.kelas} ketua />{pengajuan.anggota?.map((s) => <Person key={s.id} name={s.nama} kelas={s.kelas} />)}</div></div>
        {['disetujui_hubin', 'diterima_mitra'].includes(pengajuan.status) && <a target="_blank" rel="noreferrer" href={`/siswa/pengajuan/${pengajuan.id}/cetak-surat`} className="inline-flex items-center gap-2 rounded-xl bg-[#004d38] px-5 py-3 text-xs font-bold text-white"><Download className="h-4 w-4" />Cetak Surat Pengantar PDF</a>}
        </div>}
    </SiswaLayout>;
}
function Info({ label, value }) { return <div className="rounded-xl bg-slate-50 p-4"><p className="text-[11px] font-bold text-slate-400">{label}</p><p className="mt-1 text-sm font-bold text-slate-800">{value}</p></div>; }
function Person({ name, kelas, ketua }) { return <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-[#004d38]"><Users className="h-4 w-4" /></div><div><p className="text-sm font-bold">{name || '-'}</p><p className="text-xs text-slate-400">{ketua ? 'Ketua kelompok · ' : ''}{kelas || '-'}</p></div></div>; }
function Empty() { return <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm"><Clock className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 font-bold">Belum ada pengajuan PKL</p><Link href="/siswa/mitra" className="mt-4 inline-block rounded-xl bg-[#004d38] px-4 py-2.5 text-xs font-bold text-white">Cari Mitra</Link></div>; }
function Notice({ text, error }) { return <div className={`rounded-2xl border p-4 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{text}</div>; }
