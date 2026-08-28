import { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import Modal from '@/components/ui/Modal';
import { Globe, Star, Eye, EyeOff, ChevronRight, Plus, X } from 'lucide-react';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    featuredProperties: any[];
    allProperties: any[];
    agents: any[];
    sections: { id: string; label: string; visible: boolean; icon: string }[];
    featuredIds: number[];
}

export default function CMS(props: Props) {
    const { featuredProperties, allProperties, agents, sections, featuredIds } = props;
    const [showFeatured, setShowFeatured] = useState(false);
    const [sectionList, setSectionList] = useState(sections);
    const [selectedIds, setSelectedIds] = useState<number[]>(featuredIds || []);

    const toggleSection = (id: string) => {
        const next = sectionList.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s));
        setSectionList(next);
        const target = next.find((s) => s.id === id)!;
        router.put(`/admin/cms/${id}`, { visible: target.visible }, { preserveScroll: true });
    };

    const openFeatured = () => {
        setSelectedIds(featuredIds || []);
        setShowFeatured(true);
    };

    const toggleFeatured = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const saveFeatured = () => {
        router.put('/admin/cms/featured', { ids: selectedIds }, { preserveScroll: true, onSuccess: () => setShowFeatured(false) });
    };

    return (
        <AdminLayout>
            <PageHeader
                title="CMS / Website"
                subtitle="Manage your public website content"
                breadcrumbs={[{ label: 'Operations' }, { label: 'CMS / Website' }]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sections */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                        <h3 className="font-semibold text-[#0D1B3E] mb-4 flex items-center gap-2"><Globe size={16} /> Homepage Sections</h3>
                        <div className="space-y-2.5">
                            {sectionList.map((s) => (
                                <div key={s.id} className="flex items-center justify-between bg-[#F7F9FC] rounded-lg px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{s.icon}</span>
                                        <span className="font-medium text-[#0D1B3E] text-sm">{s.label}</span>
                                    </div>
                                    <button
                                        onClick={() => toggleSection(s.id)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${s.visible ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        {s.visible ? <><Eye size={13} /> Visible</> : <><EyeOff size={13} /> Hidden</>}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Agents on website */}
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                        <h3 className="font-semibold text-[#0D1B3E] mb-4">Agents Shown on Website</h3>
                        <div className="space-y-3">
                            {agents.map((a) => (
                                <div key={a.id} className="flex items-center justify-between bg-[#F7F9FC] rounded-lg px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0D1B3E] to-gold-500 flex items-center justify-center text-white text-xs font-bold">
                                            {a.name?.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                                        </div>
                                        <div>
                                            <div className="font-medium text-[#0D1B3E] text-sm">{a.name}</div>
                                            <div className="text-gray-400 text-xs">{a.role}</div>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">Shown</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Featured properties */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-[#0D1B3E] flex items-center gap-2"><Star size={16} /> Featured on Homepage</h3>
                        </div>
                        <div className="space-y-3">
                            {featuredProperties.map((p) => (
                                <div key={p.id} className="flex items-center gap-3 bg-[#F7F9FC] rounded-lg p-2.5">
                                    <img src={p.image} alt="" className="w-14 h-12 rounded-lg object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-[#0D1B3E] text-sm truncate">{p.title}</div>
                                        <div className="text-gray-400 text-xs">{p.price_label}</div>
                                    </div>
                                    <span className="text-gold-500"><Star size={15} fill="currentColor" /></span>
                                </div>
                            ))}
                            {featuredProperties.length === 0 && (
                                <div className="text-center text-gray-400 text-sm py-6">No featured properties</div>
                            )}
                        </div>
                        <button onClick={openFeatured} className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-[#E1E8F0] rounded-lg text-sm font-medium text-gray-500 hover:bg-[#F7F9FC]">
                            <Plus size={15} /> Manage Featured
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-5 mt-6">
                        <h3 className="font-semibold text-[#0D1B3E] mb-3">Quick Links</h3>
                        <div className="space-y-1.5">
                            {[
                                { label: 'Edit Hero Section', href: '/admin/properties' },
                                { label: 'Manage Properties', href: '/admin/properties' },
                                { label: 'Update Contact Info', href: '/admin/settings' },
                                { label: 'View Public Website', href: '/' },
                            ].map((l, i) => (
                                <a key={i} href={l.href} className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-[#F7F9FC]">
                                    {l.label} <ChevronRight size={14} className="text-gray-300" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured modal */}
            <Modal open={showFeatured} onClose={() => setShowFeatured(false)} title="Manage Featured Properties" subtitle="Select properties to feature on the homepage" size="lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                    {allProperties.map((p) => {
                        const isFeatured = selectedIds.includes(p.id);
                        return (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => toggleFeatured(p.id)}
                                className={`flex items-center gap-3 rounded-lg border p-2.5 text-left transition-colors ${isFeatured ? 'border-gold-300 bg-gold-50/60 ring-1 ring-gold-300' : 'border-[#E1E8F0] bg-white hover:bg-[#FAFBFD]'}`}
                            >
                                <img src={p.image} alt="" className="w-12 h-10 rounded-lg object-cover" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-[#0D1B3E] text-xs truncate">{p.title}</div>
                                    <div className="text-gray-400 text-[11px]">{p.price_label}</div>
                                </div>
                                <span className={`w-5 h-5 rounded flex items-center justify-center border flex-shrink-0 ${isFeatured ? 'bg-gold-500 border-gold-500 text-white' : 'border-gray-300'}`}>
                                    {isFeatured && <X size={12} style={{ transform: 'rotate(45deg)' }} />}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <div className="mt-4 pt-3 border-t border-[#F0F4F8] flex items-center justify-between">
                    <span className="text-xs text-gray-400">{selectedIds.length} selected</span>
                    <div className="flex gap-2">
                        <button onClick={() => setShowFeatured(false)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                        <button onClick={saveFeatured} className="px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold">Save Featured</button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
