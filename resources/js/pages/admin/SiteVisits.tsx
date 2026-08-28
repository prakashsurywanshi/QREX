import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import Modal from '@/components/ui/Modal';
import { Plus, MapPin, Clock, User, CalendarCheck } from 'lucide-react';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    siteVisits: any[];
}

const statusColor: Record<string, string> = {
    Scheduled: 'bg-blue-100 text-blue-700',
    Confirmed: 'bg-emerald-100 text-emerald-700',
    Completed: 'bg-gold-100 text-gold-700',
    Rescheduled: 'bg-amber-100 text-amber-700',
    Cancelled: 'bg-red-100 text-red-600',
};

const statuses = ['Scheduled', 'Confirmed', 'Completed', 'Rescheduled', 'Cancelled'];

export default function SiteVisits(props: Props) {
    const { siteVisits } = props;
    const [showAdd, setShowAdd] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        customer_name: '',
        property_name: '',
        agent_name: '',
        visit_date: '',
        visit_time: '',
        location: '',
        notes: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/site-visits', { onSuccess: () => setShowAdd(false) });
    };

    const updateStatus = (id: number, status: string) => {
        router.put(`/admin/site-visits/${id}`, { status }, { preserveScroll: true });
    };

    const fmtDate = (d: string) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <AdminLayout>
            <PageHeader
                title="Site Visits"
                subtitle="Schedule and manage property site visits"
                breadcrumbs={[{ label: 'Sales' }, { label: 'Site Visits' }]}
                actions={
                    <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50] transition-colors">
                        <Plus size={16} /> Schedule Visit
                    </button>
                }
            />

            <div className="bg-white rounded-xl border border-[#E1E8F0] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#F7F9FC] text-left text-xs uppercase tracking-wider text-gray-400">
                                <th className="px-5 py-3 font-semibold">Visit ID</th>
                                <th className="px-4 py-3 font-semibold">Customer</th>
                                <th className="px-4 py-3 font-semibold">Property</th>
                                <th className="px-4 py-3 font-semibold">Date & Time</th>
                                <th className="px-4 py-3 font-semibold">Location</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F4F8]">
                            {siteVisits.map((v) => (
                                <tr key={v.id} className="hover:bg-[#FAFBFD] transition-colors">
                                    <td className="px-5 py-3 font-medium text-[#0D1B3E]">{v.visit_id}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-[#0D1B3E]">{v.customer_name}</div>
                                        <div className="text-gray-400 text-xs flex items-center gap-1"><User size={10} /> {v.agent_name}</div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{v.property_name}</td>
                                    <td className="px-4 py-3">
                                        <div className="text-gray-600 flex items-center gap-1.5"><CalendarCheck size={13} /> {fmtDate(v.visit_date)}</div>
                                        <div className="text-gray-400 text-xs flex items-center gap-1.5 mt-0.5"><Clock size={10} /> {v.visit_time}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-gray-600 flex items-center gap-1.5"><MapPin size={13} /> {v.location || '—'}</div>
                                        {v.notes && <div className="text-gray-400 text-xs mt-0.5 max-w-[180px] truncate">{v.notes}</div>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={v.status}
                                            onChange={(e) => updateStatus(v.id, e.target.value)}
                                            className={`status-badge ${statusColor[v.status] || 'bg-gray-100 text-gray-600'} cursor-pointer`}
                                        >
                                            {statuses.map((s) => <option key={s} value={s} className="bg-white text-gray-700">{s}</option>)}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {siteVisits.length === 0 && (
                    <div className="text-center py-16">
                        <MapPin size={40} className="mx-auto text-gray-300 mb-3" />
                        <h3 className="font-semibold text-[#0D1B3E]">No site visits scheduled</h3>
                        <p className="text-gray-400 text-sm mt-1">Schedule your first site visit.</p>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Schedule Site Visit">
                <form onSubmit={submit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name *</label>
                            <input value={data.customer_name} onChange={(e) => setData('customer_name', e.target.value)} required className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                            {errors.customer_name && <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Property Name *</label>
                            <input value={data.property_name} onChange={(e) => setData('property_name', e.target.value)} required className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Agent Name *</label>
                            <input value={data.agent_name} onChange={(e) => setData('agent_name', e.target.value)} required className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
                            <input type="date" value={data.visit_date} onChange={(e) => setData('visit_date', e.target.value)} required className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Time *</label>
                            <input value={data.visit_time} onChange={(e) => setData('visit_time', e.target.value)} required className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" placeholder="11:00 AM" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                            <input value={data.location} onChange={(e) => setData('location', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                            <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={2} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                        <button type="submit" disabled={processing} className="px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                            {processing ? 'Scheduling...' : 'Schedule Visit'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
