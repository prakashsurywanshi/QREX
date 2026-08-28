import { useState } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import Modal from '@/components/ui/Modal';
import { Plus, CalendarCheck, ShoppingCart, FileText, KeyRound } from 'lucide-react';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    bookings: any[];
}

const statusColor: Record<string, string> = {
    'Booking Pending': 'bg-amber-100 text-amber-700',
    'Booking Confirmed': 'bg-blue-100 text-blue-700',
    'Under Agreement': 'bg-purple-100 text-purple-700',
    'Agreement Signed': 'bg-emerald-100 text-emerald-700',
    Cancelled: 'bg-red-100 text-red-600',
};

export default function Bookings(props: Props) {
    const { bookings } = props;
    const [showAdd, setShowAdd] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        customer_name: '',
        property_name: '',
        agent_name: '',
        booking_date: '',
        deal_value: '',
        booking_amount: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/bookings', { onSuccess: () => setShowAdd(false) });
    };

    const fmtDate = (d: string) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const updateStatus = (b: any, status: string) => {
        router.put(`/admin/bookings/${b.id}`, { status }, { preserveScroll: true });
    };

    const bookingStatuses = ['Booking Pending', 'Booking Confirmed', 'Under Agreement', 'Agreement Signed', 'Cancelled'];

    return (
        <AdminLayout>
            <PageHeader
                title="Bookings"
                subtitle="Track all property bookings and agreements"
                breadcrumbs={[{ label: 'Sales' }, { label: 'Bookings' }]}
                actions={
                    <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50] transition-colors">
                        <Plus size={16} /> New Booking
                    </button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="kpi-card">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-lg bg-[#0D1B3E] text-gold-300 flex items-center justify-center"><ShoppingCart size={18} /></div>
                        <span className="text-xs font-semibold text-emerald-600">↑</span>
                    </div>
                    <div className="text-xl font-bold text-[#0D1B3E]">{bookings.length}</div>
                    <div className="text-xs text-gray-400">Total Bookings</div>
                </div>
                <div className="kpi-card">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center"><FileText size={18} /></div>
                    </div>
                    <div className="text-xl font-bold text-[#0D1B3E]">{bookings.filter((b) => b.agreement_status === 'Signed').length}</div>
                    <div className="text-xs text-gray-400">Agreements Signed</div>
                </div>
                <div className="kpi-card">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-lg bg-gold-500 text-white flex items-center justify-center"><KeyRound size={18} /></div>
                    </div>
                    <div className="text-xl font-bold text-[#0D1B3E]">{bookings.filter((b) => b.possession_status === 'Handed Over').length}</div>
                    <div className="text-xs text-gray-400">Possession Handed Over</div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E1E8F0] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#F7F9FC] text-left text-xs uppercase tracking-wider text-gray-400">
                                <th className="px-5 py-3 font-semibold">Booking ID</th>
                                <th className="px-4 py-3 font-semibold">Customer</th>
                                <th className="px-4 py-3 font-semibold">Property</th>
                                <th className="px-4 py-3 font-semibold">Date</th>
                                <th className="px-4 py-3 font-semibold">Deal Value</th>
                                <th className="px-4 py-3 font-semibold">Booking Amount</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F4F8]">
                            {bookings.map((b) => (
                                <tr key={b.id} className="hover:bg-[#FAFBFD] transition-colors">
                                    <td className="px-5 py-3 font-medium text-[#0D1B3E]">{b.booking_id}</td>
                                    <td className="px-4 py-3">
                                        <Link href={`/admin/bookings/${b.id}`} className="font-medium text-[#0D1B3E] hover:text-gold-600">{b.customer_name}</Link>
                                        <div className="text-gray-400 text-xs">{b.agent_name}</div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{b.property_name}</td>
                                    <td className="px-4 py-3 text-gray-600">{fmtDate(b.booking_date)}</td>
                                    <td className="px-4 py-3 font-semibold text-[#0D1B3E]">{b.deal_label}</td>
                                    <td className="px-4 py-3 text-gray-600">{b.booking_amount_label}</td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={b.status}
                                            onChange={(e) => updateStatus(b, e.target.value)}
                                            className={`status-badge ${statusColor[b.status] || 'bg-gray-100 text-gray-600'} cursor-pointer`}
                                        >
                                            {bookingStatuses.map((s) => <option key={s} value={s} className="bg-white text-gray-700">{s}</option>)}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {bookings.length === 0 && (
                    <div className="text-center py-16">
                        <CalendarCheck size={40} className="mx-auto text-gray-300 mb-3" />
                        <h3 className="font-semibold text-[#0D1B3E]">No bookings yet</h3>
                        <p className="text-gray-400 text-sm mt-1">Create your first booking.</p>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Create New Booking">
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
                            <label className="block text-xs font-medium text-gray-600 mb-1">Booking Date *</label>
                            <input type="date" value={data.booking_date} onChange={(e) => setData('booking_date', e.target.value)} required className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Deal Value (₹) *</label>
                            <input type="number" value={data.deal_value} onChange={(e) => setData('deal_value', e.target.value)} required className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                            {errors.deal_value && <p className="text-red-500 text-xs mt-1">{errors.deal_value}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Booking Amount (₹) *</label>
                            <input type="number" value={data.booking_amount} onChange={(e) => setData('booking_amount', e.target.value)} required className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                            {errors.booking_amount && <p className="text-red-500 text-xs mt-1">{errors.booking_amount}</p>}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                        <button type="submit" disabled={processing} className="px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                            {processing ? 'Creating...' : 'Create Booking'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
