export default function Card({ className = '', children, ...rest }) {
    return (
        <div className={`rounded-[28px] bg-white shadow-card ${className}`} {...rest}>
            {children}
        </div>
    );
}

export function PageTitle({ title, subtitle, children }) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h2>
                {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
            </div>
            {children}
        </div>
    );
}

export function EmptyState({ icon: Icon, title, text }) {
    return (
        <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            {Icon && (
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-400">
                    <Icon className="h-6 w-6" />
                </div>
            )}
            <p className="font-bold text-slate-600">{title}</p>
            {text && <p className="max-w-sm text-sm text-slate-400">{text}</p>}
        </div>
    );
}
