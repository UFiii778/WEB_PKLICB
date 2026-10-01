// Satu sumber kebenaran untuk label & warna status pengajuan.
export const STATUS = {
    pending:          { label: 'PENDING',          badge: 'bg-amber-100 text-amber-800',     dot: '#f59e0b' },
    disetujui_hubin:  { label: 'DISETUJUI HUBIN',  badge: 'bg-blue-100 text-blue-800',       dot: '#3b82f6' },
    diterima_mitra:   { label: 'DITERIMA MITRA',   badge: 'bg-emerald-100 text-emerald-900', dot: '#10b981' },
    ditolak_hubin:    { label: 'DITOLAK HUBIN',    badge: 'bg-rose-100 text-rose-800',       dot: '#f43f5e' },
    ditolak_mitra:    { label: 'DITOLAK MITRA',    badge: 'bg-rose-100 text-rose-800',       dot: '#f43f5e' },
    belum_mengajukan: { label: 'BELUM MENGAJUKAN', badge: 'bg-slate-100 text-slate-500',     dot: '#94a3b8' },
};

export const statusInfo = (s) => STATUS[s] ?? { label: String(s).toUpperCase(), badge: 'bg-slate-100 text-slate-600', dot: '#94a3b8' };

export const isDitolak = (s) => s === 'ditolak_hubin' || s === 'ditolak_mitra';
export const isDisetujui = (s) => s === 'disetujui_hubin' || s === 'diterima_mitra';
