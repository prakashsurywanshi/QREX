import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import ActivityTimeline from '@/components/shared/ActivityTimeline';
import Modal from '@/components/ui/Modal';
import {
    ChevronLeft, Phone, Mail, MapPin, Gauge, CalendarClock, Clock, Pencil,
    Plus, PhoneCall, MessageSquare, StickyNote, RefreshCw, ArrowRightLeft, IndianRupee,
} from 'lucide-react';
import type { Lead, PageProps } from '@/types';

interface Props extends PageProps {
    lead: any;
    activities: any[];
    handovers: any[];
    recommendations: any[];
    agents: { id: number; name: string }[];
    owners: { id: number; name: string }[];
    campaigns: { id: number; name: string }[];
}

const statusColor: Record<string, string> = {
    New: 'bg-blue-100 text-blue-700',
    Contacted: 'bg-purple-100 text-purple-700',
    Qualified: 'bg-gold-100 text-gold-700',
    'Site Visit Scheduled': 'bg-amber-100 text-amber-700',
    'Site Visit Completed': 'bg-teal-100 text-teal-700',
    Negotiation: 'bg-orange-100 text-orange-700',
    Converted: 'bg-emerald-100 text-emerald-700',
    Lost: 'bg-red-100 text-red-600',
};

const statuses = ['New', 'Contacted', 'Qualified', 'Site Visit Scheduled', 'Site Visit Completed', 'Negotiation', 'Converted', 'Lost'];

export default function LeadDetail(props: Props) {
    const { lead, activities, handovers, recommendations, agents, owners, campaigns, can } = props;
    const canConvertLead = !!can?.sales?.create;
    const [editOpen, setEditOpen] = useState(false);
    const [handoverOpen, setHandoverOpen] = useState(false);
    const [activityType, setActivityType] = useState<'Call' | 'WhatsApp' | 'Note'>('Call');

    const { data, setData, post, processing, errors } = useForm({
        type: 'Call',
        title: '',
        description: '',
    });

    const { data: editData, setData: setEditData, put, processing: editProcessing } = useForm({
        name: lead.name || '',
        phone: lead.phone || '',
        email: lead.email || '',
        source: lead.source || '',
        status: lead.status || '',
        budget: lead.budget || '',
        preferred_location: lead.preferred_location || '',
        assigned_agent_id: lead.assigned_agent_id || '',
        owner_id: lead.owner_id || '',
        campaign_id: lead.campaign_id || '',
        next_followup: lead.next_followup || '',
        score: lead.score || 0,
    });

    const handoverForm = useForm({
        assigned_agent_id: lead.assigned_agent_id || '',
        reason: '',
        notes: '',
    });

    const changeStatus = (s: string) => {
        router.post(`/admin/leads/${lead.id}/status`, { status: s }, { preserveScroll: true });
    };

    const [convertOpen, setConvertOpen] = useState(false);
    const { data: convertData, setData: setConvertData, post: postConvert, processing: convertProcessing } = useForm({
        deal_value: '',
        property_id: lead.interested_property_id || '',
    });
                    const canConvert = canConvertLead && !['Converted', 'Lost'].includes(lead.status);

    const submitConvert = (e: React.FormEvent) => {
        e.preventDefault();
        postConvert(`/admin/leads/${lead.id}/convert`, {
            onSuccess: () => setConvertOpen(false),
        });
    };

    const submitActivity = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/leads/${lead.id}/activity`, { onSuccess: () => { setData('title', ''); setData('description', ''); } });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/leads/${lead.id}`, { onSuccess: () => setEditOpen(false) });
    };

    const submitHandover = (e: React.FormEvent) => {
        e.preventDefault();
        handoverForm.post(`/admin/leads/${lead.id}/reassign`, {
            onSuccess: () => { setHandoverOpen(false); handoverForm.reset(); },
        });
    };

    const property = lead.interested_property;

    return (
        <AdminLayout>
            <PageHeader
                title={lead.name}
                subtitle={`${lead.lead_id} · Lead created ${formatDate(lead.created_at)}`}
                breadcrumbs={[{ label: 'Sales' }, { label: 'Leads', href: '/admin/leads' }, { label: lead.lead_id }]}
                actions={
                    <>
                        <Link href="/admin/leads" className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600 hover:bg-[#F7F9FC]">
                            <ChevronLeft size={16} /> Back
                        </Link>
                        {canConvert && (
                            <button onClick={() => setConvertOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-gold-600 text-white rounded-lg text-sm font-semibold hover:bg-gold-700">
                                <ArrowRightLeft size={14} /> Convert to Deal
                            </button>
                        )}
                        <button onClick={() => setEditOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50]">
                            <Pencil size={14} /> Edit
                        </button>
                    </>
                }
            />

            {/* Lead Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Contact info */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-[#E1E8F0] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0D1B3E] to-gold-500 flex items-center justify-center text-white font-bold text-lg">
                                {lead.name?.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[#0D1B3E]">{lead.name}</h2>
                                <span className={`status-badge ${statusColor[lead.status] || 'bg-gray-100 text-gray-600'}`}>{lead.status}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center justify-end gap-2 text-sm text-[#0D1B3E] font-semibold">
                                <Gauge size={16} className="text-gold-500" /> Score: {lead.score}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">Source: {lead.source}</div>
                            {lead.campaign && (
                                <div className="text-xs mt-0.5 text-indigo-600 font-medium mt-1">Campaign: {lead.campaign.name}</div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                        <div className="flex items-center gap-3 text-sm text-gray-600 bg-[#F7F9FC] rounded-lg px-3 py-2.5">
                            <Phone size={15} className="text-[#0D1B3E]" /> {lead.phone}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 bg-[#F7F9FC] rounded-lg px-3 py-2.5">
                            <Mail size={15} className="text-[#0D1B3E]" /> {lead.email || '—'}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 bg-[#F7F9FC] rounded-lg px-3 py-2.5">
                            <MapPin size={15} className="text-[#0D1B3E]" /> {lead.preferred_location || '—'}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 bg-[#F7F9FC] rounded-lg px-3 py-2.5">
                            <Clock size={15} className="text-[#0D1B3E]" /> Budget: {lead.budget || '—'}
                        </div>
                    </div>

                    {property && (
                        <div className="bg-[#F7F9FC] rounded-xl p-4">
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Interested Property</div>
                            <Link href={`/admin/properties/${property.id}`} className="flex items-center gap-3 hover:opacity-80">
                                <img src={property.image} alt="" className="w-16 h-12 rounded-lg object-cover" />
                                <div>
                                    <div className="font-semibold text-[#0D1B3E] text-sm">{property.title}</div>
                                    <div className="text-gray-400 text-xs">{property.price_label} · {property.location}</div>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Status changer */}
                <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                    <h3 className="font-semibold text-[#0D1B3E] mb-4">Update Status</h3>
                    <div className="space-y-1.5">
                        {statuses.map((s) => (
                            <button
                                key={s}
                                onClick={() => changeStatus(s)}
                                disabled={s === lead.status}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${s === lead.status ? 'bg-[#0D1B3E] text-white font-semibold' : 'text-gray-600 hover:bg-[#F7F9FC]'}`}
                            >
                                <span className="flex items-center gap-2"><RefreshCw size={13} /> {s}</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#F0F4F8]">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-gray-600"><CalendarClock size={14} /> Next Follow-up</span>
                            <span className="font-medium text-[#0D1B3E]">{lead.next_followup || 'Not set'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity log */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-[#E1E8F0] p-5">
                    <h3 className="font-semibold text-[#0D1B3E] mb-5">Activity Log</h3>

                    {/* Add activity */}
                    <form onSubmit={submitActivity} className="bg-[#F7F9FC] rounded-xl p-4 mb-6">
                        <div className="flex gap-2 mb-3">
                            {(['Call', 'WhatsApp', 'Note'] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => { setActivityType(t); setData('type', t); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${activityType === t ? 'bg-[#0D1B3E] text-white' : 'bg-white border border-[#E1E8F0] text-gray-600'}`}
                                >
                                    {t === 'Call' && <PhoneCall size={12} />}
                                    {t === 'WhatsApp' && <MessageSquare size={12} />}
                                    {t === 'Note' && <StickyNote size={12} />}
                                    {t}
                                </button>
                            ))}
                        </div>
                        <input
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder={`Log a ${activityType.toLowerCase()}...`}
                            required
                            className="w-full px-3.5 py-2.5 border border-[#E1E8F0] bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 mb-2"
                        />
                        <div className="flex gap-2">
                            <input
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Add notes (optional)"
                                className="flex-1 px-3.5 py-2.5 border border-[#E1E8F0] bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                            />
                            <button type="submit" disabled={processing} className="px-4 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold disabled:opacity-60 flex items-center gap-1.5">
                                <Plus size={14} /> Log
                            </button>
                        </div>
                    </form>

                    <ActivityTimeline activities={activities} />
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                    <h3 className="font-semibold text-[#0D1B3E] mb-4">Recommended Properties</h3>
                    <div className="space-y-3">
                        {recommendations.map((p) => (
                            <Link key={p.id} href={`/admin/properties/${p.id}`} className="flex items-center gap-3 bg-[#F7F9FC] rounded-lg p-2.5 hover:bg-[#EFF3F9] transition-colors">
                                <img src={p.image} alt="" className="w-14 h-12 rounded-lg object-cover" />
                                <div className="min-w-0">
                                    <div className="font-medium text-[#0D1B3E] text-sm truncate">{p.title}</div>
                                    <div className="text-gray-400 text-xs">{p.price_label}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="mt-5 pt-4 border-t border-[#F0F4F8] space-y-3">
                        <div>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Assigned Agent</h4>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium text-[#0D1B3E]">{lead.assigned_agent?.name || 'Unassigned'}</span>
                                <button onClick={() => setHandoverOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#0D1B3E] text-[#0D1B3E] rounded-lg text-xs font-semibold hover:bg-[#0D1B3E]/5">
                                    <ArrowRightLeft size={13} /> Handover
                                </button>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Owner</h4>
                            <div className="text-sm font-medium text-[#0D1B3E]">{lead.owner?.name || (lead.assigned_agent?.name || 'Unassigned')}</div>
                        </div>

                        {handovers.length > 0 && (
                            <div>
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Handover History</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {handovers.map((h) => (
                                        <div key={h.id} className="bg-[#F7F9FC] rounded-lg p-2.5 text-xs">
                                            <div className="font-medium text-[#0D1B3E]">{h.from_name} → {h.to_name}</div>
                                            {h.reason && <div className="text-gray-500 mt-0.5">{h.reason}</div>}
                                            <div className="text-gray-400 mt-0.5">{h.created_at}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setEditOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-[#E1E8F0] flex items-center justify-between">
                            <h3 className="text-lg font-bold text-[#0D1B3E]">Edit Lead</h3>
                            <button onClick={() => setEditOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-[#F8FAFD]">✕</button>
                        </div>
                        <form onSubmit={submitEdit} className="px-6 py-5 space-y-3.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                                    <input value={editData.name} onChange={(e) => setEditData('name', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                                    <input value={editData.phone} onChange={(e) => setEditData('phone', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                                    <input value={editData.email} onChange={(e) => setEditData('email', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Budget</label>
                                    <input value={editData.budget} onChange={(e) => setEditData('budget', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Preferred Location</label>
                                    <input value={editData.preferred_location} onChange={(e) => setEditData('preferred_location', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Campaign</label>
                                    <select value={editData.campaign_id} onChange={(e) => setEditData('campaign_id', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30">
                                        <option value="">No campaign</option>
                                        {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Owner</label>
                                    <select value={editData.owner_id} onChange={(e) => setEditData('owner_id', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30">
                                        <option value="">Unassigned</option>
                                        {owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Assigned Agent</label>
                                    <select value={editData.assigned_agent_id} onChange={(e) => setEditData('assigned_agent_id', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30">
                                        <option value="">Unassigned</option>
                                        {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Next Follow-up</label>
                                    <input type="date" value={editData.next_followup} onChange={(e) => setEditData('next_followup', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                                <button type="submit" disabled={editProcessing} className="px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                                    {editProcessing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Convert to Deal Modal */}
            <Modal open={convertOpen} onClose={() => setConvertOpen(false)} title="Convert Lead to Deal">
                <form onSubmit={submitConvert} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Deal Value *</label>
                        <div className="relative">
                            <IndianRupee size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                placeholder="e.g. 15000000"
                                value={convertData.deal_value}
                                onChange={(e) => setConvertData('deal_value', e.target.value)}
                                className="w-full pl-9 pr-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                            />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">Enter amount in INR (numbers only).</p>
                    </div>
                    <p className="text-xs text-gray-500 bg-gray-50 border border-[#E1E8F0] rounded-lg p-3">
                        This will mark the lead as <span className="font-semibold text-emerald-600">Converted</span> and create a deal in the sales pipeline.
                        {lead.interested_property ? ` Linked property: ${lead.interested_property.title}` : ''}
                    </p>
                    <div className="flex justify-end gap-2 pt-1">
                        <button type="button" onClick={() => setConvertOpen(false)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                        <button type="submit" disabled={convertProcessing} className="inline-flex items-center gap-2 px-5 py-2 bg-gold-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                            {convertProcessing ? 'Converting...' : <><ArrowRightLeft size={15} /> Convert</>}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Handover Modal */}
            <Modal open={handoverOpen} onClose={() => setHandoverOpen(false)} title="Handover Lead">
                <form onSubmit={submitHandover} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Assign To *</label>
                        <select
                            required
                            value={handoverForm.data.assigned_agent_id}
                            onChange={(e) => handoverForm.setData('assigned_agent_id', e.target.value)}
                            className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                        >
                            <option value="">Select agent...</option>
                            {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        {handoverForm.errors.assigned_agent_id && <p className="text-red-500 text-xs mt-1">{handoverForm.errors.assigned_agent_id}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
                        <select value={handoverForm.data.reason} onChange={(e) => handoverForm.setData('reason', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                            <option value="">Select reason...</option>
                            <option>Workload distribution</option>
                            <option>Specialist required</option>
                            <option>Out of office</option>
                            <option>Regional availability</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                        <textarea value={handoverForm.data.notes} onChange={(e) => handoverForm.setData('notes', e.target.value)} rows={3} placeholder="Context for the new owner (optional)" className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                        <button type="button" onClick={() => setHandoverOpen(false)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                        <button type="submit" disabled={handoverForm.processing} className="inline-flex items-center gap-2 px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                            {handoverForm.processing ? 'Assigning...' : <><ArrowRightLeft size={15} /> Assign</>}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}

function formatDate(d: string) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
