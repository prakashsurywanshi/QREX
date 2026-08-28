import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'gold' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

const variants: Record<string, string> = {
    primary: 'bg-[#0D1B3E] text-white hover:bg-[#1A2B50]',
    gold: 'bg-gold-500 text-white hover:bg-gold-600',
    outline: 'border border-[#E1E8F0] text-[#0D1B3E] hover:bg-[#F8FAFD]',
    ghost: 'text-gray-500 hover:text-gray-800 hover:bg-[#F8FAFD]',
    danger: 'bg-red-500 text-white hover:bg-red-600',
};

const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
