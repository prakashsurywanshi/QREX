import { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import {
    IndianRupee, TrendingUp, Users, Trophy, Download, FileText,
    ShoppingCart, Layers, Target, CalendarCheck, UserX, BarChart3,
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar, LineChart, Line,
} from 'recharts';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    filters: { range?: string; agent_id?: number | null; property_id?: number | null };
    agents: { id: number; name: string }[];
    properties: { id: number; title: string }[];
    revenueByMonth: { month: string; revenue: number; leads: number }[];
    leadSourceData: { name: string; value: number }[];
    pipelineFunnel: { stage: string; count: number; value: number }[];
    agentPerformance: { name: string; deals: number; revenue: number }[];
    monthlyBookings: { month: string; bookings: number; value: number }[];
    paymentData: { month: string; collected: number; pending: number }[];
    propertyPerformance: { name: string; views: number; leads: number; deals: number }[];
    siteVisitReport: { total: number; completed: number; scheduled: number; cancelled: number; rescheduled: number };
    lostLeadReport: { totalLost: number; converted: number; total: number; bySource: { name: string; value: number }[] };
    campaignPerformance: any[];
    siteVisits: any[];
    reportTables: {
        leads: any[];
        deals: any[];
        payments: any[];
    };
}

const PIE_COLORS = ['#0D1B3E', '#C9963A', '#059669', '#2563EB', '#9333EA', '#DC2626'];

const RANGES = [
    { key: 'today', label: 'Today' },
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
    { key: 'ytd', label: 'YTD' },
    { key: 'all', label: 'All' },
];

const TABS = [
    { key: 'overview', label: 'Overview', icon: BarChart3, exportType: 'revenue' },
    { key: 'sales', label: 'Sales', icon: ShoppingCart, exportType: 'revenue' },
    { key: 'leads', label: 'Leads', icon: Users, exportType: 'leads' },
    { key: 'conversion', label: 'Conversion', icon: Target, exportType: 'revenue' },
    { key: 'agents', label: 'Agent Performance', icon: Trophy, exportType: 'agents' },
    { key: 'properties', label: 'Property Performance', icon: Layers, exportType: 'properties' },
    { key: 'payments', label: 'Payments', icon: IndianRupee, exportType: 'payments' },
    { key: 'campaigns', label: 'Campaigns', icon: TrendingUp, exportType: 'campaigns' },
    { key: 'sitevisits', label: 'Site Visits', icon: CalendarCheck, exportType: 'sitevisits' },
    { key: 'lostleads', label: 'Lost Leads', icon: UserX, exportType: 'leads' },
];

function fmtMoney(n: number) {
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
    if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + ' L';
    return '₹' + Number(n).toLocaleString('en-IN');
}

export default function Reports(props: Props) {
    const {
        filters, agents, properties,
        revenueByMonth, leadSourceData, pipelineFunnel, agentPerformance, monthlyBookings,
        paymentData, propertyPerformance, siteVisitReport, lostLeadReport, campaignPerformance,
        siteVisits, reportTables,
    } = props;

    const [tab, setTab] = useState('overview');
    const range = filters.range || 'all';
    const agentId = filters.agent_id || '';
    const propertyId = filters.property_id || '';

    const totalRevenue = revenueByMonth.reduce((s, r) => s + r.revenue, 0);
    const totalLeads = revenueByMonth.reduce((s, r) => s + r.leads, 0);
    const totalBookings = monthlyBookings.reduce((s, b) => s + b.bookings, 0);
    const wonDeals = pipelineFunnel.filter((p) => p.stage === 'Closed Won').reduce((s, p) => s + p.count, 0);

    const applyFilters = (r: string, a: number | '', p: number | '') => {
        router.get('/admin/reports', {
            range: r,
            agent_id: a || undefined,
            property_id: p || undefined,
        }, { preserveState: true, preserveScroll: true, only: ['filters', 'revenueByMonth', 'leadSourceData', 'pipelineFunnel', 'agentPerformance', 'monthlyBookings', 'paymentData', 'propertyPerformance', 'siteVisitReport', 'lostLeadReport', 'campaignPerformance', 'siteVisits', 'reportTables'] });
    };

    const exportUrl = (pdf: boolean) => {
        const activeTab = TABS.find((t) => t.key === tab)!;
        const params = new URLSearchParams();
        params.set('type', activeTab.exportType);
        params.set('range', range);
        if (agentId) params.set('agent_id', String(agentId));
        if (propertyId) params.set('property_id', String(propertyId));
        return `/admin/reports/${pdf ? 'export-pdf' : 'export'}?${params.toString()}`;
    };

    const setRange = (key: string) => applyFilters(key, agentId as number | '', propertyId as number | '');

    return (
        <AdminLayout>
            <PageHeader
                title="Reports & Analytics"
                subtitle="Business performance overview"
                breadcrumbs={[{ label: 'Reports' }, { label: 'Analytics' }]}
                actions={
                    <div className="flex items-center gap-2">
                        <a href={exportUrl(false)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600 hover:bg-[#F7F9FC]">
                            <Download size={15} /> CSV
                        </a>
                        <a href={exportUrl(true)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600 hover:bg-[#F7F9FC]">
                            <FileText size={15} /> PDF
                        </a>
                    </div>
                }
            />

            {/* Filter bar */}
            <div className="bg-white rounded-xl border border-[#E1E8F0] px-4 py-3 mb-6 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 bg-[#F7F9FC] rounded-lg p-1">
                    {RANGES.map((r) => (
                        <button key={r.key} onClick={() => setRange(r.key)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${range === r.key ? 'bg-[#0D1B3E] text-white' : 'text-gray-500 hover:text-[#0D1B3E]'}`}>
                            {r.label}
                        </button>
                    ))}
                </div>
                <select value={String(agentId)} onChange={(e) => applyFilters(range, Number(e.target.value) || '', propertyId as number | '')}
                    className="px-3 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 bg-white text-gray-600">
                    <option value="">All Agents</option>
                    {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <select value={String(propertyId)} onChange={(e) => applyFilters(range, agentId as number | '', Number(e.target.value) || '')}
                    className="px-3 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 bg-white text-gray-600">
                    <option value="">All Properties</option>
                    {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
                <span className="ml-auto text-xs text-gray-400">Available reports: Sales · Leads · Conversion · Agents · Properties · Payments · Campaigns · Site Visits · Lost Leads</span>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {TABS.map((t) => {
                    const Icon = t.icon;
                    return (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t.key ? 'bg-[#0D1B3E] text-white' : 'bg-white border border-[#E1E8F0] text-gray-600 hover:bg-[#F7F9FC]'}`}>
                            <Icon size={15} /> {t.label}
                        </button>
                    );
                })}
            </div>

            {/* KPI cards (always visible) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard icon={IndianRupee} label="Revenue (YTD)" value={`₹${totalRevenue.toFixed(1)} Cr`} color="navy" />
                <StatCard icon={Users} label="Total Leads" value={String(totalLeads)} color="blue" />
                <StatCard icon={TrendingUp} label="Bookings" value={String(totalBookings)} color="gold" />
                <StatCard icon={Trophy} label="Closed Won Deals" value={String(wonDeals)} color="emerald" />
            </div>

            {/* Overview tab */}
            {tab === 'overview' && (
                <>
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-5 mb-6">
                        <h3 className="font-semibold text-[#0D1B3E] mb-2">Revenue Trend</h3>
                        <p className="text-xs text-gray-400 mb-4">Monthly property sales revenue (₹ Cr)</p>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueByMonth}>
                                    <defs>
                                        <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0D1B3E" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#0D1B3E" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="revenue" stroke="#0D1B3E" fill="url(#rev)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                            <h3 className="font-semibold text-[#0D1B3E] mb-4">Lead Sources</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={leadSourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                            {leadSourceData.map((entry, i) => <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                            <h3 className="font-semibold text-[#0D1B3E] mb-4">Pipeline Funnel</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={pipelineFunnel} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
                                        <XAxis type="number" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                        <YAxis type="category" dataKey="stage" width={120} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#C9963A" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                            <h3 className="font-semibold text-[#0D1B3E] mb-4">Agent Performance — Revenue (₹ Cr)</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={agentPerformance}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Bar dataKey="revenue" fill="#0D1B3E" radius={[4, 4, 0, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                            <h3 className="font-semibold text-[#0D1B3E] mb-4">Collections vs Pending (₹ Cr)</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={paymentData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
                                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="collected" stroke="#059669" strokeWidth={2} />
                                        <Line type="monotone" dataKey="pending" stroke="#DC2626" strokeWidth={2} strokeDasharray="5 5" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Sales tab */}
            {tab === 'sales' && (
                <div className="bg-white rounded-xl border border-[#E1E8F0] overflow-hidden mb-6">
                    <div className="px-5 py-4 border-b border-[#F0F4F8]"><h3 className="font-semibold text-[#0D1B3E]">Sales / Deals Report</h3></div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#F7F9FC] text-left text-xs uppercase tracking-wider text-gray-400">
                                    <th className="px-5 py-3 font-semibold">Customer</th>
                                    <th className="px-4 py-3 font-semibold">Property</th>
                                    <th className="px-4 py-3 font-semibold">Value</th>
                                    <th className="px-4 py-3 font-semibold">Stage</th>
                                    <th className="px-4 py-3 font-semibold">Probability</th>
                                    <th className="px-4 py-3 font-semibold">Agent</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0F4F8]">
                                {reportTables.deals.map((d, i) => (
                                    <tr key={i} className="hover:bg-[#FAFBFD]">
                                        <td className="px-5 py-3 font-medium text-[#0D1B3E]">{d.customer}</td>
                                        <td className="px-4 py-3 text-gray-600">{d.property}</td>
                                        <td className="px-4 py-3 font-semibold text-[#0D1B3E]">{fmtMoney(d.value)}</td>
                                        <td className="px-4 py-3"><span className="status-badge bg-[#0D1B3E]/5 text-[#0D1B3E]">{d.stage}</span></td>
                                        <td className="px-4 py-3 text-gray-600">{d.probability}%</td>
                                        <td className="px-4 py-3 text-gray-600">{d.agent}</td>
                                    </tr>
                                ))}
                                {reportTables.deals.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No deals in this range</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Leads tab */}
            {tab === 'leads' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <StatCard icon={Users} label="Total Leads (filtered)" value={String(leadSourceData.reduce((s, x) => s + x.value, 0))} color="blue" />
                        <StatCard icon={Target} label="Sources" value={String(leadSourceData.length)} color="gold" />
                        <StatCard icon={IndianRupee} label="Lost Leads" value={String(lostLeadReport.totalLost)} color="red" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                            <h3 className="font-semibold text-[#0D1B3E] mb-4">Lead Sources</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={leadSourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                            {leadSourceData.map((e, i) => <Cell key={`c-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-[#E1E8F0] overflow-hidden">
                            <div className="px-5 py-4 border-b border-[#F0F4F8]"><h3 className="font-semibold text-[#0D1B3E]">Recent Leads</h3></div>
                            <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-[#F7F9FC] text-left text-xs uppercase tracking-wider text-gray-400">
                                            <th className="px-5 py-3 font-semibold">Name</th>
                                            <th className="px-4 py-3 font-semibold">Source</th>
                                            <th className="px-4 py-3 font-semibold">Status</th>
                                            <th className="px-4 py-3 font-semibold">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#F0F4F8]">
                                        {reportTables.leads.map((l, i) => (
                                            <tr key={i} className="hover:bg-[#FAFBFD]">
                                                <td className="px-5 py-3 font-medium text-[#0D1B3E]">{l.name}</td>
                                                <td className="px-4 py-3 text-gray-600">{l.source}</td>
                                                <td className="px-4 py-3"><span className="status-badge bg-[#0D1B3E]/5 text-[#0D1B3E]">{l.status}</span></td>
                                                <td className="px-4 py-3 text-gray-600">{l.created}</td>
                                            </tr>
                                        ))}
                                        {reportTables.leads.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">No leads in this range</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Conversion tab */}
            {tab === 'conversion' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                        <h3 className="font-semibold text-[#0D1B3E] mb-4">Pipeline Funnel (Conversion)</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={pipelineFunnel} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
                                    <XAxis type="number" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="stage" width={120} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#059669" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                        <h3 className="font-semibold text-[#0D1B3E] mb-4">Stage Value (₹ Cr)</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={pipelineFunnel} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
                                    <XAxis type="number" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="stage" width={120} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#C9963A" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Agent performance tab */}
            {tab === 'agents' && (
                <div className="bg-white rounded-xl border border-[#E1E8F0] p-5 mb-6">
                    <h3 className="font-semibold text-[#0D1B3E] mb-2">Agent Performance — Closed Won</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={agentPerformance}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="revenue" fill="#0D1B3E" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey="deals" fill="#C9963A" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Property performance tab */}
            {tab === 'properties' && (
                <div className="bg-white rounded-xl border border-[#E1E8F0] overflow-hidden mb-6">
                    <div className="px-5 py-4 border-b border-[#F0F4F8]"><h3 className="font-semibold text-[#0D1B3E]">Property Performance</h3></div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#F7F9FC] text-left text-xs uppercase tracking-wider text-gray-400">
                                    <th className="px-5 py-3 font-semibold">Property</th>
                                    <th className="px-4 py-3 font-semibold">Views</th>
                                    <th className="px-4 py-3 font-semibold">Leads</th>
                                    <th className="px-4 py-3 font-semibold">Deals</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0F4F8]">
                                {propertyPerformance.map((p, i) => (
                                    <tr key={i} className="hover:bg-[#FAFBFD]">
                                        <td className="px-5 py-3 font-medium text-[#0D1B3E]">{p.name}</td>
                                        <td className="px-4 py-3 text-gray-600">{p.views}</td>
                                        <td className="px-4 py-3 text-gray-600">{p.leads}</td>
                                        <td className="px-4 py-3 text-gray-600">{p.deals}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Payments tab */}
            {tab === 'payments' && (
                <>
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-5 mb-6">
                        <h3 className="font-semibold text-[#0D1B3E] mb-4">Collections vs Pending (₹ Cr)</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={paymentData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="collected" stroke="#059669" strokeWidth={2} />
                                    <Line type="monotone" dataKey="pending" stroke="#DC2626" strokeWidth={2} strokeDasharray="5 5" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E1E8F0] overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#F0F4F8]"><h3 className="font-semibold text-[#0D1B3E]">Payments</h3></div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#F7F9FC] text-left text-xs uppercase tracking-wider text-gray-400">
                                        <th className="px-5 py-3 font-semibold">Customer</th>
                                        <th className="px-4 py-3 font-semibold">Amount</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold">Due</th>
                                        <th className="px-4 py-3 font-semibold">Paid</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F0F4F8]">
                                    {reportTables.payments.map((p, i) => (
                                        <tr key={i} className="hover:bg-[#FAFBFD]">
                                            <td className="px-5 py-3 font-medium text-[#0D1B3E]">{p.customer}</td>
                                            <td className="px-4 py-3 font-semibold text-[#0D1B3E]">{fmtMoney(p.amount)}</td>
                                            <td className="px-4 py-3"><span className="status-badge bg-[#0D1B3E]/5 text-[#0D1B3E]">{p.status}</span></td>
                                            <td className="px-4 py-3 text-gray-600">{p.due || '—'}</td>
                                            <td className="px-4 py-3 text-gray-600">{p.paid || '—'}</td>
                                        </tr>
                                    ))}
                                    {reportTables.payments.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No payments in this range</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Campaigns tab */}
            {tab === 'campaigns' && (
                <div className="bg-white rounded-xl border border-[#E1E8F0] overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#F0F4F8]"><h3 className="font-semibold text-[#0D1B3E]">Campaign Performance</h3></div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#F7F9FC] text-left text-xs uppercase tracking-wider text-gray-400">
                                    <th className="px-5 py-3 font-semibold">Campaign</th>
                                    <th className="px-4 py-3 font-semibold">Channel</th>
                                    <th className="px-4 py-3 font-semibold">Budget</th>
                                    <th className="px-4 py-3 font-semibold">Spent</th>
                                    <th className="px-4 py-3 font-semibold">Leads</th>
                                    <th className="px-4 py-3 font-semibold">Conv</th>
                                    <th className="px-4 py-3 font-semibold">ROI</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0F4F8]">
                                {campaignPerformance.map((c, i) => (
                                    <tr key={i} className="hover:bg-[#FAFBFD]">
                                        <td className="px-5 py-3 font-medium text-[#0D1B3E]">{c.name}</td>
                                        <td className="px-4 py-3 text-gray-600">{c.channel}</td>
                                        <td className="px-4 py-3 text-gray-600">{fmtMoney(c.budget)}</td>
                                        <td className="px-4 py-3 text-gray-600">{fmtMoney(c.spent)}</td>
                                        <td className="px-4 py-3 text-gray-600">{c.leads}</td>
                                        <td className="px-4 py-3 text-gray-600">{c.conversions}</td>
                                        <td className="px-4 py-3 font-semibold text-emerald-600">{c.roi}</td>
                                        <td className="px-4 py-3"><span className="status-badge bg-[#0D1B3E]/5 text-[#0D1B3E]">{c.status}</span></td>
                                    </tr>
                                ))}
                                {campaignPerformance.length === 0 && <tr><td colSpan={8} className="px-5 py-8 text-center text-gray-400">No campaigns in this range</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Site visits tab */}
            {tab === 'sitevisits' && (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <StatCard icon={CalendarCheck} label="Total" value={String(siteVisitReport.total)} color="navy" />
                        <StatCard icon={CalendarCheck} label="Scheduled" value={String(siteVisitReport.scheduled)} color="blue" />
                        <StatCard icon={CalendarCheck} label="Completed" value={String(siteVisitReport.completed)} color="emerald" />
                        <StatCard icon={CalendarCheck} label="Rescheduled" value={String(siteVisitReport.rescheduled)} color="gold" />
                        <StatCard icon={CalendarCheck} label="Cancelled" value={String(siteVisitReport.cancelled)} color="red" />
                    </div>
                    <div className="bg-white rounded-xl border border-[#E1E8F0] overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#F0F4F8]"><h3 className="font-semibold text-[#0D1B3E]">Site Visits</h3></div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#F7F9FC] text-left text-xs uppercase tracking-wider text-gray-400">
                                        <th className="px-5 py-3 font-semibold">Visit ID</th>
                                        <th className="px-4 py-3 font-semibold">Customer</th>
                                        <th className="px-4 py-3 font-semibold">Property</th>
                                        <th className="px-4 py-3 font-semibold">Date</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F0F4F8]">
                                    {siteVisits.map((v, i) => (
                                        <tr key={i} className="hover:bg-[#FAFBFD]">
                                            <td className="px-5 py-3 font-medium text-[#0D1B3E]">{v.id}</td>
                                            <td className="px-4 py-3 font-medium text-[#0D1B3E]">{v.customer}</td>
                                            <td className="px-4 py-3 text-gray-600">{v.property}</td>
                                            <td className="px-4 py-3 text-gray-600">{v.date}</td>
                                            <td className="px-4 py-3"><span className="status-badge bg-[#0D1B3E]/5 text-[#0D1B3E]">{v.status}</span></td>
                                        </tr>
                                    ))}
                                    {siteVisits.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No site visits in this range</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Lost leads tab */}
            {tab === 'lostleads' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                        <h3 className="font-semibold text-[#0D1B3E] mb-4">Lost Leads by Source</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={lostLeadReport.bySource} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {lostLeadReport.bySource.map((e, i) => <Cell key={`c-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <StatCard icon={UserX} label="Lost Leads" value={String(lostLeadReport.totalLost)} color="red" />
                            <StatCard icon={TrendingUp} label="Converted" value={String(lostLeadReport.converted)} color="emerald" />
                            <StatCard icon={Users} label="Total Leads" value={String(lostLeadReport.total)} color="blue" />
                        </div>
                        <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                            <h3 className="font-semibold text-[#0D1B3E] mb-2">Conversion Snapshot</h3>
                            <div className="space-y-3">
                                {lostLeadReport.total > 0 && (
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Converted</span><span>{lostLeadReport.converted} ({Math.round((lostLeadReport.converted / lostLeadReport.total) * 100)}%)</span></div>
                                        <div className="h-2 bg-[#F0F4F8] rounded-full"><div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${(lostLeadReport.converted / lostLeadReport.total) * 100}%` }} /></div>
                                    </div>
                                )}
                                {lostLeadReport.total > 0 && (
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Lost</span><span>{lostLeadReport.totalLost} ({Math.round((lostLeadReport.totalLost / lostLeadReport.total) * 100)}%)</span></div>
                                        <div className="h-2 bg-[#F0F4F8] rounded-full"><div className="h-2 bg-red-500 rounded-full" style={{ width: `${(lostLeadReport.totalLost / lostLeadReport.total) * 100}%` }} /></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
