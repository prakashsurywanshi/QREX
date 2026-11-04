import { useState, useEffect, type ReactNode } from 'react';
import { Link, router } from '@inertiajs/react';
import {
    LayoutDashboard, Building2, Users, UserCheck, TrendingUp, MapPin,
    CalendarCheck, CreditCard, DollarSign, FolderOpen, Megaphone, BarChart3, Globe,
    UserCog, Settings, Bell, Search, Plus, Menu, X, LogOut, ChevronRight,
    ChevronLeft, Home, CheckSquare, CheckCheck, Shield, ListChecks,
} from 'lucide-react';
import { usePage } from '@/hooks/usePage';
import Flash, { useLogout } from '@/components/shared/Flash';

interface NavItem {
    icon: typeof LayoutDashboard;
    href: string;
    label: string;
    module?: string;
}

const navGroups: { title: string; items: NavItem[] }[] = [
    {
        title: 'Overview',
        items: [
            { icon: LayoutDashboard, href: '/admin/dashboard', label: 'Dashboard', module: 'dashboard' },
        ],
    },
    {
        title: 'Sales',
        items: [
            { icon: Building2, href: '/admin/properties', label: 'Properties', module: 'properties' },
            { icon: Users, href: '/admin/leads', label: 'Leads', module: 'leads' },
            { icon: UserCheck, href: '/admin/customers', label: 'Customers', module: 'customers' },
            { icon: TrendingUp, href: '/admin/pipeline', label: 'Sales Pipeline', module: 'sales' },
            { icon: MapPin, href: '/admin/site-visits', label: 'Site Visits', module: 'site_visits' },
            { icon: CheckSquare, href: '/admin/tasks', label: 'Tasks & Follow-ups', module: 'tasks' },
            { icon: CalendarCheck, href: '/admin/bookings', label: 'Bookings', module: 'bookings' },
            { icon: CreditCard, href: '/admin/payments', label: 'Payments', module: 'payments' },
            { icon: Calendar, href: '/admin/payment-plans', label: 'Payment Plans', module: 'payment_plans' },
            { icon: DollarSign, href: '/admin/commissions', label: 'Commissions', module: 'commissions' },
            { icon: Building2, href: '/admin/projects', label: 'Projects & Units', module: 'projects' },
        ],
    },
    {
        title: 'Operations',
        items: [
            { icon: FolderOpen, href: '/admin/media', label: 'Media Center', module: 'media' },
            { icon: Megaphone, href: '/admin/marketing', label: 'Marketing', module: 'marketing' },
            { icon: BarChart3, href: '/admin/reports', label: 'Reports & Analytics', module: 'reports' },
            { icon: Globe, href: '/admin/cms', label: 'CMS / Website', module: 'cms' },
        ],
    },
    {
        title: 'Administration',
        items: [
            { icon: UserCog, href: '/admin/users', label: 'Users', module: 'users' },
            { icon: Shield, href: '/admin/roles', label: 'Roles & Permissions', module: 'roles' },
            { icon: ListChecks, href: '/admin/amenities', label: 'Amenities', module: 'amenities' },
            { icon: Settings, href: '/admin/settings', label: 'Settings', module: 'settings' },
        ],
    },
];

const quickActions = [
    { label: 'Add Property', href: '/admin/properties/create', icon: Building2 },
    { label: 'Add Lead', href: '/admin/leads', icon: Users },
    { label: 'New Task', href: '/admin/tasks', icon: CheckSquare },
    { label: 'New Booking', href: '/admin/bookings', icon: CalendarCheck },
];

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { auth, can, notifications: notifData, app, site } = usePage();
    const user = auth.user;
    const agencyName = site?.project_name || site?.agency_name || 'QREX';
    const tagline = site?.tagline || 'Realty ERP';
    const logoUrl = app?.logo;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const canAccess = (module: string | undefined) => !module || Boolean(can?.[module]?.view);
    const visibleGroups = navGroups
        .map((g) => ({ ...g, items: g.items.filter((i) => canAccess(i.module)) }))
        .filter((g) => g.items.length > 0);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [quickOpen, setQuickOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dbNotifications, setDbNotifications] = useState<any[]>([]);
    const logout = useLogout();

    useEffect(() => {
        if (notifOpen && dbNotifications.length === 0) {
            fetch('/admin/notifications', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
                .then((r) => r.json())
                .then((data) => setDbNotifications(data.notifications || []))
                .catch(() => {});
        }
    }, [notifOpen]);

    const unreadCount = notifData?.unread || 0;

    const currentUrl = window.location.pathname;

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <Link href="/" className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
                <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {logoUrl ? (
                        <img src={logoUrl} alt={agencyName} className="w-full h-full object-contain" />
                    ) : (
                        <Building2 size={18} className="text-white" />
                    )}
                </div>
                {sidebarOpen && (
                    <div>
                        <div className="text-white font-semibold text-[15px] leading-tight">{agencyName}</div>
                        <div className="text-[11px] text-blue-200/70 uppercase tracking-wider truncate max-w-[160px]">{tagline}</div>
                    </div>
                )}
            </Link>

            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
                {visibleGroups.map((group) => (
                    <div key={group.title}>
                        {sidebarOpen && (
                            <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-blue-200/50">
                                {group.title}
                            </div>
                        )}
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const active = currentUrl === item.href || currentUrl.startsWith(item.href + '/');
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`sidebar-link w-full text-left ${active ? 'active' : ''}`}
                                    >
                                        <Icon size={17} className="flex-shrink-0" />
                                        {sidebarOpen && <span className="truncate">{item.label}</span>}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className="pt-3 mt-3 border-t border-white/10">
                    <Link
                        href="/"
                        onClick={() => setMobileOpen(false)}
                        className="sidebar-link w-full text-left"
                    >
                        <Home size={17} className="flex-shrink-0" />
                        {sidebarOpen && <span className="truncate">View Public Website</span>}
                    </Link>
                </div>
            </nav>

            <div className="p-3 border-t border-white/10">
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 text-xs font-bold flex-shrink-0">
                        {user?.initials || 'U'}
                    </div>
                    {sidebarOpen && (
                        <div className="flex-1 min-w-0">
                            <div className="text-white text-[13px] font-medium truncate">{user?.name || 'User'}</div>
                            <div className="text-blue-200/60 text-[11px] truncate">{user?.role}</div>
                        </div>
                    )}
                    {sidebarOpen && (
                        <button onClick={logout} className="text-blue-200/50 hover:text-red-400 transition-colors" title="Logout">
                            <LogOut size={14} />
                        </button>
                    )}
                </div>
            </div>

            {sidebarOpen && (
                <div className="px-4 pb-4 text-center border-t border-white/10 pt-3">
                    <div className="text-[10px] text-blue-200/50 leading-relaxed">
                        © {new Date().getFullYear()} QODEIGENCE, Inc. All rights reserved.
                    </div>
                    <div className="text-[10px] text-blue-200/40 leading-relaxed">
                        Designed and maintained by QODEIGENCE
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#F4F7FC]">
            <Flash />
            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:flex flex-col flex-shrink-0 bg-[#0D1B3E] transition-all duration-200 sticky top-0 h-screen ${sidebarOpen ? 'w-60' : 'w-16'}`}
            >
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-40">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-60 bg-[#0D1B3E] flex flex-col z-50">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white border-b border-[#E1E8F0] px-4 lg:px-6 h-14 flex items-center gap-3 flex-shrink-0 sticky top-0 z-30">
                    <button
                        className="text-gray-500 hover:text-gray-800 transition-colors hidden lg:block"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
                    </button>
                    <button
                        className="text-gray-500 hover:text-gray-800 transition-colors lg:hidden"
                        onClick={() => setMobileOpen(true)}
                    >
                        <Menu size={20} />
                    </button>

                    <div className="flex-1" />

                    <div className="relative hidden sm:block">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search properties, leads..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-1.5 text-sm bg-[#F4F7FC] border border-[#E1E8F0] rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400"
                        />
                    </div>

                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center text-gray-600 hover:text-[#0D1B3E] border border-[#E1E8F0] rounded-lg w-8 h-8 hover:border-gold-400 hover:bg-[#F8FAFD] transition-colors"
                        title="Open public website"
                    >
                        <Globe size={15} />
                    </a>

                    <div className="relative">
                        <button
                            onClick={() => { setQuickOpen(!quickOpen); setNotifOpen(false); setProfileOpen(false); }}
                            className="flex items-center gap-1.5 bg-[#0D1B3E] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#1A2B50] transition-colors"
                        >
                            <Plus size={14} />
                            <span className="hidden sm:inline">Quick Add</span>
                        </button>
                        {quickOpen && (
                            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#E1E8F0] overflow-hidden z-50 py-1">
                                {quickActions.map((qa, i) => {
                                    const Icon = qa.icon;
                                    return (
                                        <Link key={i} href={qa.href} onClick={() => setQuickOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F8FAFD]">
                                            <Icon size={15} className="text-gold-600" /> {qa.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            className="relative p-2 text-gray-500 hover:text-gray-800 transition-colors"
                            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); setQuickOpen(false); }}
                        >
                            <Bell size={19} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 min-w-2.5 h-2.5 px-0.5 bg-red-500 rounded-full text-[8px] text-white font-bold flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                        {notifOpen && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E1E8F0] overflow-hidden z-50">
                                <div className="px-4 py-3 border-b border-[#E1E8F0] flex items-center justify-between">
                                    <span className="font-semibold text-[#0D1B3E] text-sm">Notifications</span>
                                    <button
                                        onClick={() => router.post('/admin/notifications/read-all')}
                                        className="text-xs text-gold-600 font-medium cursor-pointer flex items-center gap-1"
                                    >
                                        <CheckCheck size={12} /> Mark all read
                                    </button>
                                </div>
                                {dbNotifications.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-gray-400 text-sm">No notifications</div>
                                ) : (
                                    dbNotifications.map((n) => (
                                        <button
                                            key={n.id}
                                            onClick={() => {
                                                if (!n.is_read) {
                                                    router.put(`/admin/notifications/${n.id}/read`);
                                                }
                                                setNotifOpen(false);
                                                if (n.url) {
                                                    router.visit(n.url);
                                                }
                                            }}
                                            className={`w-full text-left px-4 py-3 border-b border-[#F0F4F8] last:border-0 hover:bg-[#F8FAFD] cursor-pointer ${!n.is_read ? 'bg-blue-50/40' : ''}`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm text-[#0D1B3E] font-medium">{n.title}</p>
                                                {!n.is_read && <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">{n.created_at}</p>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            className="w-8 h-8 rounded-full bg-gold-500 text-white text-xs font-bold flex items-center justify-center"
                            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                        >
                            {user?.initials || 'U'}
                        </button>
                        {profileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#E1E8F0] overflow-hidden z-50">
                                <div className="px-4 py-4 border-b border-[#E1E8F0] bg-[#0D1B3E]">
                                    <div className="text-white font-semibold text-sm">{user?.name}</div>
                                    <div className="text-blue-200/70 text-xs">{user?.email}</div>
                                    <div className="text-gold-400 text-xs mt-1 font-medium">{user?.role}</div>
                                </div>
                                <div className="py-1">
                                    <Link href="/profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F8FAFD]">My Profile</Link>
                                    <Link href="/admin/settings" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F8FAFD]">Settings</Link>
                                    <button onClick={logout} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                                        <LogOut size={14} /> Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
