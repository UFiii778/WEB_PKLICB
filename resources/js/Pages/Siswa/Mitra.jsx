import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { MapPin, Phone, Users, Send, X } from 'lucide-react';

export default function Mitra({ perusahaanList = [], pengajuan, daftarSiswa = [] }) {
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState({ perusahaan_id: '', tgl_mulai_pkl: '', tgl_selesai_pkl: '', anggota_id: [] });
    const { flash } = usePage().props;

    const open = (company) => {
        if (!company.kuota) return;
        setSelected(company);
        setForm({ perusahaan_id: company.id, tgl_mulai_pkl: '', tgl_selesai_pkl: '', anggota_id: [] });
    };
    const submit = (e) => {
        e.preventDefault();
        router.post('/siswa/pengajuan', form, { preserveScroll: true, onSuccess: () => setSelected(null) });
    };

    return <SiswaLayout>
        {flash?.success && <Notice type="success" text={flash.success} />}
        {flash?.error && <Notice type="error" text={flash.error} />}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><h2 className="text-2xl font-extrabold text-slate-900">Katalog Mitra</h2><p className="mt-1 text-sm text-slate-400">Pilih perusahaan, tentukan periode PKL, lalu tambahkan anggota kelompok jika diperlukan.</p></div>
        {pengajuan && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Kamu sudah memiliki pengajuan <b>{pengajuan.kode}</b>. Selesaikan pengajuan tersebut sebelum membuat pengajuan baru.</div>}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {perusahaanList.map((item) => <div key={item.id} className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="space-y-3"><div className="flex items-start justify-between gap-3"><h3 className="text-lg font-extrabold text-slate-900">{item.nama}</h3><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${item.kuota > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>Kuota {item.kuota}</span></div><p className="flex gap-2 text-sm text-slate-500"><MapPin className="h-4 w-4 shrink-0" />{item.alamat}</p><p className="flex gap-2 text-sm text-slate-500"><Phone className="h-4 w-4 shrink-0" />{item.kontak}</p></div><button disabled={!!pengajuan || item.kuota <= 0} onClick={() => open(item)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#004d38] py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"><Send className="h-4 w-4" />{item.kuota > 0 ? 'Ajukan PKL' : 'Kuota Penuh'}</button></div>)}
        </div>
        {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><h3 className="text-xl font-extrabold">Ajukan ke {selected.nama}</h3><p className="text-xs text-slate-400">Isi periode PKL dan anggota kelompok.</p></div><button onClick={() => setSelected(null)} className="rounded-full p-2 hover:bg-slate-100"><X /></button></div><form onSubmit={submit} className="mt-6 space-y-5"><input type="hidden" name="perusahaan_id" value={form.perusahaan_id} /><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Field label="Tanggal mulai" type="date" value={form.tgl_mulai_pkl} onChange={(e) => setForm({ ...form, tgl_mulai_pkl: e.target.value })} required /><Field label="Tanggal selesai" type="date" value={form.tgl_selesai_pkl} onChange={(e) => setForm({ ...form, tgl_selesai_pkl: e.target.value })} required /></div><div><label className="mb-2 block text-xs font-bold text-slate-600"><Users className="mr-1 inline h-4 w-4" />Anggota kelompok (maks. 2)</label><div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{daftarSiswa.map((s) => <label key={s.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50"><input type="checkbox" checked={form.anggota_id.includes(s.id)} onChange={(e) => setForm({ ...form, anggota_id: e.target.checked ? [...form.anggota_id, s.id].slice(-2) : form.anggota_id.filter((id) => id !== s.id) })} /><span><b className="text-sm">{s.name}</b><small className="block text-xs text-slate-400">{s.kelas}</small></span></label>)}</div></div><div className="flex justify-end gap-2"><button type="button" onClick={() => setSelected(null)} className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500">Batal</button><button type="submit" className="rounded-xl bg-[#004d38] px-5 py-2.5 text-xs font-bold text-white">Kirim Pengajuan</button></div></form></div></div>}
    </SiswaLayout>;
}
function Field({ label, ...props }) { return <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span><input {...props} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" /></label>; }
function Notice({ type, text }) { return <div className={`rounded-2xl border p-4 text-sm ${type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>{text}</div>; }
