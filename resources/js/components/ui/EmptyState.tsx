import { Inbox } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#EEF1F8] flex items-center justify-center mb-4">
                <Inbox size={28} className="text-gray-400" />
            </div>
            <h3 className="text-[#0D1B3E] font-semibold text-lg">{title}</h3>
            {description && <p className="text-gray-400 text-sm mt-1 max-w-sm">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
