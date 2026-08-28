import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-3xl',
};

export default function Modal({ open, onClose, title, subtitle, children, size = 'md' }: ModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className={`relative bg-white rounded-2xl shadow-xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}>
                <div className="flex items-start justify-between px-6 py-4 border-b border-[#E1E8F0]">
                    <div>
                        <h3 className="text-lg font-bold text-[#0D1B3E]">{title}</h3>
                        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
                    </div>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-[#F8FAFD]">
                        <X size={18} />
                    </button>
                </div>
                <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
            </div>
        </div>
    );
}
