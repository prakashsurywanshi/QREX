import { useState } from 'react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import AmountInWords from '@/components/shared/AmountInWords';
import { Search, Plus, Phone, Gauge, X, Upload, Download, FileSpreadsheet } from 'lucide-react';
import type { Lead, PageProps } from '@/types';

interface Props extends PageProps {
    leads: { data: any[]; current_page: number; last_page: number; total: number; per_page: number };
    filters: { search?: string; status?: string; source?: string; campaign?: string };
    statuses: string[];
    sources: string[];
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

export default function Leads(props: Props) {
    const { leads, filters, statuses, sources, campaigns, can } = props;
    const canCreate = !!can?.leads?.create;
    const [draft, setDraft] = useState({
        search: filters.search || '',
        status: filters.status || 'All',
        source: filters.source || 'All',
        campaign: filters.campaign || 'All',
    });
    const [showAdd, setShowAdd] = useState(false);
    const [showImport, setShowImport] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        email: '',
        source: 'Website',
        status: 'New',
        budget: '',
        preferred_location: '',
        score: 50,
    });

    const importForm = useForm({ file: null as File | null, campaign_id: '' });

    const applyFilters = () => {
        const params: Record<string, string> = {};
        if (draft.search) params.search = draft.search;
        if (draft.status !== 'All') params.status = draft.status;
        if (draft.source !== 'All') params.source = draft.source;
        if (draft.campaign !== 'All') params.campaign = draft.campaign;
        router.get('/admin/leads', params, { preserveState: true });
    };

    const submitNew = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/leads', {
            onSuccess: () => {
                setShowAdd(false);
                setData({ name: '', phone: '', email: '', source: 'Website', status: 'New', budget: '', preferred_location: '', score: 50 });
            },
        });
    };

    const scoreColor = (s: number) => s >= 70 ? 'bg-emerald-100 text-emerald-700' : s >= 40 ? 'bg-gold-100 text-gold-700' : 'bg-red-100 text-red-600';

    const submitImport = (e: React.FormEvent) => {
        e.preventDefault();
        importForm.post('/admin/leads/import', {
            onSuccess: () => {
                setShowImport(false);
                importForm.reset();
            },
        });
    };

    return (
        <AdminLayout>
            <PageHeader
                title="Leads"
                subtitle="Track and manage all incoming leads"
                breadcrumbs={[{ label: 'Sales' }, { label: 'Leads' }]}
                actions={
                    <div className="flex items-center gap-2">
                        {canCreate && (
                            <button onClick={() => setShowImport(true)} className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#0D1B3E] text-[#0D1B3E] rounded-lg text-sm font-semibold hover:bg-[#0D1B3E]/5 transition-colors">
                                <Upload size={16} /> Import
                            </button>
                        )}
                        {canCreate && (
                            <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50] transition-colors">
                                <Plus size={16} /> Add Lead
                            </button>
                        )}
                    </div>
                }
            />

            {/* Filters */}
            <div className="bg-white rounded-xl border border-[#E1E8F0] p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={draft.search}
                        onChange={(e) => setDraft({ ...draft, search: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                        placeholder="Search by name, phone, email"
                        className="w-full pl-9 pr-3 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                    />
                </div>
                <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="px-3 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                    {statuses.map((s) => <option key={s}>{s}</option>)}
                </select>
                <select value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} className="px-3 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                    {sources.map((s) => <option key={s}>{s}</option>)}
                </select>
                <select value={draft.campaign} onChange={(e) => setDraft({ ...draft, campaign: e.target.value })} className="px-3 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                    <option>All</option>
                    {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button onClick={applyFilters} className="px-4 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50]">Apply</button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-[#E1E8F0] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#F7F9FC] text-left text-xs uppercase tracking-wider text-gray-400">
                                <th className="px-5 py-3 font-semibold">Lead</th>
                                <th className="px-4 py-3 font-semibold">Source</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold">Score</th>
                                <th className="px-4 py-3 font-semibold">Interested In</th>
                                <th className="px-4 py-3 font-semibold">Campaign</th>
                                <th className="px-4 py-3 font-semibold">Agent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F4F8]">
                            {leads.data.map((lead) => (
                                <tr key={lead.id} className="hover:bg-[#FAFBFD] transition-colors">
                                    <td className="px-5 py-3">
                                        <Link href={`/admin/leads/${lead.id}`} className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-[#0D1B3E]/5 flex items-center justify-center text-xs font-bold text-[#0D1B3E] flex-shrink-0">
                                                {lead.name?.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-medium text-[#0D1B3E] hover:text-gold-600 truncate">{lead.name}</div>
                                                <div className="text-gray-400 text-xs flex items-center gap-1"><Phone size={10} /> {lead.phone}</div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-gray-600">{lead.source}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`status-badge ${statusColor[lead.status] || 'bg-gray-100 text-gray-600'}`}>{lead.status}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${scoreColor(lead.score)}`}>
                                            <span className="inline-flex items-center gap-1"><Gauge size={11} /> {lead.score}</span>
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">
                                        {lead.interested_property?.title || lead.preferred_location || '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${lead.campaign ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-400'}`}>
                                            {lead.campaign?.name || 'No campaign'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {lead.assigned_agent?.name || 'Unassigned'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {leads.data.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-4xl mb-3">💬</div>
                        <h3 className="font-semibold text-[#0D1B3E]">No leads found</h3>
                        <p className="text-gray-400 text-sm mt-1">Try adjusting your filters.</p>
                    </div>
                )}

                {leads.last_page > 1 && (
                    <div className="border-t border-[#F0F4F8]">
                        <Pagination
                            currentPage={leads.current_page}
                            lastPage={leads.last_page}
                            total={leads.total}
                            perPage={leads.per_page}
                            onPageChange={(page) => router.get('/admin/leads', { ...(filters as any), page }, { preserveState: true })}
                        />
                    </div>
                )}
            </div>

            {/* Add Lead Modal */}
            <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Lead">
                <form onSubmit={submitNew} className="space-y-3.5">
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
                            <label className="block text-xs font-medium text-gray-600 mb-1">Source</label>
                            <select value={data.source} onChange={(e) => setData('source', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                {['Website', 'Facebook', 'Instagram', 'Google', 'Referral', 'Walk-in', 'Phone', 'WhatsApp', 'Campaign'].map((s) => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                            <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                {['New', 'Contacted', 'Qualified', 'Site Visit Scheduled', 'Site Visit Completed', 'Negotiation'].map((s) => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Budget</label>
                            <input value={data.budget} onChange={(e) => setData('budget', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none" placeholder="₹1.5 Cr" />
                            <AmountInWords value={data.budget} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Preferred Location</label>
                            <input value={data.preferred_location} onChange={(e) => setData('preferred_location', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none" placeholder="Andheri West, Mumbai" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Lead Score: {data.score}</label>
                            <input type="range" min="0" max="100" value={data.score} onChange={(e) => setData('score', Number(e.target.value))} className="w-full accent-[#0D1B3E]" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                        <button type="submit" disabled={processing} className="px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                            {processing ? 'Creating...' : 'Create Lead'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Import Leads Modal */}
            <Modal open={showImport} onClose={() => setShowImport(false)} title="Import Leads from CSV">
                <form onSubmit={submitImport} className="space-y-4">
                    <div className="rounded-xl border-2 border-dashed border-[#E1E8F0] p-6 text-center">
                        <FileSpreadsheet size={28} className="text-gold-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-[#0D1B3E]">Choose a CSV file</p>
                        <p className="text-xs text-gray-400 mt-1">Columns: Name*, Phone*, Email, Source, Status, Budget, Preferred Location, Requirements, Score, Next Follow-up</p>
                    </div>
                    <input
                        type="file"
                        accept=".csv,text/csv"
                        onChange={(e) => importForm.setData('file', e.target.files?.[0] || null)}
                        className="w-full text-sm file:mr-3 file:px-3.5 file:py-2 file:rounded-lg file:border-0 file:bg-[#0D1B3E] file:text-white file:text-sm file:font-semibold hover:file:bg-[#1A2B50]"
                    />
                    {importForm.errors.file && <p className="text-red-500 text-xs">{importForm.errors.file}</p>}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Link to Campaign (optional)</label>
                        <select value={importForm.data.campaign_id} onChange={(e) => importForm.setData('campaign_id', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                            <option value="">No campaign</option>
                            {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <p className="text-[11px] text-gray-400 mt-1">Selecting a campaign attaches all imported leads to that campaign.</p>
                    </div>
                    <p className="text-[11px] text-gray-400">
                        Rows missing a name or phone are skipped. Duplicates are not imported. First row with headers is auto-detected.
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <a href="/admin/leads/import-template" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600 hover:text-gold-700">
                            <Download size={14} /> Download Template
                        </a>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setShowImport(false)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                            <button type="submit" disabled={importForm.processing || !importForm.data.file} className="inline-flex items-center gap-2 px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                                {importForm.processing ? 'Importing...' : <><Upload size={15} /> Import</>}
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
