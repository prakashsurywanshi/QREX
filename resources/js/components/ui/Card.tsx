import type { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`bg-white rounded-xl border border-[#E1E8F0] ${className}`}>
            {children}
        </div>
    );
}
