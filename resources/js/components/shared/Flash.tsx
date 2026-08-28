import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { usePage } from '@/hooks/usePage';

export default function Flash() {
    const { flash } = usePage();
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setToast({
                type: flash.success ? 'success' : 'error',
                message: flash.success || flash.error || '',
            });
            const t = setTimeout(() => setToast(null), 3500);
            return () => clearTimeout(t);
        }
    }, [flash]);

    if (!toast) return null;

    const isSuccess = toast.type === 'success';

    return (
        <div className={`fixed bottom-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-white text-sm font-medium animate-slide-in ${isSuccess ? 'bg-emerald-600 border-emerald-500' : 'bg-red-600 border-red-500'}`}>
            {isSuccess ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-1 text-white/70 hover:text-white transition-colors">
                <X size={15} />
            </button>
        </div>
    );
}

export function useLogout() {
    return () => router.post('/logout');
}
