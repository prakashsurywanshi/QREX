import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/components/layout/PublicLayout';
import PropertyCard from '@/components/shared/PropertyCard';
import Pagination from '@/components/ui/Pagination';
import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { Property, PageProps } from '@/types';

interface Props extends PageProps {
    properties: { data: Property[]; current_page: number; last_page: number; total: number; per_page: number; from: number; to: number };
    filters: { search?: string; type?: string; status?: string; bedrooms?: number; min_price?: number; max_price?: number; sort?: string };
    types: string[];
}

export default function Properties(props: Props) {
    const { properties, filters, types } = props;
    const [showFilters, setShowFilters] = useState(false);
    const [draft, setDraft] = useState({
        search: filters.search || '',
        type: filters.type || 'All',
        status: filters.status || 'All',
        bedrooms: filters.bedrooms || 0,
        min_price: filters.min_price || '',
        max_price: filters.max_price || '',
        sort: filters.sort || 'newest',
    });

    const applyFilters = () => {
        const params: Record<string, string> = {};
        if (draft.search) params.search = draft.search;
        if (draft.type !== 'All') params.type = draft.type;
        if (draft.status !== 'All') params.status = draft.status;
        if (draft.bedrooms) params.bedrooms = String(draft.bedrooms);
        if (draft.min_price) params.min_price = String(draft.min_price);
        if (draft.max_price) params.max_price = String(draft.max_price);
        if (draft.sort !== 'newest') params.sort = draft.sort;
        router.get('/properties', params, { preserveState: true });
    };

    const statuses = ['All', 'Available', 'Reserved', 'Under Negotiation', 'Sold'];

    return (
        <PublicLayout>
            <Head title="Properties — QREX" />

            {/* Page Hero */}
            <section className="bg-[#0D1B3E] pt-16 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-gold-400 text-sm font-semibold mb-2">Property Listings</div>
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">Explore Our Properties</h1>
                    <p className="text-blue-200/70 mt-3 max-w-xl">Browse our curated selection of premium residential and commercial properties across India.</p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-8">
                    <div className="relative flex-1 max-w-md">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={draft.search}
                            onChange={(e) => setDraft({ ...draft, search: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            placeholder="Search by city, project, or keyword"
                            className="w-full pl-10 pr-4 py-2.5 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <select value={draft.sort} onChange={(e) => setDraft({ ...draft, sort: e.target.value })} className="px-3 py-2.5 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30">
                            <option value="newest">Newest First</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="featured">Featured First</option>
                        </select>
                        <button onClick={applyFilters} className="px-4 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50] transition-colors">Apply</button>
                        <button onClick={() => setShowFilters(!showFilters)} className="px-3 py-2.5 border border-[#E1E8F0] rounded-lg text-sm flex items-center gap-1.5 text-gray-600 hover:bg-[#F7F9FC]">
                            <SlidersHorizontal size={15} /> Filters
                        </button>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="bg-[#F7F9FC] rounded-2xl border border-[#E1E8F0] p-5 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1.5">Property Type</label>
                            <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30">
                                {types.map((t) => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1.5">Status</label>
                            <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30">
                                {statuses.map((s) => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1.5">Bedrooms</label>
                            <select value={draft.bedrooms} onChange={(e) => setDraft({ ...draft, bedrooms: Number(e.target.value) })} className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30">
                                <option value={0}>Any</option>
                                <option value={1}>1+</option>
                                <option value={2}>2+</option>
                                <option value={3}>3+</option>
                                <option value={4}>4+</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5">Min Price (L)</label>
                                <input type="number" value={draft.min_price} onChange={(e) => setDraft({ ...draft, min_price: e.target.value })} placeholder="50" className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5">Max Price (L)</label>
                                <input type="number" value={draft.max_price} onChange={(e) => setDraft({ ...draft, max_price: e.target.value })} placeholder="500" className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                            </div>
                        </div>
                    </div>
                )}

                <p className="text-sm text-gray-500 mb-6">
                    Showing <span className="font-semibold text-[#0D1B3E]">{properties.from || 0}–{properties.to || 0}</span> of <span className="font-semibold text-[#0D1B3E]">{properties.total}</span> properties
                </p>

                {properties.data.length === 0 ? (
                    <div className="text-center py-20 bg-[#F7F9FC] rounded-2xl border border-dashed border-[#E1E8F0]">
                        <div className="text-4xl mb-3">🏠</div>
                        <h3 className="font-semibold text-[#0D1B3E] text-lg mb-1">No properties found</h3>
                        <p className="text-gray-500 text-sm mb-6">Try adjusting your search or filters.</p>
                        <Link href="/properties" className="px-5 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50]">
                            Clear Filters
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.data.map((p) => <PropertyCard key={p.id} property={p} />)}
                    </div>
                )}

                {properties.last_page > 1 && (
                    <div className="mt-10 bg-white border border-[#E1E8F0] rounded-xl">
                        <Pagination
                            currentPage={properties.current_page}
                            lastPage={properties.last_page}
                            total={properties.total}
                            perPage={properties.per_page}
                            onPageChange={(page) => router.get('/properties', { ...(filters as any), page }, { preserveState: true, preserveScroll: true })}
                        />
                    </div>
                )}
            </section>
        </PublicLayout>
    );
}
