import { useState } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import Modal from '@/components/ui/Modal';
import AmountInWords from '@/components/shared/AmountInWords';
import { ChevronLeft, FileText, KeyRound, ShoppingCart, Wallet, CheckCircle2, Clock, Plus } from 'lucide-react';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    booking: any;
    payments: any[];
}

const statusColor: Record<string, string> = {
    'Booking Pending': 'bg-amber-100 text-amber-700',
    'Booking Confirmed': 'bg-blue-100 text-blue-700',
    'Under Agreement': 'bg-purple-100 text-purple-700',
    'Agreement Signed': 'bg-emerald-100 text-emerald-700',
    Cancelled: 'bg-red-100 text-red-600',
};

const paymentStatusColor: Record<string, string> = {
    Paid: 'bg-emerald-100 text-emerald-700',
    Pending: 'bg-amber-100 text-amber-700',
    Overdue: 'bg-red-100 text-red-600',
    'Partially Paid': 'bg-blue-100 text-blue-700',
};

export default function BookingDetail(props: Props) {
    const { booking, payments } = props;
    const [showPayment, setShowPayment] = useState(false);

    const payForm = useForm({ payment_amount: '', payment_mode: 'Bank Transfer', record_payment: true });

    const recordPayment = (e: React.FormEvent) => {
        e.preventDefault();
        payForm.put(`/admin/bookings/${booking.id}`, {
            preserveScroll: true,
            onSuccess: () => { setShowPayment(false); payForm.reset(); },
        });
    };

    const updateField = (key: string, value: string) => {
        router.put(`/admin/bookings/${booking.id}`, { [key]: value }, { preserveScroll: true });
    };

    const bookingStatuses = ['Booking Pending', 'Booking Confirmed', 'Under Agreement', 'Agreement Signed', 'Cancelled'];
    const agreementStatuses = ['Pending', 'Under Review', 'Signed'];
    const possessionStatuses = ['Pending', 'In Process', 'Handed Over'];

    const fmtDate = (d: string) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const steps = [
        { label: 'Booking', status: booking.booking_id ? 'confirmed' : 'pending', icon: ShoppingCart, date: fmtDate(booking.booking_date) },
        { label: 'Agreement', status: booking.agreement_status?.toLowerCase() === 'signed' ? 'done' : 'active', icon: FileText, date: booking.booking_date ? fmtDate(booking.booking_date) : '—' },
        { label: 'Possession', status: booking.possession_status === 'Handed Over' ? 'done' : 'pending', icon: KeyRound, date: '—' },
    ];

    return (
        <AdminLayout>
            <PageHeader
                title={booking.booking_id}
                subtitle={`Booking for ${booking.property_name}`}
                actions={
                    <Link href="/admin/bookings" className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600 hover:bg-[#F7F9FC]">
                        <ChevronLeft size={16} /> Back
                    </Link>
                }
            />

            {/* Booking Summary */}
            <div className="bg-white rounded-xl border border-[#E1E8F0] p-6 mb-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-[#0D1B3E]">{booking.customer_name}</h2>
                        <span className={`status-badge ${statusColor[booking.status] || 'bg-gray-100 text-gray-600'}`}>{booking.status}</span>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-gold-600">{booking.deal_label}</div>
                        <div className="text-gray-400 text-xs">Total Deal Value</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Customer', value: booking.customer_name },
                        { label: 'Property', value: booking.property_name },
                        { label: 'Agent', value: booking.agent_name },
                        { label: 'Booking Date', value: fmtDate(booking.booking_date) },
                    ].map((f, i) => (
                        <div key={i} className="bg-[#F7F9FC] rounded-xl p-4">
                            <div className="text-xs text-gray-400 mb-1">{f.label}</div>
                            <div className="font-medium text-[#0D1B3E] text-sm">{f.value}</div>
                        </div>
                    ))}
                </div>

                {/* Progress steps */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {steps.map((s) => {
                        const Icon = s.icon;
                        const done = s.status === 'done';
                        const active = s.status === 'active';
                        return (
                            <div key={s.label} className={`rounded-xl border p-4 flex items-center gap-3 ${done ? 'border-emerald-200 bg-emerald-50' : active ? 'border-gold-200 bg-gold-50/60' : 'border-[#E1E8F0] bg-[#F7F9FC]'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-500 text-white' : active ? 'bg-gold-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                    {done ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                                </div>
                                <div>
                                    <div className="font-semibold text-[#0D1B3E] text-sm">{s.label}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{done ? 'Completed' : active ? 'In Progress' : 'Pending'} · {s.date}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Status management */}
            <div className="bg-white rounded-xl border border-[#E1E8F0] px-5 py-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Booking Status</label>
                        <select value={booking.status} onChange={(e) => updateField('status', e.target.value)} className="w-full px-3 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none bg-white">
                            {bookingStatuses.map((s) => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Agreement Status</label>
                        <select value={booking.agreement_status || 'Pending'} onChange={(e) => updateField('agreement_status', e.target.value)} className="w-full px-3 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none bg-white">
                            {agreementStatuses.map((s) => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Possession Status</label>
                        <select value={booking.possession_status || 'Pending'} onChange={(e) => updateField('possession_status', e.target.value)} className="w-full px-3 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none bg-white">
                            {possessionStatuses.map((s) => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Payments */}
            <div className="bg-white rounded-xl border border-[#E1E8F0]">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F4F8]">
                    <h3 className="font-semibold text-[#0D1B3E] flex items-center gap-2"><Wallet size={16} /> Payment Schedule ({payments.length})</h3>
                    <div className="flex items-center gap-3">
                        <Link href="/admin/payments" className="text-gold-600 text-xs font-semibold">View Payments</Link>
                        <button onClick={() => setShowPayment(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0D1B3E] text-white rounded-lg text-xs font-semibold hover:bg-[#1A2B50]">
                            <Plus size={13} /> Record Payment
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-[#F0F4F8]">
                                <th className="px-5 py-3 font-semibold">Payment ID</th>
                                <th className="px-4 py-3 font-semibold">Amount</th>
                                <th className="px-4 py-3 font-semibold">Mode</th>
                                <th className="px-4 py-3 font-semibold">Due Date</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F4F8]">
                            {payments.map((p) => (
                                <tr key={p.id} className="hover:bg-[#FAFBFD]">
                                    <td className="px-5 py-3 font-medium text-[#0D1B3E]">{p.payment_id}</td>
                                    <td className="px-4 py-3 font-semibold text-[#0D1B3E]">{p.amount_label}</td>
                                    <td className="px-4 py-3 text-gray-600">{p.mode || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600">{fmtDate(p.due_date)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`status-badge ${paymentStatusColor[p.status] || 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && (
                                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">No payments recorded</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal open={showPayment} onClose={() => setShowPayment(false)} title="Record Payment" subtitle={`Payment for ${booking.booking_id}`}>
                <form onSubmit={recordPayment} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Amount (₹) *</label>
                            <input type="number" value={payForm.data.payment_amount} onChange={(e) => payForm.setData('payment_amount', e.target.value)} required className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                            <AmountInWords value={payForm.data.payment_amount} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Mode</label>
                            <select value={payForm.data.payment_mode} onChange={(e) => payForm.setData('payment_mode', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                {['Bank Transfer', 'RTGS', 'NEFT', 'IMPS', 'UPI', 'Cheque', 'Cash'].map((m) => <option key={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowPayment(false)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                        <button type="submit" disabled={payForm.processing} className="px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                            {payForm.processing ? 'Saving...' : 'Record Payment'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
