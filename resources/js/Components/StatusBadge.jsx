import { statusInfo } from '../lib/status';

export default function StatusBadge({ status, className = '' }) {
    const s = statusInfo(status);
    return (
        <span
            className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-extrabold tracking-wide ${s.badge} ${className}`}
        >
            {s.label}
        </span>
    );
}
