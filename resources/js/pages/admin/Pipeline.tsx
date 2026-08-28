import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import Modal from '@/components/ui/Modal';
import { TrendingUp, IndianRupee, Trophy, Percent, Users, Search, Plus, XCircle } from 'lucide-react';
import type { PageProps } from '@/types';

interface DealRow {
    id: number;
    deal_id: string;
    customer_name: string;
    property_name: string;
    deal_value: number;
    value_label: string;
    stage: string;
    probability: number;
    days_in_stage: number;
    agent_name: string;
    agent_id: number | null;
    last_activity?: string;
    next_followup?: string;
}

interface Props extends PageProps {
    deals: DealRow[];
    stages: string[];
    agents: { id: number; name: string; initials: string }[];
    properties: { id: number; title: string }[];
    leads: { id: number; name: string }[];
    customers: { id: number; name: string }[];
    summary: {
        total: number;
        pipelineValue: number;
        activeCount: number;
        expectedRevenue: number;
        wonValue: number;
        wonCount: number;
        lostValue: number;
        conversionRate: number;
    };
}

function fmtCr(n: number) {
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
    return '₹' + (n / 100000).toFixed(1) + ' L';
}

const stageColors: Record<string, string> = {
    'New Lead': 'border-blue-300 bg-blue-50/50',
    Contacted: 'border-purple-300 bg-purple-50/50',
    Qualified: 'border-gold-300 bg-gold-50/50',
    'Property Shortlisted': 'border-teal-300 bg-teal-50/50',
    'Site Visit Scheduled': 'border-amber-300 bg-amber-50/50',
    'Site Visit Completed': 'border-orange-300 bg-orange-50/50',
    Negotiation: 'border-indigo-300 bg-indigo-50/50',
    Booking: 'border-emerald-300 bg-emerald-50/50',
    Agreement: 'border-emerald-300 bg-emerald-50/60',
    Payment: 'border-emerald-300 bg-emerald-50/70',
    'Closed Won': 'border-green-400 bg-green-50',
    'Closed Lost': 'border-red-300 bg-red-50/50',
};

export default function Pipeline(props: Props) {
    const { deals, stages, agents, properties, leads, summary } = props;
    const [openCard, setOpenCard] = useState<{ id: number; stage: string } | null>(null);
    const [agentFilter, setAgentFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [dragId, setDragId] = useState<number | null>(null);
    const [showAdd, setShowAdd] = useState(false);

    const { data, setData, post, processing } = useForm({
        customer_name: '',
        property_id: '',
        lead_id: '',
        deal_value: '',
        stage: 'New Lead',
        probability: '10',
        assigned_agent_id: '',
    });

    const moveStage = (dealId: number, stage: string) => {
        router.put(`/admin/deals/${dealId}/stage`, { stage }, { preserveScroll: true });
        setOpenCard(null);
    };

    const onDrop = (e: React.DragEvent, stage: string) => {
        e.preventDefault();
        const id = Number(e.dataTransfer.getData('text/deal-id')) || dragId;
        if (id) {
            moveStage(id, stage);
        }
        setDragId(null);
    };

    const onDragStart = (e: React.DragEvent, id: number) => {
        e.dataTransfer.setData('text/deal-id', String(id));
        setDragId(id);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/deals', { onSuccess: () => setShowAdd(false) });
    };

    const filtered = deals.filter((d) => {
        const matchAgent = agentFilter === 'All' || d.agent_id === Number(agentFilter);
        const q = search.trim().toLowerCase();
        const matchSearch = !q || d.customer_name.toLowerCase().includes(q) || d.property_name.toLowerCase().includes(q);
        return matchAgent && matchSearch;
    });

    const groupByStage = (stage: string) => filtered.filter((d) => d.stage === stage);

    const inputCls = "w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30";

    return (
        <AdminLayout>
            <PageHeader
                title="Sales Pipeline"
                subtitle="Drag or move deals through the sales stages"
                breadcrumbs={[{ label: 'Sales' }, { label: 'Sales Pipeline' }]}
                actions={
                    <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-bold hover:bg-[#1A2B50] transition-colors">
                        <Plus size={16} /> New Deal
                    </button>
                }
            />

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                <StatCard icon={TrendingUp} label="Total Deals" value={String(summary.total)} color="navy" />
                <StatCard icon={IndianRupee} label="Pipeline Value" value={fmtCr(summary.pipelineValue)} sub={`${summary.activeCount} active`} color="gold" />
                <StatCard icon={TrendingUp} label="Expected Revenue" value={fmtCr(summary.expectedRevenue)} sub="weighted" color="blue" />
                <StatCard icon={Trophy} label="Closed Won" value={fmtCr(summary.wonValue)} sub={`${summary.wonCount} deals`} color="emerald" />
                <StatCard icon={Percent} label="Conversion Rate" value={`${summary.conversionRate}%`} sub="won / total" color="purple" />
                <StatCard icon={XCircle} label="Closed Lost" value={`${summary.lostValue ? fmtCr(summary.lostValue) : '—'}`} color="red" />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-[#E1E8F0] p-4 mb-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer or property..." className="pl-9 pr-4 py-2 w-full text-sm border border-[#E1E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                </div>
                <div className="flex items-center gap-2">
                    <Users size={15} className="text-gray-400" />
                    <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} className="px-3 py-2 border border-[#E1E8F0] rounded-lg text-sm">
                        <option value="All">All Agents</option>
                        {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Kanban */}
            <div className="kanban-board flex gap-4 pb-4 overflow-x-auto">
                {stages.map((stage) => {
                    const stageDeals = groupByStage(stage);
                    const totalValue = stageDeals.reduce((s, d) => s + d.deal_value, 0);
                    return (
                        <div
                            key={stage}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => onDrop(e, stage)}
                            className={`flex-shrink-0 w-72 rounded-xl border p-3 ${dragId ? 'ring-2 ring-gold-400/50' : ''} ${stageColors[stage] || 'border-[#E1E8F0] bg-[#F7F9FC]'}`}
                        >
                            <div className="flex items-center justify-between px-1 pb-3">
                                <div>
                                    <div className="font-semibold text-[#0D1B3E] text-sm">{stage}</div>
                                    <div className="text-[11px] text-gray-500 mt-0.5">{stageDeals.length} deals · {fmtCr(totalValue)}</div>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-gray-500 font-semibold">{stageDeals.length}</span>
                            </div>
                            <div className="space-y-2.5">
                                {stageDeals.map((d) => (
                                    <div
                                        key={d.id}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, d.id)}
                                        onDragEnd={() => setDragId(null)}
                                        className={`bg-white rounded-lg border border-[#E1E8F0] p-3 shadow-sm cursor-grab active:cursor-grabbing ${dragId === d.id ? 'opacity-50' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="font-semibold text-[#0D1B3E] text-sm leading-tight">{d.customer_name}</div>
                                                <div className="text-gray-400 text-xs mt-0.5 truncate max-w-[180px]">{d.property_name}</div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setOpenCard(openCard?.id === d.id ? null : { id: d.id, stage })}
                                                className="text-[10px] text-gold-600 font-semibold hover:underline whitespace-nowrap"
                                            >
                                                {openCard?.id === d.id ? 'Close' : 'Move'}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#F0F4F8]">
                                            <span className="font-bold text-[#0D1B3E] text-sm">{d.value_label}</span>
                                            <span className="text-[10px] text-gray-400">{d.probability}%</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-1.5 text-[10px] text-gray-400">
                                            <span>{d.agent_name}</span>
                                            <span>{d.days_in_stage}d</span>
                                        </div>

                                        {openCard?.id === d.id && (
                                            <div className="mt-2 pt-2 border-t border-[#F0F4F8]">
                                                <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">Move to</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {stages.filter((s) => s !== stage).map((s) => (
                                                        <button
                                                            key={s}
                                                            type="button"
                                                            onClick={() => moveStage(d.id, s)}
                                                            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white text-gray-600 hover:ring-1 hover:ring-gold-400"
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {stageDeals.length === 0 && (
                                    <div className="border border-dashed border-white/70 rounded-lg py-6 text-center text-[11px] text-gray-400 bg-white/30">
                                        Drop deals here
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <p className="text-xs text-gray-400 mt-2">Tip: drag a deal card and drop it into another stage to move it.</p>

            {/* New Deal Modal */}
            <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Create Deal" subtitle="Add a new deal to the pipeline">
                <form onSubmit={submit} className="space-y-3.5">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Customer Name *</label>
                        <input value={data.customer_name} onChange={(e) => setData('customer_name', e.target.value)} required className={inputCls} placeholder="e.g. Rahul Sharma" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Property</label>
                            <select value={data.property_id} onChange={(e) => setData('property_id', e.target.value)} className={inputCls}>
                                <option value="">Select Property</option>
                                {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Deal Value (₹) *</label>
                            <input type="number" value={data.deal_value} onChange={(e) => setData('deal_value', e.target.value)} required className={inputCls} placeholder="18500000" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stage</label>
                            <select value={data.stage} onChange={(e) => setData('stage', e.target.value)} className={inputCls}>
                                {stages.map((s) => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Probability (%)</label>
                            <input type="number" min={0} max={100} value={data.probability} onChange={(e) => setData('probability', e.target.value)} className={inputCls} placeholder="10" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Assigned Agent</label>
                            <select value={data.assigned_agent_id} onChange={(e) => setData('assigned_agent_id', e.target.value)} className={inputCls}>
                                <option value="">Unassigned</option>
                                {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                        <button type="submit" disabled={processing} className="px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-bold disabled:opacity-60">
                            {processing ? 'Creating...' : 'Create Deal'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
