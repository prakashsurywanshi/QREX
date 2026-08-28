import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import Modal from '@/components/ui/Modal';
import StatCard from '@/components/shared/StatCard';
import { Plus, Megaphone, TrendingUp, Users, IndianRupee, Percent, Star, Globe } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    campaigns: any[];
    leadSources: { name: string; value: number }[];
    propertyPromotions: any[];
    landingLeads: { name: string; phone: string; status: string; created: string }[];
    conversionData: { name: string; leads: number; conversions: number; revenue: number }[];
}

const statusColor: Record<string, string> = {
    Active: 'bg-emerald-100 text-emerald-700',
    Scheduled: 'bg-amber-100 text-amber-700',
    Completed: 'bg-blue-100 text-blue-700',
    Paused: 'bg-gray-100 text-gray-600',
};

const PIE_COLORS = ['#0D1B3E', '#C9963A', '#059669', '#2563EB', '#9333EA', '#DC2626'];

function fmtCr(n: number) {
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
    if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + ' L';
    return '₹' + Number(n).toLocaleString('en-IN');
}

export default function Marketing(props: Props) {
    const { campaigns, leadSources, propertyPromotions, landingLeads, conversionData } = props;
    const [showAdd, setShowAdd] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        channel: 'Facebook + Instagram',
        budget: '',
        start_date: '',
        end_date: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/marketing', { onSuccess: () => setShowAdd(false) });
    };

    const totalBudget = campaigns.reduce((s, c) => s + Number(c.budget || 0), 0);
    const totalSpent = campaigns.reduce((s, c) => s + Number(c.spent || 0), 0);
    const totalLeads = campaigns.reduce((s, c) => s + Number(c.leads || 0), 0);
    const totalRevenue = campaigns.reduce((s, c) => s + Number(c.revenue || 0), 0);

    const fmtDate = (d: string) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    return (
        <AdminLayout>
            <PageHeader
                title="Marketing"
                subtitle="Track campaigns and lead generation performance"
                breadcrumbs={[{ label: 'Marketing' }, { label: 'Campaigns' }]}
                actions={
                    <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50] transition-colors">
                        <Plus size={16} /> New Campaign
                    </button>
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard icon={IndianRupee} label="Total Budget" value={fmtCr(totalBudget)} color="navy" />
                <StatCard icon={TrendingUp} label="Spent" value={fmtCr(totalSpent)} color="gold" />
                <StatCard icon={Users} label="Total Leads" value={String(totalLeads)} color="blue" />
                <StatCard icon={Percent} label="Total Revenue" value={fmtCr(totalRevenue)} color="emerald" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Campaigns */}
                <div className="lg:col-span-2 space-y-4">
                    {campaigns.map((c) => (
                        <div key={c.id} className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gold-500/15 flex items-center justify-center">
                                        <Megaphone size={18} className="text-gold-600" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-[#0D1B3E]">{c.name}</div>
                                        <div className="text-gray-400 text-xs">{c.campaign_id} · {c.channel}</div>
                                    </div>
                                </div>
                                <span className={`status-badge ${statusColor[c.status] || 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                <div className="bg-[#F7F9FC] rounded-lg p-3">
                                    <div className="text-xs text-gray-400 mb-0.5">Budget</div>
                                    <div className="font-semibold text-[#0D1B3E] text-sm">{fmtCr(c.budget)}</div>
                                </div>
                                <div className="bg-[#F7F9FC] rounded-lg p-3">
                                    <div className="text-xs text-gray-400 mb-0.5">Spent</div>
                                    <div className="font-semibold text-[#0D1B3E] text-sm">{fmtCr(c.spent)}</div>
                                </div>
                                <div className="bg-[#F7F9FC] rounded-lg p-3">
                                    <div className="text-xs text-gray-400 mb-0.5">Leads</div>
                                    <div className="font-semibold text-[#0D1B3E] text-sm">{c.leads} ({c.conversions} conv)</div>
                                    {c.lead_count > 0 && (
                                        <div className="text-[11px] text-indigo-600 mt-0.5 font-medium">{c.lead_count} linked in CRM</div>
                                    )}
                                </div>
                                <div className="bg-[#F7F9FC] rounded-lg p-3">
                                    <div className="text-xs text-gray-400 mb-0.5">ROI</div>
                                    <div className="font-semibold text-emerald-600 text-sm">{c.roi}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>Revenue: <span className="font-semibold text-[#0D1B3E]">{c.revenue_label}</span></span>
                                <span>{fmtDate(c.start_date)} → {fmtDate(c.end_date)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Lead Sources Pie */}
                <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                    <h3 className="font-semibold text-[#0D1B3E] mb-4">Lead Sources</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={leadSources} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {leadSources.map((entry, i) => (
                                        <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Conversion Analytics */}
            <div className="bg-white rounded-xl border border-[#E1E8F0] p-5 mb-6">
                <h3 className="font-semibold text-[#0D1B3E] mb-4 flex items-center gap-2"><TrendingUp size={16} /> Conversion Analytics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={conversionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="leads" name="Leads" fill="#0D1B3E" radius={[4, 4, 0, 0]} barSize={18} />
                                <Bar dataKey="conversions" name="Conversions" fill="#C9963A" radius={[4, 4, 0, 0]} barSize={18} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-2.5">
                        {conversionData.map((c) => {
                            const rate = c.leads ? Math.round((c.conversions / c.leads) * 100) : 0;
                            return (
                                <div key={c.name} className="border border-[#F0F4F8] rounded-lg p-3">
                                    <div className="flex items-center justify-between text-sm mb-1.5">
                                        <span className="font-medium text-[#0D1B3E]">{c.name}</span>
                                        <span className="text-xs font-semibold text-emerald-600">{rate}% conversion</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>{c.leads} leads</span>
                                        <span>→</span>
                                        <span>{c.conversions} conversions</span>
                                        <span>→</span>
                                        <span className="font-semibold text-gold-600">{c.revenue ? '₹' + (c.revenue / 100000).toFixed(1) + ' L' : '—'}</span>
                                    </div>
                                </div>
                            );
                        })}
                        {conversionData.length === 0 && <p className="text-gray-400 text-sm">No campaign conversion data yet.</p>}
                    </div>
                </div>
            </div>

            {/* Property Promotions + Landing Page Leads */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Property promotions */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-[#E1E8F0] p-5">
                    <h3 className="font-semibold text-[#0D1B3E] mb-4 flex items-center gap-2"><Star size={16} className="text-gold-500" /> Property Promotions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {propertyPromotions.map((p) => (
                            <div key={p.id} className="flex items-center gap-3 border border-[#F0F4F8] rounded-lg p-2.5">
                                <img src={p.image} alt="" className="w-14 h-12 rounded-lg object-cover" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-[#0D1B3E] text-xs truncate">{p.title}</div>
                                    <div className="text-gray-400 text-[11px] truncate">{p.address || p.status}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-gold-600 text-xs">{p.price_label}</div>
                                </div>
                            </div>
                        ))}
                        {propertyPromotions.length === 0 && <p className="text-gray-400 text-sm">No promotions set. Edit the CMS to feature properties.</p>}
                    </div>
                </div>

                {/* Landing page leads */}
                <div className="bg-white rounded-xl border border-[#E1E8F0] overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#F0F4F8]">
                        <h3 className="font-semibold text-[#0D1B3E] flex items-center gap-2"><Globe size={16} /> Landing Page Leads</h3>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#F7F9FC] text-left text-xs uppercase tracking-wider text-gray-400">
                                    <th className="px-5 py-2.5 font-semibold">Name</th>
                                    <th className="px-3 py-2.5 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0F4F8]">
                                {landingLeads.map((l, i) => (
                                    <tr key={i} className="hover:bg-[#FAFBFD]">
                                        <td className="px-5 py-3">
                                            <div className="font-medium text-[#0D1B3E] text-xs">{l.name}</div>
                                            <div className="text-gray-400 text-[11px]">{l.phone} · {l.created}</div>
                                        </td>
                                        <td className="px-3 py-3"><span className="status-badge bg-[#0D1B3E]/5 text-[#0D1B3E]">{l.status}</span></td>
                                    </tr>
                                ))}
                                {landingLeads.length === 0 && <tr><td colSpan={2} className="px-5 py-6 text-center text-gray-400 text-sm">No landing page leads yet</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Campaign Modal */}
            <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Create Campaign">
                <form onSubmit={submit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Campaign Name *</label>
                            <input value={data.name} onChange={(e) => setData('name', e.target.value)} required className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Channel</label>
                            <select value={data.channel} onChange={(e) => setData('channel', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                {['Facebook + Instagram', 'Google Ads', 'LinkedIn + Email', 'Print Media', 'Referral Program', 'Website SEO'].map((c) => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Budget (₹) *</label>
                            <input type="number" value={data.budget} onChange={(e) => setData('budget', e.target.value)} required className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                            {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Start Date *</label>
                            <input type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} required className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">End Date *</label>
                            <input type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} required className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                        <button type="submit" disabled={processing} className="px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                            {processing ? 'Creating...' : 'Create Campaign'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
