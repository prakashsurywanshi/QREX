import { Phone, MessageSquare, Mail, StickyNote, MapPin, RefreshCw, CheckSquare, FileText, Star } from 'lucide-react';
import type { Activity } from '@/types';

interface ActivityTimelineProps {
    activities: Activity[];
}

const activityStyle: Record<string, { icon: typeof Phone; color: string; bg: string }> = {
    Call: { icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50' },
    WhatsApp: { icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50' },
    Email: { icon: Mail, color: 'text-amber-600', bg: 'bg-amber-50' },
    Note: { icon: StickyNote, color: 'text-gray-600', bg: 'bg-gray-50' },
    'Site Visit': { icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-50' },
    'Status Change': { icon: RefreshCw, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    Task: { icon: CheckSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    Document: { icon: FileText, color: 'text-red-600', bg: 'bg-red-50' },
    Recommendation: { icon: Star, color: 'text-gold-600', bg: 'bg-gold-50' },
};

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
    return (
        <div className="relative space-y-0">
            {activities.map((act, idx) => {
                const style = activityStyle[act.type] || activityStyle.Note;
                const Icon = style.icon;
                return (
                    <div key={act.id} className="relative flex gap-4 pb-6 last:pb-0">
                        {idx < activities.length - 1 && (
                            <div className="absolute left-[15px] top-9 bottom-0 w-px bg-[#E1E8F0]" />
                        )}
                        <div className={`w-8 h-8 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0 relative z-10`}>
                            <Icon size={15} className={style.color} />
                        </div>
                        <div className="flex-1 pt-0.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-[#0D1B3E]">{act.type}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${style.bg} ${style.color} font-medium`}>{act.user_name}</span>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {act.created_at}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{act.title}</p>
                            {act.description && (
                                <p className="text-[13px] text-gray-500 mt-0.5 leading-relaxed">{act.description}</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
