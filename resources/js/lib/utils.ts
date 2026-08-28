import type { CanObject, ModulePermission } from '@/types';

export function inrLabel(amount: number): string {
    const crore = 10000000;
    const lakh = 100000;
    if (amount >= crore) {
        const v = amount / crore;
        return `₹${v.toFixed(2).replace(/\.?0+$/, '')} Cr`;
    }
    if (amount >= lakh) {
        const v = amount / lakh;
        return `₹${v.toFixed(0)} L`;
    }
    if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
}

export function formatINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(date?: string | null): string {
    if (!date) return '—';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return date;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function initials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

export function truncate(text: string, length = 60): string {
    return text.length > length ? `${text.slice(0, length)}…` : text;
}

export function canModule(can: CanObject | undefined, module: string): boolean {
    return Boolean(can?.[module]?.view);
}

export function canAction(can: CanObject | undefined, module: string, action: string): boolean {
    return Boolean(can?.[module]?.[action as keyof ModulePermission]);
}

export function canField(can: CanObject | undefined, module: string, field: string): boolean {
    if (!can?.[module]) return false;
    return Boolean(can[module]?.fields?.[field]);
}
