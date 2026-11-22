import type { CanObject, ModulePermission } from '@/types';

export const PLACEHOLDER_IMAGE =
    'data:image/svg+xml,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><rect width="640" height="480" fill="#E8EDF5"/><g fill="none" stroke="#C3CFE0" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"><path d="M200 200h240v240H200z"/><path d="M200 280h240M200 340h240M200 400h240"/><path d="M155 220 320 100l165 120"/><path d="M270 440V360h100v80"/></g></svg>'
    );

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

const WORD_ONES = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
];
const WORD_TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function wordsTwoDigits(n: number): string {
    if (n < 20) return WORD_ONES[n];
    const t = Math.floor(n / 10);
    const o = n % 10;
    return o === 0 ? WORD_TENS[t] : `${WORD_TENS[t]}-${WORD_ONES[o]}`;
}

function wordsThreeDigits(n: number): string {
    const h = Math.floor(n / 100);
    const r = n % 100;
    let s = '';
    if (h > 0) s += `${WORD_ONES[h]} Hundred`;
    if (r > 0) s += `${s ? ' ' : ''}${wordsTwoDigits(r)}`;
    return s;
}

export function amountInWords(value: string | number): string {
    if (value == null || String(value).trim() === '') return '';
    const cleaned = String(value).replace(/[₹,\s]/g, '').trim();
    if (cleaned === '') return '';
    const amount = Math.round(Number(cleaned));
    if (Number.isNaN(amount) || amount < 0) return '';
    if (amount === 0) return 'Zero Rupees Only';

    const kharab = Math.floor(amount / 1e11);
    const arab = Math.floor((amount % 1e11) / 1e9);
    const crore = Math.floor((amount % 1e9) / 1e7);
    const lakh = Math.floor((amount % 1e7) / 1e5);
    const thousand = Math.floor((amount % 1e5) / 1e3);
    const rest = amount % 1000;

    const unit = (n: number, singular: string, plural: string) =>
        n > 0 ? `${wordsThreeDigits(n)} ${n > 1 ? plural : singular}` : '';

    const parts = [
        unit(kharab, 'Kharab', 'Kharabs'),
        unit(arab, 'Arab', 'Arabs'),
        unit(crore, 'Crore', 'Crores'),
        unit(lakh, 'Lakh', 'Lakhs'),
        unit(thousand, 'Thousand', 'Thousands'),
        rest > 0 ? wordsThreeDigits(rest) : '',
    ].filter(Boolean);

    return `${parts.join(' ')} Rupees Only`;
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

export async function sharePropertyLink(title: string, url: string, text?: string): Promise<boolean> {
    const data = { title, url, ...(text ? { text } : {}) };
    if (typeof navigator.share === 'function') {
        try {
            await navigator.share(data);
            return true;
        } catch {
            // Aborted by user — fall through to copy fallback.
        }
    }
    try {
        await navigator.clipboard.writeText(text ? `${text}\n${url}` : url);
        return true;
    } catch {
        return false;
    }
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

export function cn(...inputs: Array<string | false | null | undefined>): string {
    return inputs.filter(Boolean).join(' ');
}
