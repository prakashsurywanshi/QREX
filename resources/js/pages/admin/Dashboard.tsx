import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import {
    Building2, Users, TrendingUp, MapPin, CalendarCheck, IndianRupee,
    CreditCard, Plus, ArrowRight, Phone, ShoppingCart, Clock, Activity,
    Star, StarOff,
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie,
    Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { usePage } from '@/hooks/usePage';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    stats: {
        totalProperties: number;
        availableProperties: number;
        soldProperties: number;
        activeLeads: number;
        newLeads: number;
        siteVisits: number;
        activeDeals: number;
        revenue: number;
        pendingPayments: number;
        received: number;
    };
    recentLeads: { id: number; lead_id: string; name: string; phone: string; source: string; status: string; score: number; created_at: string }[];
    upcomingVisits: { id: number; visit_id: string; customer_name: string; property_name: string; agent_name: string; visit_date: string; visit_time: string; status: string }[];
    recentBookings: { id: number; booking_id: string; customer_name: string; property_name: string; agent_name: string; booking_date: string; booking_amount_label: string; status: string }[];
    recentPayments: { id: number; customer_name: string; property_name: string; amount_label: string; status: string; due_date: string }[];
    topAgents: { name: string; initials: string; role: string; deals: number; revenue: number }[];
    followUpsDue: { id: number; title: string; type: string; status: string; priority: string; due_date: string; assignee: string }[];
    recentActivity: { id: number; type: string; title: string; description: string; user: string; created_at: string }[];
    featuredProperties: any[];
    chartData: {
        revenueByMonth: { month: string; revenue: number; leads: number }[];
        leadSources: { name: string; value: number }[];
        pipelineFunnel: { stage: string; count: number }[];
        agentPerformance: { name: string; revenue: number }[];
        monthlyBookings: { month: string; bookings: number }[];
    };
    range: string;
    ranges: Record<string, string>;
}

function fmtCr(n: number) {
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
    return '₹' + (n / 100000).toFixed(1) + ' L';
}

const PIE_COLORS = ['#0D1B3E', '#C9963A', '#34D399', '#3B82F6', '#A855F7', '#F59E0B', '#EF4444', '#14B8A6'];

export default function Dashboard(props: Props) {
    const { stats, recentLeads, upcomingVisits, recentBookings, recentPayments, topAgents, followUpsDue, recentActivity, featuredProperties, chartData, range, ranges } = props;
    const { auth, site } = usePage();
    const user = auth.user;

    const firstName = user?.name?.split(' ')[0] || 'there';

    const setRange = (r: string) => {
        router.get('/admin/dashboard', r === 'month' ? {} : { range: r }, { preserveState: true, only: ['stats', 'recentLeads', 'upcomingVisits', 'recentBookings', 'recentPayments', 'recentActivity', 'featuredProperties', 'chartData', 'range'] });
    };

    const leadStatusBadge = (s: string) => {
        const map: Record<string, string> = {
            New: 'bg-blue-100 text-blue-700',
            Contacted: 'bg-purple-100 text-purple-700',
            Qualified: 'bg-gold-100 text-gold-700',
            Converted: 'bg-emerald-100 text-emerald-700',
            Lost: 'bg-red-100 text-red-600',
        };
        return map[s] || 'bg-gray-100 text-gray-600';
    };

    const paymentBadge = (s: string) => {
        const map: Record<string, string> = {
            Paid: 'bg-emerald-100 text-emerald-700',
            Pending: 'bg-amber-100 text-amber-700',
            Overdue: 'bg-red-100 text-red-600',
            'Partially Paid': 'bg-blue-100 text-blue-700',
        };
        return map[s] || 'bg-gray-100 text-gray-600';
    };

    return (
        <AdminLayout>
            <PageHeader
                title={`Welcome back, ${firstName}!`}
                subtitle={site?.tagline || "Here's what's happening across your real estate business today."}
                actions={
                    <Link href="/admin/properties/create" className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50] transition-colors">
                        <Plus size={16} /> Add Property
                    </Link>
                }
            />

            {/* Date range filter */}
            <div className="flex items-center gap-2 mb-6">
                {Object.entries(ranges).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setRange(key)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${range === key ? 'bg-[#0D1B3E] text-white' : 'bg-white border border-[#E1E8F0] text-gray-500 hover:bg-[#F7F9FC]'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                <StatCard icon={Building2} label="Total Properties" value={String(stats.totalProperties)} sub={`${stats.availableProperties} available`} color="navy" />
                <StatCard icon={Users} label="Active Leads" value={String(stats.activeLeads)} sub={`${stats.newLeads} new`} color="gold" />
                <StatCard icon={TrendingUp} label="Active Deals" value={String(stats.activeDeals)} sub="in pipeline" color="emerald" />
                <StatCard icon={MapPin} label="Site Visits" value={String(stats.siteVisits)} sub="current" color="blue" />
                <StatCard icon={IndianRupee} label="Revenue Won" value={fmtCr(stats.revenue)} sub="closed deals" color="gold" />
                <StatCard icon={CreditCard} label="Pending Payments" value={fmtCr(stats.pendingPayments)} sub="to collect" color="red" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-[#E1E8F0] p-5 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-[#0D1B3E]">Revenue & Leads by Month</h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData.revenueByMonth} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#C9963A" stopOpacity={0.5} />
                                        <stop offset="100%" stopColor="#C9963A" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={40} />
                                <Tooltip />
                                <Area type="monotone" dataKey="revenue" name="Revenue (Cr)" stroke="#C9963A" fill="url(#rev)" strokeWidth={2} />
                                <Area type="monotone" dataKey="leads" name="Leads" stroke="#0D1B3E" strokeWidth={2} fill="transparent" />
                                <Legend />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                    <h3 className="font-semibold text-[#0D1B3E] mb-4">Lead Sources</h3>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData.leadSources} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                                    {chartData.leadSources.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                    <h3 className="font-semibold text-[#0D1B3E] mb-4">Monthly Bookings</h3>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData.monthlyBookings} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="bookings" name="Bookings" fill="#0D1B3E" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                    <h3 className="font-semibold text-[#0D1B3E] mb-4">Pipeline Funnel</h3>
                    <div className="h-56 overflow-y-auto">
                        <div className="space-y-1.5">
                            {chartData.pipelineFunnel.map((s) => {
                                const max = Math.max(...chartData.pipelineFunnel.map((p) => p.count), 1);
                                const pct = Math.round((s.count / max) * 100);
                                return (
                                    <div key={s.stage} className="flex items-center gap-2">
                                        <div className="w-36 text-[11px] text-gray-500 truncate text-right">{s.stage}</div>
                                        <div className="flex-1 h-6 bg-[#F4F7FC] rounded overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-[#0D1B3E] to-gold-500 transition-all" style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="w-6 text-[11px] font-semibold text-[#0D1B3E]">{s.count}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                    <h3 className="font-semibold text-[#0D1B3E] mb-4">Agent Performance (Cr)</h3>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData.agentPerformance} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={70} />
                                <Tooltip />
                                <Bar dataKey="revenue" name="Revenue (Cr)" fill="#C9963A" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Leads */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-[#E1E8F0]">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F4F8]">
                        <h3 className="font-semibold text-[#0D1B3E]">Recent Leads</h3>
                        <Link href="/admin/leads" className="flex items-center gap-1 text-gold-600 text-xs font-semibold hover:text-gold-700">
                            View All <ArrowRight size={13} />
                        </Link>
                    </div>
                    <div className="divide-y divide-[#F0F4F8]">
                        {recentLeads.map((lead, i) => (
                            <Link key={lead.id} href={`/admin/leads/${lead.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#FAFBFD] transition-colors">
                                <div className="w-9 h-9 rounded-full bg-[#0D1B3E]/5 text-[#0D1B3E] flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {lead.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-[#0D1B3E] text-sm truncate">{lead.name}</div>
                                    <div className="text-gray-400 text-xs">{lead.source} · <span className="flex items-center gap-1 inline-flex"><Phone size={10} /> {lead.phone}</span></div>
                                </div>
                                <div className="hidden sm:flex flex-col items-end gap-1">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${leadStatusBadge(lead.status)}`}>{lead.status}</span>
                                    <span className="text-gray-400 text-[10px]">{formatDate(lead.created_at)}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Follow-ups Due */}
                <div className="bg-white rounded-xl border border-[#E1E8F0]">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F4F8]">
                        <h3 className="font-semibold text-[#0D1B3E]">Follow-ups Due</h3>
                        <Link href="/admin/tasks" className="flex items-center gap-1 text-gold-600 text-xs font-semibold hover:text-gold-700">
                            Tasks <ArrowRight size={13} />
                        </Link>
                    </div>
                    <div className="divide-y divide-[#F0F4F8]">
                        {followUpsDue.map((t) => (
                            <div key={t.id} className="px-5 py-3">
                                <div className="flex items-center gap-2">
                                    <Clock size={13} className={`flex-shrink-0 ${t.priority === 'Urgent' ? 'text-red-500' : t.priority === 'High' ? 'text-amber-500' : 'text-gold-600'}`} />
                                    <span className="font-medium text-[#0D1B3E] text-sm truncate">{t.title}</span>
                                </div>
                                <div className="text-gray-400 text-xs mt-1 ml-5">{t.assignee || 'Unassigned'} · {t.due_date || 'No due date'} · <span className="text-gold-600 font-medium">{t.type}</span></div>
                            </div>
                        ))}
                        {followUpsDue.length === 0 && <div className="px-5 py-8 text-center text-gray-400 text-sm">No follow-ups due</div>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Upcoming Site Visits */}
                <div className="bg-white rounded-xl border border-[#E1E8F0]">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F4F8]">
                        <h3 className="font-semibold text-[#0D1B3E]">Upcoming Site Visits</h3>
                        <Link href="/admin/site-visits" className="flex items-center gap-1 text-gold-600 text-xs font-semibold hover:text-gold-700">
                            View All <ArrowRight size={13} />
                        </Link>
                    </div>
                    <div className="divide-y divide-[#F0F4F8]">
                        {upcomingVisits.map((v) => (
                            <div key={v.id} className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#0D1B3E]/5 flex items-center justify-center flex-shrink-0">
                                        <CalendarCheck size={18} className="text-[#0D1B3E]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-[#0D1B3E] text-sm truncate">{v.customer_name}</div>
                                        <div className="text-gray-400 text-xs truncate">{v.property_name}</div>
                                    </div>
                                    <span className="text-gold-600 text-xs font-semibold whitespace-nowrap">{fmtDate(v.visit_date)}</span>
                                </div>
                                <div className="flex items-center gap-3 ml-13 mt-1.5 text-gray-400 text-[11px]">
                                    <span className="flex items-center gap-1"><Clock size={11} /> {v.visit_time}</span>
                                    <span>· {v.agent_name}</span>
                                </div>
                            </div>
                        ))}
                        {upcomingVisits.length === 0 && <div className="px-5 py-8 text-center text-gray-400 text-sm">No upcoming visits</div>}
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-xl border border-[#E1E8F0]">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F4F8]">
                        <h3 className="font-semibold text-[#0D1B3E]">Recent Bookings</h3>
                        <Link href="/admin/bookings" className="flex items-center gap-1 text-gold-600 text-xs font-semibold hover:text-gold-700">
                            View All <ArrowRight size={13} />
                        </Link>
                    </div>
                    <div className="divide-y divide-[#F0F4F8]">
                        {recentBookings.map((b) => (
                            <Link href={`/admin/bookings/${b.id}`} key={b.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#FAFBFD] transition-colors">
                                <div className="w-9 h-9 rounded-lg bg-gold-500/15 flex items-center justify-center flex-shrink-0">
                                    <ShoppingCart size={16} className="text-gold-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-[#0D1B3E] text-sm truncate">{b.customer_name}</div>
                                    <div className="text-gray-400 text-xs truncate">{b.property_name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[#0D1B3E] font-semibold text-xs">{b.booking_amount_label}</div>
                                    <div className="text-gray-400 text-[10px]">{b.booking_date}</div>
                                </div>
                            </Link>
                        ))}
                        {recentBookings.length === 0 && <div className="px-5 py-8 text-center text-gray-400 text-sm">No bookings yet</div>}
                    </div>
                </div>

                {/* Recent Payments */}
                <div className="bg-white rounded-xl border border-[#E1E8F0]">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F4F8]">
                        <h3 className="font-semibold text-[#0D1B3E]">Recent Payments</h3>
                        <Link href="/admin/payments" className="flex items-center gap-1 text-gold-600 text-xs font-semibold hover:text-gold-700">
                            View All <ArrowRight size={13} />
                        </Link>
                    </div>
                    <div className="divide-y divide-[#F0F4F8]">
                        {recentPayments.map((p) => (
                            <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                    <IndianRupee size={16} className="text-emerald-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-[#0D1B3E] text-sm truncate">{p.customer_name}</div>
                                    <div className="text-gray-400 text-xs truncate">{p.property_name}</div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${paymentBadge(p.status)}`}>{p.status}</span>
                            </div>
                        ))}
                        {recentPayments.length === 0 && <div className="px-5 py-8 text-center text-gray-400 text-sm">No payments yet</div>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-[#E1E8F0]">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F4F8]">
                        <h3 className="font-semibold text-[#0D1B3E] flex items-center gap-2"><Activity size={16} className="text-gold-600" /> Recent Activity</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {recentActivity.map((a) => (
                            <div key={a.id} className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-[#0D1B3E] font-medium">{a.title}</div>
                                    {a.description && <div className="text-xs text-gray-400">{a.description}</div>}
                                    <div className="text-[11px] text-gray-400 mt-0.5">{a.user} · {a.created_at}</div>
                                </div>
                            </div>
                        ))}
                        {recentActivity.length === 0 && <div className="text-center text-gray-400 text-sm py-6">No recent activity</div>}
                    </div>
                </div>

                {/* Featured Properties */}
                <div className="bg-white rounded-xl border border-[#E1E8F0]">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F4F8]">
                        <h3 className="font-semibold text-[#0D1B3E] flex items-center gap-2"><Star size={16} className="text-gold-500" /> Featured Properties</h3>
                        <Link href="/admin/properties" className="flex items-center gap-1 text-gold-600 text-xs font-semibold hover:text-gold-700">
                            View All <ArrowRight size={13} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                        {featuredProperties.map((p) => (
                            <Link href={`/admin/properties/${p.id}`} key={p.id} className="group rounded-lg overflow-hidden border border-[#E1E8F0] hover:shadow-md transition-shadow">
                                <div className="h-28 bg-gradient-to-br from-[#0D1B3E] to-gold-500 relative flex items-center justify-center">
                                    {p.image ? (
                                        <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 size={28} className="text-white/70" />
                                    )}
                                    {p.featured && <span className="absolute top-2 right-2 bg-gold-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"><Star size={9} /> Featured</span>}
                                </div>
                                <div className="p-3">
                                    <div className="text-sm font-semibold text-[#0D1B3E] truncate">{p.title}</div>
                                    <div className="text-xs text-gray-400 truncate">{p.location}</div>
                                    <div className="text-gold-600 text-sm font-bold mt-1">{p.price_label}</div>
                                </div>
                            </Link>
                        ))}
                        {featuredProperties.length === 0 && (
                            <div className="col-span-2 text-center text-gray-400 text-sm py-6 flex flex-col items-center gap-2">
                                <StarOff size={22} className="text-gray-300" /> No featured properties
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function formatDate(d: string) {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function fmtDate(d: string) {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
