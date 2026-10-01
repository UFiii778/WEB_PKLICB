import { useEffect } from 'react';
import { X } from 'lucide-react';

const SIZES = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };

export default function Modal({ open, onClose, title, subtitle, size = 'md', footer, children }) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && onClose?.();
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
            role="dialog"
            aria-modal="true"
        >
            <div className={`animate-pop flex max-h-[90vh] w-full flex-col rounded-[28px] bg-white shadow-2xl ${SIZES[size]}`}>
                <div className="flex items-start justify-between gap-4 px-7 pt-6 pb-2">
                    <div>
                        <h3 className="text-lg font-extrabold text-ink">{title}</h3>
                        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Tutup"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="scrollbar-thin overflow-y-auto px-7 py-4">{children}</div>
                {footer && <div className="flex justify-end gap-3 border-t border-slate-100 px-7 py-4">{footer}</div>}
            </div>
        </div>
    );
}
