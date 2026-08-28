import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import { ChevronLeft, Phone, Mail, MapPin, Pencil, Building2, Wallet, Star } from 'lucide-react';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    customer: any;
}

const statusColor: Record<string, string> = {
    Prospect: 'bg-blue-100 text-blue-700',
    Active: 'bg-emerald-100 text-emerald-700',
    Buyer: 'bg-gold-100 text-gold-700',
    Investor: 'bg-purple-100 text-purple-700',
    'Past Customer': 'bg-gray-100 text-gray-600',
};

export default function CustomerDetail(props: Props) {
    const { customer } = props;
    const [editOpen, setEditOpen] = useState(false);
    const { data, setData, put, processing } = useForm({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        type: customer.type || '',
        status: customer.status,
        city: customer.city || '',
        requirements: customer.requirements || '',
        agent_id: customer.agent_id || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/customers/${customer.id}`, { onSuccess: () => setEditOpen(false) });
    };

    const properties = customer.properties || [];

    return (
        <AdminLayout>
            <PageHeader
                title={customer.name}
                subtitle={`${customer.customer_id} · Customer since ${formatDate(customer.created_at)}`}
                breadcrumbs={[{ label: 'Sales' }, { label: 'Customers', href: '/admin/customers' }, { label: customer.customer_id }]}
                actions={
                    <>
                        <Link href="/admin/customers" className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600 hover:bg-[#F7F9FC]">
                            <ChevronLeft size={16} /> Back
                        </Link>
                        <button onClick={() => setEditOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50]">
                            <Pencil size={14} /> Edit
                        </button>
                    </>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0D1B3E] to-gold-500 flex items-center justify-center text-white font-bold text-xl">
                                {customer.name?.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-[#0D1B3E]">{customer.name}</h2>
                                    <span className={`status-badge ${statusColor[customer.status] || 'bg-gray-100 text-gray-600'}`}>{customer.status}</span>
                                </div>
                                <div className="text-gray-400 text-sm mt-0.5">{customer.type || '—'}</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-[#F7F9FC] rounded-lg px-3 py-2.5">
                                <Phone size={15} className="text-[#0D1B3E]" /> {customer.phone}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-[#F7F9FC] rounded-lg px-3 py-2.5 truncate">
                                <Mail size={15} className="text-[#0D1B3E]" /> {customer.email || '—'}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-[#F7F9FC] rounded-lg px-3 py-2.5">
                                <MapPin size={15} className="text-[#0D1B3E]" /> {customer.city || '—'}
                            </div>
                        </div>
                        {customer.requirements && (
                            <div className="mt-5 bg-[#F7F9FC] rounded-xl p-4">
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Requirements</div>
                                <p className="text-sm text-gray-600 leading-relaxed">{customer.requirements}</p>
                            </div>
                        )}
                    </div>

                    {/* Properties */}
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-6">
                        <h3 className="font-semibold text-[#0D1B3E] mb-4 flex items-center gap-2"><Building2 size={16} /> Properties Interested ({properties.length})</h3>
                        <div className="space-y-3">
                            {properties.map((p: string, i: number) => (
                                <div key={i} className="flex items-center gap-4 bg-[#F7F9FC] rounded-xl p-4">
                                    <div className="w-10 h-10 rounded-lg bg-gold-500/15 flex items-center justify-center flex-shrink-0">
                                        <Building2 size={18} className="text-gold-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-[#0D1B3E]">{p}</div>
                                        <div className="text-gray-400 text-xs">Interested property</div>
                                    </div>
                                    <Link href="/admin/properties" className="text-gold-600 text-xs font-semibold">View →</Link>
                                </div>
                            ))}
                            {properties.length === 0 && <div className="text-gray-400 text-sm">No properties tracked</div>}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-6">
                        <h3 className="font-semibold text-[#0D1B3E] mb-4">Customer Value</h3>
                        <div className="flex items-center gap-3 bg-[#0D1B3E] text-white rounded-xl p-5">
                            <Wallet size={28} className="text-gold-400" />
                            <div>
                                <div className="text-2xl font-bold">{customer.total_value || '—'}</div>
                                <div className="text-blue-200/70 text-xs">Total Transaction Value</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-6">
                        <h3 className="font-semibold text-[#0D1B3E] mb-4 flex items-center gap-2"><Star size={15} /> Assigned Agent</h3>
                        {customer.agent ? (
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0D1B3E] to-gold-500 flex items-center justify-center text-white font-bold">
                                    {customer.agent.initials}
                                </div>
                                <div>
                                    <div className="font-medium text-[#0D1B3E] text-sm">{customer.agent.name}</div>
                                    <div className="text-gray-400 text-xs">{customer.agent.role}</div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm">No agent assigned</p>
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
                            <h3 className="text-lg font-bold text-[#0D1B3E]">Edit Customer</h3>
                            <button onClick={() => setEditOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-[#F8FAFD]">✕</button>
                        </div>
                        <form onSubmit={submit} className="px-6 py-5 space-y-3.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                                    <input value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                                    <input value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                                    <input value={data.email} onChange={(e) => setData('email', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                                    <input value={data.city} onChange={(e) => setData('city', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                                    <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                        {['Prospect', 'Active', 'Buyer', 'Investor', 'Past Customer'].map((s) => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                                    <input value={data.type} onChange={(e) => setData('type', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Requirements</label>
                                    <textarea value={data.requirements} onChange={(e) => setData('requirements', e.target.value)} rows={3} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                                <button type="submit" disabled={processing} className="px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

function formatDate(d: string) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}
