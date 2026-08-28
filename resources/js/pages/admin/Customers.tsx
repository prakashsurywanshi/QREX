import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import { Search, Plus, Phone, Mail, Users } from 'lucide-react';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    customers: { data: any[]; current_page: number; last_page: number; total: number; per_page: number };
    filters: { search?: string; status?: string };
    statuses: string[];
}

const statusColor: Record<string, string> = {
    Prospect: 'bg-blue-100 text-blue-700',
    Active: 'bg-emerald-100 text-emerald-700',
    Buyer: 'bg-gold-100 text-gold-700',
    Investor: 'bg-purple-100 text-purple-700',
    'Past Customer': 'bg-gray-100 text-gray-600',
};

export default function Customers(props: Props) {
    const { customers, filters, statuses } = props;
    const [draft, setDraft] = useState({ search: filters.search || '', status: filters.status || 'All' });
    const [showAdd, setShowAdd] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        email: '',
        type: 'Residential Buyer',
        status: 'Prospect',
        city: '',
    });

    const applyFilters = () => {
        const params: Record<string, string> = {};
        if (draft.search) params.search = draft.search;
        if (draft.status !== 'All') params.status = draft.status;
        router.get('/admin/customers', params, { preserveState: true });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/customers', { onSuccess: () => setShowAdd(false) });
    };

    return (
        <AdminLayout>
            <PageHeader
                title="Customers"
                subtitle="Manage your customer relationships"
                breadcrumbs={[{ label: 'Sales' }, { label: 'Customers' }]}
                actions={
                    <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50] transition-colors">
                        <Plus size={16} /> Add Customer
                    </button>
                }
            />

            <div className="bg-white rounded-xl border border-[#E1E8F0] p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={draft.search}
                        onChange={(e) => setDraft({ ...draft, search: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                        placeholder="Search by name, email, phone"
                        className="w-full pl-9 pr-3 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                    />
                </div>
                <div className="flex gap-2">
                    <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="flex-1 px-3 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                        {statuses.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <button onClick={applyFilters} className="px-4 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50]">Apply</button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E1E8F0] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#F7F9FC] text-left text-xs uppercase tracking-wider text-gray-400">
                                <th className="px-5 py-3 font-semibold">Customer</th>
                                <th className="px-4 py-3 font-semibold">Type</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold">City</th>
                                <th className="px-4 py-3 font-semibold">Assigned Agent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F4F8]">
                            {customers.data.map((c) => (
                                <tr key={c.id} className="hover:bg-[#FAFBFD] transition-colors">
                                    <td className="px-5 py-3">
                                        <Link href={`/admin/customers/${c.id}`} className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-[#0D1B3E]/5 flex items-center justify-center text-xs font-bold text-[#0D1B3E] flex-shrink-0">
                                                {c.name?.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                                            </div>
                                            <div>
                                                <div className="font-medium text-[#0D1B3E] hover:text-gold-600">{c.name}</div>
                                                <div className="text-gray-400 text-xs flex items-center gap-1"><Mail size={10} /> {c.email || '—'}</div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{c.type || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`status-badge ${statusColor[c.status] || 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{c.city || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600">{c.agent?.name || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {customers.data.length === 0 && (
                    <div className="text-center py-16">
                        <Users size={40} className="mx-auto text-gray-300 mb-3" />
                        <h3 className="font-semibold text-[#0D1B3E]">No customers found</h3>
                        <p className="text-gray-400 text-sm mt-1">Try adjusting your filters.</p>
                    </div>
                )}

                {customers.last_page > 1 && (
                    <div className="border-t border-[#F0F4F8]">
                        <Pagination
                            currentPage={customers.current_page}
                            lastPage={customers.last_page}
                            total={customers.total}
                            perPage={customers.per_page}
                            onPageChange={(page) => router.get('/admin/customers', { ...(filters as any), page }, { preserveState: true })}
                        />
                    </div>
                )}
            </div>

            {/* Add Customer Modal */}
            <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Customer">
                <form onSubmit={submit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                            <input value={data.name} onChange={(e) => setData('name', e.target.value)} required className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                            <input value={data.phone} onChange={(e) => setData('phone', e.target.value)} required className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                            <select value={data.type} onChange={(e) => setData('type', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                {['Residential Buyer', 'Commercial Buyer', 'Investor', 'Renter', 'Seller'].map((t) => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                            <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                {['Prospect', 'Active', 'Buyer', 'Investor', 'Past Customer'].map((s) => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                            <input value={data.city} onChange={(e) => setData('city', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                        <button type="submit" disabled={processing} className="px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                            {processing ? 'Creating...' : 'Create Customer'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
