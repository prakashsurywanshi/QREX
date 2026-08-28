import type { LucideIcon } from 'lucide-react';

type StatColor = 'navy' | 'gold' | 'emerald' | 'blue' | 'red' | 'purple';

const colorMap: Record<StatColor, string> = {
    navy: 'bg-[#0D1B3E] text-gold-300',
    gold: 'bg-gold-500 text-white',
    emerald: 'bg-emerald-500 text-white',
    blue: 'bg-blue-500 text-white',
    red: 'bg-red-500 text-white',
    purple: 'bg-purple-500 text-white',
};

interface StatCardProps {
    label: string;
    value: string;
    sub?: string;
    icon: LucideIcon;
    color: StatColor;
    trend?: string;
    up?: boolean;
}

export default function StatCard({ label, value, sub, icon: Icon, color, trend, up }: StatCardProps) {
    return (
        <div className="kpi-card">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
                    <Icon size={18} />
                </div>
                {trend && (
                    <span className={`text-xs font-semibold ${up ? 'text-emerald-600' : 'text-red-500'}`}>
                        {up ? '↑' : '↓'} {trend}
                    </span>
                )}
            </div>
            <div className="text-xl font-bold text-[#0D1B3E]">{value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
            {sub && <div className="text-[11px] text-gray-400 mt-1">{sub}</div>}
        </div>
    );
}
