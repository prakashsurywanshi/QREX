import type { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { Home, ChevronRight } from 'lucide-react';

interface Crumb {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    breadcrumbs?: Crumb[];
}

export default function PageHeader({ title, subtitle, actions, breadcrumbs }: PageHeaderProps) {
    return (
        <div className="mb-6">
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                    <Link href="/admin/dashboard" className="hover:text-[#0D1B3E] transition-colors flex items-center gap-1">
                        <Home size={12} /> Home
                    </Link>
                    {breadcrumbs.map((c, i) => {
                        const isLast = i === breadcrumbs.length - 1;
                        return (
                            <span key={i} className="flex items-center gap-1.5">
                                <ChevronRight size={12} />
                                {c.href && !isLast ? (
                                    <Link href={c.href} className="hover:text-[#0D1B3E] transition-colors">{c.label}</Link>
                                ) : (
                                    <span className={isLast ? 'text-[#0D1B3E] font-medium' : ''}>{c.label}</span>
                                )}
                            </span>
                        );
                    })}
                </nav>
            )}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#0D1B3E]">{title}</h1>
                    {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
        </div>
    );
}
