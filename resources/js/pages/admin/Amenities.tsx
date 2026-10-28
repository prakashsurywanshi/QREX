import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import Modal from '@/components/ui/Modal';
import { Check, Layers, ListChecks, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import type { Amenity, PageProps, PropertyTypeSummary, SpecRuleSet } from '@/types';

interface Props extends PageProps {
    types: PropertyTypeSummary[];
    selectedTypeId: number | null;
    amenities: Amenity[];
    specRules: SpecRuleSet;
}

const inputCls = "w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30";
const labelCls = "block text-xs font-medium text-gray-600 mb-1.5";

export default function Amenities(props: Props) {
    const { types, selectedTypeId, amenities, can } = props;

    const [showCreate, setShowCreate] = useState(false);
    const [showBulk, setShowBulk] = useState(false);
    const [editing, setEditing] = useState<Amenity | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Amenity | null>(null);

    const selectedType = types.find((t) => t.id === selectedTypeId) ?? types[0] ?? null;

    const createForm = useForm({ property_type_id: selectedTypeId ?? 0, name: '', icon: '', is_active: true });
    const bulkForm = useForm({ property_type_id: selectedTypeId ?? 0, names: '' });

    const editForm = useForm({ name: '', icon: '', sort_order: 0, is_active: true });

    const selectType = (id: number) => {
        router.get('/admin/amenities', { type: id }, { preserveState: false });
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/amenities', { onSuccess: () => { createForm.reset(); setShowCreate(false); } });
    };

    const submitBulk = (e: React.FormEvent) => {
        e.preventDefault();
        bulkForm.post('/admin/amenities/bulk', { onSuccess: () => { bulkForm.reset(); setShowBulk(false); } });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        editForm.put(`/admin/amenities/${editing.id}`, { onSuccess: () => setEditing(null) });
    };

    const openEdit = (amenity: Amenity) => {
        editForm.setData({
            name: amenity.name,
            icon: amenity.icon ?? '',
            sort_order: amenity.sort_order,
            is_active: amenity.is_active,
        });
        setEditing(amenity);
    };

    const toggleActive = (amenity: Amenity) => {
        router.put(
            `/admin/amenities/${amenity.id}`,
            { name: amenity.name, icon: amenity.icon ?? '', sort_order: amenity.sort_order, is_active: !amenity.is_active },
            { preserveScroll: true },
        );
    };

    return (
        <AdminLayout>
            <PageHeader
                title="Amenities"
                subtitle="Curate which amenities are offered for each property type"
                breadcrumbs={[{ label: 'Settings' }, { label: 'Amenities' }]}
                actions={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowBulk(true)}
                            disabled={!can?.amenities?.create}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600 hover:bg-[#F7F9FC] disabled:opacity-40"
                        >
                            <Layers size={15} /> Bulk Add
                        </button>
                        <button
                            onClick={() => setShowCreate(true)}
                            disabled={!can?.amenities?.create}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gold-500 text-white rounded-lg text-sm font-semibold hover:bg-gold-600 disabled:opacity-40"
                        >
                            <Plus size={15} /> Add Amenity
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                {/* Type selector */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-3">
                        <p className="text-xs font-semibold text-gray-500 px-2 pb-2 pt-1">Property Type</p>
                        <div className="space-y-0.5">
                            {types.map((t) => {
                                const active = t.id === selectedType?.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => selectType(t.id)}
                                        className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                                            active ? 'bg-[#0D1B3E] text-white font-semibold' : 'text-gray-600 hover:bg-[#F4F7FC]'
                                        }`}
                                    >
                                        <span className="truncate">{t.name}</span>
                                        <span className={`text-[11px] tabular-nums ${active ? 'text-blue-200' : 'text-gray-400'}`}>
                                            {t.active_count}/{t.amenity_count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#0D1B3E] to-[#1A2B50] rounded-xl p-5 text-white mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ListChecks size={17} className="text-gold-400" />
                            <h3 className="font-semibold text-sm">Type-aware forms</h3>
                        </div>
                        <p className="text-xs text-blue-200/70 leading-relaxed">
                            The property form only offers these amenities once{' '}
                            <span className="text-gold-400 font-semibold">{selectedType?.name ?? 'a type'}</span> is selected, so agents
                            can&apos;t pick a private pool for a shop.
                        </p>
                    </div>
                </div>

                {/* Amenity list */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl border border-[#E1E8F0]">
                        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-b border-[#E1E8F0]">
                            <div>
                                <h3 className="font-semibold text-[#0D1B3E]">{selectedType?.name ?? '—'} amenities</h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {selectedType?.description ?? 'Select a property type to begin.'}
                                </p>
                            </div>
                            <span className="text-[11px] font-medium text-gray-400">
                                {amenities.filter((a) => a.is_active).length} active of {amenities.length}
                            </span>
                        </div>

                        {amenities.length === 0 ? (
                            <div className="px-5 py-14 text-center">
                                <ListChecks size={28} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-sm text-gray-500">No amenities yet for {selectedType?.name}.</p>
                                <button
                                    onClick={() => setShowBulk(true)}
                                    disabled={!can?.amenities?.create}
                                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold disabled:opacity-40"
                                >
                                    <Plus size={14} /> Add some
                                </button>
                            </div>
                        ) : (
                            <ul className="divide-y divide-[#F0F4F8]">
                                {amenities.map((a) => (
                                    <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                                            a.is_active ? 'bg-[#F4F7FC] text-gray-500' : 'bg-gray-100 text-gray-300'
                                        }`}>
                                            {a.sort_order}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-medium truncate ${a.is_active ? 'text-[#0D1B3E]' : 'text-gray-400 line-through'}`}>
                                                {a.name}
                                            </div>
                                            <div className="text-[11px] text-gray-400">{a.slug}</div>
                                        </div>
                                        <button
                                            onClick={() => toggleActive(a)}
                                            disabled={!can?.amenities?.edit}
                                            title={a.is_active ? 'Deactivate — hides it from the property form' : 'Activate'}
                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold disabled:opacity-40 ${
                                                a.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'
                                            }`}
                                        >
                                            <Power size={11} /> {a.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                        <button
                                            onClick={() => openEdit(a)}
                                            disabled={!can?.amenities?.edit}
                                            title="Edit amenity"
                                            className="p-2 text-gray-400 hover:text-[#0D1B3E] rounded-lg hover:bg-[#F8FAFD] disabled:opacity-40"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(a)}
                                            disabled={!can?.amenities?.delete}
                                            title="Delete amenity"
                                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-40"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <p className="text-[11px] text-gray-400 mt-3">
                        Deleting an amenity only removes it from this catalog. Properties that already store it keep their value.
                        <Link href="/admin/properties/create" className="ml-1 text-gold-600 hover:underline">Add a property</Link>
                    </p>
                </div>
            </div>

            {/* Create */}
            <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Amenity" subtitle={`Adds an option to ${selectedType?.name ?? 'the selected type'}`}>
                <form onSubmit={submitCreate} className="space-y-4">
                    <div>
                        <label className={labelCls}>Property Type *</label>
                        <select value={createForm.data.property_type_id} onChange={(e) => createForm.setData('property_type_id', Number(e.target.value))} className={inputCls}>
                            {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        {createForm.errors.property_type_id && <p className="text-red-500 text-xs mt-1">{createForm.errors.property_type_id}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>Amenity Name *</label>
                        <input value={createForm.data.name} onChange={(e) => createForm.setData('name', e.target.value)} required className={inputCls} placeholder="e.g. Rainwater Harvesting" />
                        {createForm.errors.name && <p className="text-red-500 text-xs mt-1">{createForm.errors.name}</p>}
                    </div>
                    <div>
                        <label className={labelCls}>Icon Key (optional)</label>
                        <input value={createForm.data.icon} onChange={(e) => createForm.setData('icon', e.target.value)} className={inputCls} placeholder="e.g. droplets" />
                    </div>
                    <label className="flex items-center gap-2.5 text-sm text-gray-700">
                        <input type="checkbox" checked={createForm.data.is_active} onChange={(e) => createForm.setData('is_active', e.target.checked)} className="rounded" />
                        Active — show in the property form
                    </label>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">
                            Cancel
                        </button>
                        <button type="submit" disabled={createForm.processing} className="px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                            {createForm.processing ? 'Saving...' : 'Add Amenity'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Bulk add */}
            <Modal open={showBulk} onClose={() => setShowBulk(false)} title="Bulk Add Amenities" subtitle={`One per line, or comma separated, into ${selectedType?.name ?? 'the selected type'}`}>
                <form onSubmit={submitBulk} className="space-y-4">
                    <div>
                        <label className={labelCls}>Property Type *</label>
                        <select value={bulkForm.data.property_type_id} onChange={(e) => bulkForm.setData('property_type_id', Number(e.target.value))} className={inputCls}>
                            {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Amenity Names *</label>
                        <textarea
                            value={bulkForm.data.names}
                            onChange={(e) => bulkForm.setData('names', e.target.value)}
                            rows={7}
                            required
                            className={inputCls}
                            placeholder={'Borewell\nFencing\nSolar Fencing\nStorage Shed'}
                        />
                        {bulkForm.errors.names && <p className="text-red-500 text-xs mt-1">{bulkForm.errors.names}</p>}
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowBulk(false)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">
                            Cancel
                        </button>
                        <button type="submit" disabled={bulkForm.processing} className="px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                            {bulkForm.processing ? 'Adding...' : 'Add All'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit */}
            <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Amenity" subtitle={editing?.name}>
                {editing && (
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div>
                            <label className={labelCls}>Amenity Name *</label>
                            <input value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} required className={inputCls} />
                            {editForm.errors.name && <p className="text-red-500 text-xs mt-1">{editForm.errors.name}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3.5">
                            <div>
                                <label className={labelCls}>Icon Key</label>
                                <input value={editForm.data.icon} onChange={(e) => editForm.setData('icon', e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Sort Order</label>
                                <input type="number" min="0" value={editForm.data.sort_order} onChange={(e) => editForm.setData('sort_order', Number(e.target.value))} className={inputCls} />
                            </div>
                        </div>
                        <label className="flex items-center gap-2.5 text-sm text-gray-700">
                            <input type="checkbox" checked={editForm.data.is_active} onChange={(e) => editForm.setData('is_active', e.target.checked)} className="rounded" />
                            Active
                        </label>
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">
                                Cancel
                            </button>
                            <button type="submit" disabled={editForm.processing} className="px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                                {editForm.processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Delete */}
            <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Amenity" size="sm">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Remove <span className="font-semibold text-[#0D1B3E]">{deleteTarget?.name}</span> from the{' '}
                        {selectedType?.name} catalog? Properties that already store it keep their value.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (deleteTarget) {
                                    router.delete(`/admin/amenities/${deleteTarget.id}`, {
                                        onSuccess: () => setDeleteTarget(null),
                                        preserveScroll: true,
                                    });
                                }
                            }}
                            className="inline-flex items-center gap-1.5 px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
                        >
                            <Check size={14} /> Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
