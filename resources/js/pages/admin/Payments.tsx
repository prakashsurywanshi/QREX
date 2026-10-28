import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import Modal from '@/components/ui/Modal';
import AmountInWords from '@/components/shared/AmountInWords';
import { Plus, CreditCard, IndianRupee, Wallet, AlertCircle, Pencil } from 'lucide-react';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    payments: any[];
    widgets: { receivable: number; received: number; pending: number; overdue: number };
}

const statusColor: Record<string, string> = {
    Paid: 'bg-emerald-100 text-emerald-700',
    Pending: 'bg-amber-100 text-amber-700',
    Overdue: 'bg-red-100 text-red-600',
    'Partially Paid': 'bg-blue-100 text-blue-700',
    Cancelled: 'bg-gray-100 text-gray-600',
};

function fmtCr(n: number) {
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
    if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + ' L';
    return '₹' + Number(n).toLocaleString('en-IN');
}

export default function Payments(props: Props) {
    const { payments, widgets } = props;
    const [showAdd, setShowAdd] = useState(false);
    const [editing, setEditing] = useState<any>(null);

    const { data, setData, post, processing, errors } = useForm({
        customer_name: '',
        property_name: '',
        amount: '',
        mode: 'RTGS',
        due_date: '',
        status: 'Pending',
    });

    const editForm = useForm({
        status: 'Pending',
        mode: 'RTGS',
        txn_id: '',
        paid_date: '',
        due_date: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/payments', { onSuccess: () => setShowAdd(false) });
    };

    const openEdit = (p: any) => {
        setEditing(p);
        editForm.setData({
            status: p.status || 'Pending',
            mode: p.mode || 'RTGS',
            txn_id: p.txn_id === '—' ? '' : (p.txn_id || ''),
            paid_date: p.paid_date || '',
            due_date: p.due_date || '',
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        editForm.put(`/admin/payments/${editing.id}`, { onSuccess: () => setEditing(null) });
    };

    const updateStatus = (p: any, status: string) => {
        router.put(`/admin/payments/${p.id}`, { status }, { preserveScroll: true });
    };

    const fmtDate = (d: string) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <AdminLayout>
            <PageHeader
                title="Payments"
                subtitle="Track collections and receivables"
                breadcrumbs={[{ label: 'Finance' }, { label: 'Payments' }]}
                actions={
                    <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50] transition-colors">
                        <Plus size={16} /> Record Payment
                    </button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard icon={CreditCard} label="Total Receivable" value={fmtCr(widgets.receivable)} color="navy" />
                <StatCard icon={Wallet} label="Collected" value={fmtCr(widgets.received)} color="emerald" />
                <StatCard icon={IndianRupee} label="Pending" value={fmtCr(widgets.pending)} color="gold" />
                <StatCard icon={AlertCircle} label="Overdue" value={fmtCr(widgets.overdue)} color="red" />
            </div>

            <div className="bg-white rounded-xl border border-[#E1E8F0] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#F7F9FC] text-left text-xs uppercase tracking-wider text-gray-400">
                                <th className="px-5 py-3 font-semibold">Payment ID</th>
                                <th className="px-4 py-3 font-semibold">Customer</th>
                                <th className="px-4 py-3 font-semibold">Property</th>
                                <th className="px-4 py-3 font-semibold">Amount</th>
                                <th className="px-4 py-3 font-semibold">Mode</th>
                                <th className="px-4 py-3 font-semibold">Due Date</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F4F8]">
                            {payments.map((p) => (
                                <tr key={p.id} className="hover:bg-[#FAFBFD] transition-colors">
                                    <td className="px-5 py-3 font-medium text-[#0D1B3E]">{p.payment_id}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-[#0D1B3E]">{p.customer_name}</div>
                                        {p.txn_id && p.txn_id !== '—' && <div className="text-gray-400 text-xs">Txn: {p.txn_id}</div>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{p.property_name}</td>
                                    <td className="px-4 py-3 font-semibold text-[#0D1B3E]">{p.amount_label}</td>
                                    <td className="px-4 py-3 text-gray-600">{p.mode || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600">{fmtDate(p.due_date)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`status-badge ${statusColor[p.status] || 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                                            <select value={p.status} onChange={(e) => updateStatus(p, e.target.value)} className="text-xs border border-[#E1E8F0] rounded-md px-1.5 py-1 focus:outline-none bg-white text-gray-600">
                                                {['Paid', 'Pending', 'Overdue', 'Partially Paid', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-[#0D1B3E] hover:bg-[#F7F9FC] rounded-lg" title="Edit payment">
                                            <Pencil size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {payments.length === 0 && (
                    <div className="text-center py-16">
                        <IndianRupee size={40} className="mx-auto text-gray-300 mb-3" />
                        <h3 className="font-semibold text-[#0D1B3E]">No payments recorded</h3>
                        <p className="text-gray-400 text-sm mt-1">Record your first payment.</p>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Record Payment">
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
                            <label className="block text-xs font-medium text-gray-600 mb-1">Amount (₹) *</label>
                            <input type="number" value={data.amount} onChange={(e) => setData('amount', e.target.value)} required className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                            <AmountInWords value={data.amount} />
                            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Mode</label>
                            <select value={data.mode} onChange={(e) => setData('mode', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                {['RTGS', 'NEFT', 'IMPS', 'UPI', 'Cheque', 'Bank Transfer', 'Cash'].map((m) => <option key={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                            <input type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                            <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                {['Pending', 'Partially Paid', 'Paid', 'Overdue'].map((s) => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                        <button type="submit" disabled={processing} className="px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                            {processing ? 'Saving...' : 'Record Payment'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal open={!!editing} onClose={() => setEditing(null)} title="Update Payment" subtitle={editing ? `${editing.payment_id} · ${editing.amount_label}` : ''}>
                <form onSubmit={submitEdit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                            <select value={editForm.data.status} onChange={(e) => editForm.setData('status', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                {['Paid', 'Pending', 'Overdue', 'Partially Paid', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Mode</label>
                            <select value={editForm.data.mode} onChange={(e) => editForm.setData('mode', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                {['RTGS', 'NEFT', 'IMPS', 'UPI', 'Cheque', 'Bank Transfer', 'Cash'].map((m) => <option key={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Transaction ID</label>
                            <input value={editForm.data.txn_id} onChange={(e) => editForm.setData('txn_id', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Paid Date</label>
                            <input type="date" value={editForm.data.paid_date} onChange={(e) => editForm.setData('paid_date', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                            <input type="date" value={editForm.data.due_date} onChange={(e) => editForm.setData('due_date', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                        <button type="submit" disabled={editForm.processing} className="px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                            {editForm.processing ? 'Saving...' : 'Update Payment'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
