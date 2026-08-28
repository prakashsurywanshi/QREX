import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import Pagination from '@/components/ui/Pagination';
import { Search, Plus, MapPin, Star, Eye, Pencil, Trash2, Building2 } from 'lucide-react';
import type { Property, PageProps } from '@/types';

interface Props extends PageProps {
    properties: { data: Property[]; current_page: number; last_page: number; total: number; per_page: number };
    filters: { search?: string; status?: string; type?: string; featured?: string };
    types: string[];
    statuses: string[];
}

const statusColor: Record<string, string> = {
    Available: 'bg-emerald-100 text-emerald-700',
    Reserved: 'bg-amber-100 text-amber-700',
    'Under Negotiation': 'bg-purple-100 text-purple-700',
    Sold: 'bg-blue-100 text-blue-700',
    Draft: 'bg-gray-100 text-gray-600',
    Rented: 'bg-gold-100 text-gold-700',
    Inactive: 'bg-red-100 text-red-600',
};

export default function Properties(props: Props) {
    const { properties, filters, types, statuses } = props;
    const [draft, setDraft] = useState({
        search: filters.search || '',
        status: filters.status || 'All',
        type: filters.type || 'All',
        featured: filters.featured || 'All',
    });

    const applyFilters = () => {
        const params: Record<string, string> = {};
        if (draft.search) params.search = draft.search;
        if (draft.status !== 'All') params.status = draft.status;
        if (draft.type !== 'All') params.type = draft.type;
        if (draft.featured !== 'All') params.featured = draft.featured;
        router.get('/admin/properties', params, { preserveState: true });
    };

    const destroy = (p: Property) => {
        if (confirm(`Delete "${p.title}"? This cannot be undone.`)) {
            router.delete(`/admin/properties/${p.id}`);
        }
    };

    return (
        <AdminLayout>
            <PageHeader
                title="Properties"
                subtitle="Manage your complete property portfolio"
                breadcrumbs={[{ label: 'Sales' }, { label: 'Properties' }]}
                actions={
                    <Link href="/admin/properties/create" className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50] transition-colors">
                        <Plus size={16} /> Add Property
                    </Link>
                }
            />

            {/* Filters */}
            <div className="bg-white rounded-xl border border-[#E1E8F0] p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={draft.search}
                        onChange={(e) => setDraft({ ...draft, search: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                        placeholder="Search title, city, ID"
                        className="w-full pl-9 pr-3 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                    />
                </div>
                <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} className="px-3 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                    {types.map((t) => <option key={t}>{t}</option>)}
                </select>
                <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="px-3 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                    {statuses.map((s) => <option key={s}>{s}</option>)}
                </select>
                <div className="flex gap-2">
                    <select value={draft.featured} onChange={(e) => setDraft({ ...draft, featured: e.target.value })} className="flex-1 px-3 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                        <option>All</option>
                        <option>Featured</option>
                        <option>Not Featured</option>
                    </select>
                    <button onClick={applyFilters} className="px-4 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50]">Apply</button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-[#E1E8F0] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#F7F9FC] text-left text-xs uppercase tracking-wider text-gray-400">
                                <th className="px-5 py-3 font-semibold">Property</th>
                                <th className="px-4 py-3 font-semibold">Type</th>
                                <th className="px-4 py-3 font-semibold">Price</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold">Agent</th>
                                <th className="px-4 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F4F8]">
                            {properties.data.map((p) => (
                                <tr key={p.id} className="hover:bg-[#FAFBFD] transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <img src={p.image} alt={p.title} className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                                            <div className="min-w-0">
                                                <Link href={`/admin/properties/${p.id}`} className="font-medium text-[#0D1B3E] hover:text-gold-600 truncate block max-w-[200px]">
                                                    {p.title}
                                                </Link>
                                                <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                                                    <MapPin size={11} /> {p.location}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-gray-600">{p.type}</span>
                                        <div className="text-gray-400 text-xs">{p.bedrooms > 0 ? `${p.bedrooms} BHK` : '—'} · {p.area} sqft</div>
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-[#0D1B3E] whitespace-nowrap">
                                        {p.price_label}
                                        {p.featured && (
                                            <span className="flex items-center gap-1 text-gold-500 text-[10px] mt-0.5"><Star size={10} fill="currentColor" /> Featured</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`status-badge ${statusColor[p.status] || 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{p.agent_name || p.agent?.name || '—'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link href={`/admin/properties/${p.id}`} className="p-2 text-gray-400 hover:text-[#0D1B3E] hover:bg-[#F0F4F8] rounded-lg" title="View">
                                                <Eye size={15} />
                                            </Link>
                                            <Link href={`/admin/properties/${p.id}/edit`} className="p-2 text-gray-400 hover:text-gold-600 hover:bg-[#F0F4F8] rounded-lg" title="Edit">
                                                <Pencil size={15} />
                                            </Link>
                                            <button onClick={() => destroy(p)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-[#F0F4F8] rounded-lg" title="Delete">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {properties.data.length === 0 && (
                    <div className="text-center py-16">
                        <Building2 size={40} className="mx-auto text-gray-300 mb-3" />
                        <h3 className="font-semibold text-[#0D1B3E]">No properties found</h3>
                        <p className="text-gray-400 text-sm mt-1">Try adjusting your filters.</p>
                    </div>
                )}

                {properties.last_page > 1 && (
                    <div className="border-t border-[#F0F4F8]">
                        <Pagination
                            currentPage={properties.current_page}
                            lastPage={properties.last_page}
                            total={properties.total}
                            perPage={properties.per_page}
                            onPageChange={(page) => router.get('/admin/properties', { ...(filters as any), page }, { preserveState: true })}
                        />
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
