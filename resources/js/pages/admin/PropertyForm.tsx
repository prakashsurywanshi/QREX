import { useRef, useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Plus, Star, X } from 'lucide-react';
import AmountInWords from '@/components/shared/AmountInWords';
import type { Property, PropertyTypeMeta, SpecField } from '@/types';

type Agent = { id: number; name: string };
type GalleryImage = { id: number; path: string; is_cover?: boolean; sort_order?: number };

interface Props {
    property: Property | null;
    agents: Agent[];
    typeCatalog: PropertyTypeMeta[];
    errors?: Record<string, string>;
    flash?: { success?: string; error?: string };
    auth?: unknown;
}

const transactionTypes = ['Buy', 'Rent', 'Lease'];
const statuses = ['Available', 'Reserved', 'Under Negotiation', 'Sold', 'Draft', 'Rented', 'Inactive'];
const furnishing = ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'];

const steps = [
    { title: 'Basic Info', desc: 'Title, type & status' },
    { title: 'Pricing & Specs', desc: 'Price, size & rooms' },
    { title: 'Location', desc: 'Address details' },
    { title: 'Amenities', desc: 'Features & facilities' },
    { title: 'Gallery & Website', desc: 'Media & visibility' },
];

/** Used when the catalog is empty (e.g. the seeders have not run yet). */
const FALLBACK_SPEC = {
    visible: ['price', 'area', 'bedrooms', 'bathrooms', 'floors', 'parking', 'furnishing', 'possession_date'] as SpecField[],
    required: ['price', 'area'] as SpecField[],
    hidden: [] as SpecField[],
    defaults: { bedrooms: 0, bathrooms: 0, floors: 1, parking: 0 },
    area_label: 'Area (sq.ft)',
};

const fieldLabels: Record<SpecField, string> = {
    price: 'price',
    area: 'area',
    bedrooms: 'bedrooms',
    bathrooms: 'bathrooms',
    floors: 'floors',
    parking: 'parking',
    furnishing: 'furnishing',
    possession_date: 'possession date',
};

export default function PropertyForm(props: Props) {
    const { property, agents, typeCatalog } = props;
    const isEdit = !!property;

    const initialType = property?.type || typeCatalog[0]?.name || 'Apartment';

    const [step, setStep] = useState(0);
    const [amenities, setAmenities] = useState<string[]>(property?.amenities || []);
    const [removedAmenities, setRemovedAmenities] = useState<string[]>([]);
    const [customAmenity, setCustomAmenity] = useState('');
    const [existing, setExisting] = useState<GalleryImage[]>(property?.images || []);
    const [removedIds, setRemovedIds] = useState<number[]>([]);
    const [picks, setPicks] = useState<{ key: number; file: File; preview: string }[]>([]);
    const pickKeyRef = useRef(0);
    const [coverKey, setCoverKey] = useState<string>(() => {
        const list = property?.images || [];
        const cover = list.find((i) => i.is_cover) ?? list[0];
        return cover ? `e:${cover.id}` : '';
    });
    const { data, setData, post, put, processing, errors } = useForm<Record<string, any>>({
        title: property?.title || '',
        type: initialType,
        transaction_type: property?.transaction_type || 'Buy',
        description: property?.description || '',
        status: property?.status || 'Available',
        price: property?.price || '',
        area: property?.area || '',
        bedrooms: property?.bedrooms || '',
        bathrooms: property?.bathrooms || '',
        floors: property?.floors || '',
        parking: property?.parking || '',
        furnishing: property?.furnishing || 'Unfurnished',
        possession_date: property?.possession_date || '',
        address: property?.address || '',
        city: property?.city || '',
        state: property?.state || '',
        country: property?.country || 'India',
        pincode: property?.pincode || '',
        new_images: [] as File[],
        remove_image_ids: [] as number[],
        cover_image_id: '',
        cover_new_index: '',
        amenities: property?.amenities || [],
        featured: property?.featured || false,
        is_website_visible: property?.is_website_visible ?? true,
        seo_title: property?.seo_title || '',
        meta_description: property?.meta_description || '',
        agent_id: property?.agent_id || '',
    });

    const types = typeCatalog.map((t) => t.name);
    const activeType = typeCatalog.find((t) => t.name === data.type);
    const spec = activeType?.spec ?? FALLBACK_SPEC;
    const amenityOptions = activeType?.amenities ?? [];
    const shows = (field: SpecField) => spec.visible.includes(field);

    const syncAmenities = (next: string[]) => {
        setAmenities(next);
        setData('amenities', next as never[]);
    };

    /**
     * Switching type re-scopes everything that depends on it: amenities not
     * available for the new type are dropped (with a notice so nothing silently
     * disappears), and spec fields the new type hides are reset so a Plot can't
     * keep advertising the previous listing's bedroom count.
     */
    const handleTypeChange = (nextType: string) => {
        const nextSpec = typeCatalog.find((t) => t.name === nextType)?.spec ?? FALLBACK_SPEC;
        const allowed = typeCatalog.find((t) => t.name === nextType)?.amenities ?? [];

        setData('type', nextType);

        // Only prune amenities that belonged to the previous type's catalog but are
        // invalid for the new one. Custom/off-catalog values are never pruned.
        const previousAllowed = typeCatalog.find((t) => t.name === data.type)?.amenities ?? [];
        const pruned = amenities.filter((a) => previousAllowed.includes(a) && !allowed.includes(a));

        setRemovedAmenities(pruned);
        if (pruned.length) syncAmenities(amenities.filter((a) => !pruned.includes(a)));

        (['bedrooms', 'bathrooms', 'floors', 'parking'] as SpecField[]).forEach((field) => {
            if (!nextSpec.visible.includes(field)) {
                const fallback = field === 'floors' ? 1 : 0;
                setData(field, (nextSpec.defaults as Record<string, string | number>)[field] ?? fallback as never);
            }
        });
    };

    const toggleAmenity = (a: string) => {
        syncAmenities(amenities.includes(a) ? amenities.filter((x) => x !== a) : [...amenities, a]);
    };

    /** Amenities outside the curated list are kept, never pruned on type change. */
    const isCustomAmenity = (a: string) => !amenityOptions.includes(a);

    const addCustomAmenity = () => {
        const name = customAmenity.trim().replace(/\s+/g, ' ');

        if (!name) return;
        if (amenities.some((a) => a.toLowerCase() === name.toLowerCase())) {
            setCustomAmenity('');
            return;
        }

        syncAmenities([...amenities, name]);
        setCustomAmenity('');
    };

    const next = (e: React.MouseEvent) => {
        e.preventDefault();
        if (step < steps.length - 1) setStep(step + 1);
    };
    const back = (e: React.MouseEvent) => {
        e.preventDefault();
        if (step > 0) setStep(step - 1);
    };

    const setCoverToFirst = (exs: GalleryImage[], pks: { key: number }[]) => {
        if (exs.length) setCoverKey(`e:${exs[0].id}`);
        else if (pks.length) setCoverKey(`n:${pks[0].key}`);
        else setCoverKey('');
    };

    const addPicks = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const remaining = 15 - existing.length - picks.length;
        const added = Array.from(files)
            .slice(0, Math.max(0, remaining))
            .map((file) => ({ key: ++pickKeyRef.current, file, preview: URL.createObjectURL(file) }));
        setPicks((prev) => [...prev, ...added]);
        if (coverKey === '' && existing.length === 0 && added.length) setCoverKey(`n:${added[0].key}`);
    };

    const removeExisting = (img: GalleryImage) => {
        setExisting((prev) => prev.filter((x) => x.id !== img.id));
        setRemovedIds((prev) => [...prev, img.id]);
        if (coverKey === `e:${img.id}`) setCoverToFirst(existing.filter((x) => x.id !== img.id), picks);
    };

    const removePick = (key: number) => {
        const pick = picks.find((p) => p.key === key);
        if (pick) URL.revokeObjectURL(pick.preview);
        const next = picks.filter((p) => p.key !== key);
        setPicks(next);
        if (coverKey === `n:${key}`) setCoverToFirst(existing, next);
    };

    const totalImages = existing.length + picks.length;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const [kind, value] = coverKey.split(':');
        if (kind === 'e') {
            setData('cover_image_id', value as never);
            setData('cover_new_index', '' as never);
        } else if (kind === 'n') {
            const idx = picks.findIndex((p) => p.key === Number(value));
            setData('cover_new_index', String(idx < 0 ? 0 : idx) as never);
            setData('cover_image_id', '' as never);
        } else {
            setData('cover_image_id', '' as never);
            setData('cover_new_index', '' as never);
        }
        setData('new_images', picks.map((p) => p.file) as never);
        setData('remove_image_ids', removedIds as never);
        if (isEdit) {
            put(`/admin/properties/${property.id}`, { forceFormData: true });
        } else {
            post('/admin/properties', { forceFormData: true });
        }
    };

    const inputCls = "w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30";
    const labelCls = "block text-xs font-medium text-gray-600 mb-1.5";

    return (
        <AdminLayout>
            <PageHeader
                title={isEdit ? 'Edit Property' : 'Add New Property'}
                subtitle={isEdit ? `Editing ${property.title}` : 'Create a new property listing'}
                breadcrumbs={[{ label: 'Sales' }, { label: 'Properties', href: '/admin/properties' }, { label: isEdit ? 'Edit' : 'New' }]}
                actions={
                    <Link href="/admin/properties" className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600 hover:bg-[#F7F9FC]">
                        <ChevronLeft size={16} /> Back
                    </Link>
                }
            />

            {/* Stepper */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    {steps.map((s, i) => {
                        const active = i === step;
                        const done = i < step;
                        return (
                            <div key={s.title} className="flex items-center flex-1 last:flex-initial">
                                <button
                                    type="button"
                                    onClick={() => setStep(i)}
                                    className="flex flex-col items-center text-center w-auto group"
                                >
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${done ? 'bg-emerald-500 text-white' : active ? 'bg-[#0D1B3E] text-white ring-4 ring-[#0D1B3E]/10' : 'bg-[#EEF1F8] text-gray-400'}`}>
                                        {done ? <Check size={16} /> : i + 1}
                                    </div>
                                    <div className={`mt-1.5 text-[11px] font-semibold hidden sm:block ${active ? 'text-[#0D1B3E]' : 'text-gray-400'}`}>{s.title}</div>
                                </button>
                                {i < steps.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 sm:mx-3 mb-6 sm:mb-0 rounded ${i < step ? 'bg-emerald-500' : 'bg-[#E8EDF5]'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <form onSubmit={submit} className="space-y-5">
                {step === 0 && (
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-6">
                        <h3 className="font-semibold text-[#0D1B3E] mb-4 pb-3 border-b border-[#F0F4F8]">Basic Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className={labelCls}>Property Title *</label>
                                <input value={data.title} onChange={(e) => setData('title', e.target.value)} required className={inputCls} placeholder="e.g. Skyline Heights — 3BHK" />
                                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>Property Type *</label>
                                <select value={data.type} onChange={(e) => handleTypeChange(e.target.value)} className={inputCls}>
                                    {types.map((t) => <option key={t}>{t}</option>)}
                                </select>
                                {activeType?.description && (
                                    <p className="text-[11px] text-gray-400 mt-1">{activeType.description}</p>
                                )}
                            </div>
                            <div>
                                <label className={labelCls}>Transaction Type *</label>
                                <select value={data.transaction_type} onChange={(e) => setData('transaction_type', e.target.value)} className={inputCls}>
                                    {transactionTypes.map((t) => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Status *</label>
                                <select value={data.status} onChange={(e) => setData('status', e.target.value)} className={inputCls}>
                                    {statuses.map((s) => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Assigned Agent</label>
                                <select value={data.agent_id} onChange={(e) => setData('agent_id', e.target.value as never)} className={inputCls}>
                                    <option value="">Select Agent</option>
                                    {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelCls}>Description</label>
                                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={4} className={inputCls} placeholder="Describe the property..." />
                            </div>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-6">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0F4F8]">
                            <h3 className="font-semibold text-[#0D1B3E]">Pricing & Specifications</h3>
                            <span className="text-[11px] font-medium text-gray-400">
                                Fields for {data.type}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {shows('price') && (
                                <div>
                                    <label className={labelCls}>Price (₹) *</label>
                                    <input type="number" value={data.price} onChange={(e) => setData('price', e.target.value as never)} required className={inputCls} placeholder="18500000" />
                                    <AmountInWords value={data.price} />
                                </div>
                            )}
                            {shows('area') && (
                                <div>
                                    <label className={labelCls}>{spec.area_label} *</label>
                                    <input type="number" step="any" value={data.area} onChange={(e) => setData('area', e.target.value as never)} required className={inputCls} placeholder="1450" />
                                </div>
                            )}
                            {shows('furnishing') && (
                                <div>
                                    <label className={labelCls}>Furnishing</label>
                                    <select value={data.furnishing} onChange={(e) => setData('furnishing', e.target.value)} className={inputCls}>
                                        {furnishing.map((f) => <option key={f}>{f}</option>)}
                                    </select>
                                </div>
                            )}
                            {shows('bedrooms') && (
                                <div>
                                    <label className={labelCls}>Bedrooms</label>
                                    <input type="number" min="0" value={data.bedrooms} onChange={(e) => setData('bedrooms', e.target.value as never)} className={inputCls} placeholder="3" />
                                </div>
                            )}
                            {shows('bathrooms') && (
                                <div>
                                    <label className={labelCls}>Bathrooms</label>
                                    <input type="number" min="0" value={data.bathrooms} onChange={(e) => setData('bathrooms', e.target.value as never)} className={inputCls} placeholder="2" />
                                </div>
                            )}
                            {shows('floors') && (
                                <div>
                                    <label className={labelCls}>Total Floors</label>
                                    <input type="number" min="0" value={data.floors} onChange={(e) => setData('floors', e.target.value as never)} className={inputCls} placeholder="1" />
                                </div>
                            )}
                            {shows('parking') && (
                                <div>
                                    <label className={labelCls}>Parking Slots</label>
                                    <input type="number" min="0" value={data.parking} onChange={(e) => setData('parking', e.target.value as never)} className={inputCls} placeholder="1" />
                                </div>
                            )}
                            {shows('possession_date') && (
                                <div>
                                    <label className={labelCls}>Possession Date</label>
                                    <input value={data.possession_date} onChange={(e) => setData('possession_date', e.target.value)} className={inputCls} placeholder="Dec 2026" />
                                </div>
                            )}
                        </div>
                        {spec.hidden.length > 0 && (
                            <p className="text-[11px] text-gray-400 mt-4 pt-3 border-t border-[#F0F4F8]">
                                {data.type} listings don&apos;t use {spec.hidden.map((f) => fieldLabels[f]).join(', ')} — those values will be cleared on save.
                            </p>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-6">
                        <h3 className="font-semibold text-[#0D1B3E] mb-4 pb-3 border-b border-[#F0F4F8]">Location</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className={labelCls}>Address</label>
                                <input value={data.address} onChange={(e) => setData('address', e.target.value)} className={inputCls} placeholder="Street address / locality" />
                            </div>
                            <div>
                                <label className={labelCls}>City</label>
                                <input value={data.city} onChange={(e) => setData('city', e.target.value)} className={inputCls} placeholder="Mumbai" />
                            </div>
                            <div>
                                <label className={labelCls}>State</label>
                                <input value={data.state} onChange={(e) => setData('state', e.target.value)} className={inputCls} placeholder="Maharashtra" />
                            </div>
                            <div>
                                <label className={labelCls}>Country</label>
                                <input value={data.country} onChange={(e) => setData('country', e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Pincode</label>
                                <input value={data.pincode} onChange={(e) => setData('pincode', e.target.value)} className={inputCls} placeholder="400053" />
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-6">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-[#F0F4F8]">
                            <h3 className="font-semibold text-[#0D1B3E]">Amenities</h3>
                            <span className="text-[11px] font-medium text-gray-400">
                                {amenityOptions.length} available for {data.type} · {amenities.length} selected
                            </span>
                        </div>

                        {removedAmenities.length > 0 && (
                            <div className="flex items-start gap-2.5 mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3.5 py-2.5 rounded-lg">
                                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-semibold">
                                        {removedAmenities.length} {removedAmenities.length === 1 ? 'amenity' : 'amenities'} not available for {data.type} and{' '}
                                        {removedAmenities.length === 1 ? 'was' : 'were'} removed.
                                    </p>
                                    <p className="mt-0.5 text-amber-700">{removedAmenities.join(', ')}</p>
                                </div>
                                <button type="button" onClick={() => setRemovedAmenities([])} title="Dismiss" className="flex-shrink-0 p-0.5 rounded hover:bg-amber-100">
                                    <X size={13} />
                                </button>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {amenityOptions.map((a) => {
                                const active = amenities.includes(a);
                                return (
                                    <button
                                        key={a}
                                        type="button"
                                        onClick={() => toggleAmenity(a)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${active ? 'bg-[#0D1B3E] text-white' : 'bg-[#F4F7FC] text-gray-600 hover:bg-[#E9EEF6]'}`}
                                    >
                                        {active && <Check size={11} className="inline mr-1 -mt-0.5" />}
                                        {a}
                                    </button>
                                );
                            })}
                            {amenityOptions.length === 0 && (
                                <p className="text-sm text-gray-400">No amenities configured for {data.type} yet. Add them below or curate them under Settings → Amenities.</p>
                            )}
                        </div>

                        {amenities.some(isCustomAmenity) && (
                            <div className="mt-5 pt-4 border-t border-[#F0F4F8]">
                                <p className="text-xs font-medium text-gray-600 mb-2">Custom amenities</p>
                                <div className="flex flex-wrap gap-2">
                                    {amenities.filter(isCustomAmenity).map((a) => (
                                        <span key={a} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full text-xs font-medium bg-gold-50 text-gold-700 border border-gold-200">
                                            {a}
                                            <button type="button" onClick={() => toggleAmenity(a)} title={`Remove ${a}`} className="p-0.5 rounded-full hover:bg-gold-200">
                                                <X size={11} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-5 pt-4 border-t border-[#F0F4F8]">
                            <label className={labelCls}>Add a custom amenity</label>
                            <div className="flex gap-2">
                                <input
                                    value={customAmenity}
                                    onChange={(e) => setCustomAmenity(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addCustomAmenity();
                                        }
                                    }}
                                    className={inputCls}
                                    placeholder="e.g. Rainwater harvesting"
                                />
                                <button
                                    type="button"
                                    onClick={addCustomAmenity}
                                    className="inline-flex flex-shrink-0 items-center gap-1.5 px-4 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50] transition-colors"
                                >
                                    <Plus size={14} /> Add
                                </button>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1.5">
                                Custom amenities are stored on this property only — they won&apos;t be offered to other {data.type} listings.
                            </p>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-6">
                        <h3 className="font-semibold text-[#0D1B3E] mb-4 pb-3 border-b border-[#F0F4F8]">Gallery & Website</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2 mt-1 border-t border-[#F0F4F8] pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-medium text-gray-600">Image Gallery <span className="text-gray-400">({totalImages}/15)</span></label>
                                    {totalImages < 15 && (
                                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E1E8F0] rounded-lg text-xs font-semibold text-[#0D1B3E] hover:bg-[#F7F9FC] transition-colors">
                                            <Plus size={13} /> Add Images
                                            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addPicks(e.target.files)} />
                                        </label>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {existing.map((img) => (
                                        <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-[#E1E8F0] bg-[#F7F9FC]">
                                            <img src={img.path} alt="" className="w-full h-full object-cover" />
                                            {coverKey === `e:${img.id}` && (
                                                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-gold-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold">COVER</span>
                                            )}
                                            <button type="button" onClick={() => setCoverKey(`e:${img.id}`)} title="Set as cover" className={`absolute top-1.5 left-1.5 p-1 rounded-md text-white bg-black/40 hover:bg-gold-500 transition-colors ${coverKey === `e:${img.id}` ? 'bg-gold-500' : ''}`}>
                                                <Star size={12} fill={coverKey === `e:${img.id}` ? 'currentColor' : 'none'} />
                                            </button>
                                            <button type="button" onClick={() => removeExisting(img)} title="Remove" className="absolute top-1.5 right-1.5 p-1 rounded-md text-white bg-black/40 hover:bg-red-500 transition-colors">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {picks.map((p) => (
                                        <div key={p.key} className="relative aspect-square rounded-lg overflow-hidden border border-[#E1E8F0] bg-[#F7F9FC]">
                                            <img src={p.preview} alt="" className="w-full h-full object-cover" />
                                            {coverKey === `n:${p.key}` && (
                                                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-gold-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold">COVER</span>
                                            )}
                                            <button type="button" onClick={() => setCoverKey(`n:${p.key}`)} title="Set as cover" className={`absolute top-1.5 left-1.5 p-1 rounded-md text-white bg-black/40 hover:bg-gold-500 transition-colors ${coverKey === `n:${p.key}` ? 'bg-gold-500' : ''}`}>
                                                <Star size={12} fill={coverKey === `n:${p.key}` ? 'currentColor' : 'none'} />
                                            </button>
                                            <button type="button" onClick={() => removePick(p.key)} title="Remove" className="absolute top-1.5 right-1.5 p-1 rounded-md text-white bg-black/40 hover:bg-red-500 transition-colors">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {totalImages < 15 && (
                                        <label className="cursor-pointer aspect-square rounded-lg border border-dashed border-[#E1E8F0] bg-[#F7F9FC] flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-gold-400/60 hover:bg-gold-50/40 transition-colors">
                                            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addPicks(e.target.files)} />
                                            <Plus size={18} />
                                            <span className="text-[10px] font-medium">Add</span>
                                        </label>
                                    )}
                                </div>
                                {totalImages > 0 && (
                                    <p className="text-[11px] text-gray-400 mt-2">Tap the star to set the cover photo.</p>
                                )}
                            </div>
                            <div>
                                <label className={labelCls}>SEO Title</label>
                                <input value={data.seo_title} onChange={(e) => setData('seo_title', e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Meta Description</label>
                                <input value={data.meta_description} onChange={(e) => setData('meta_description', e.target.value)} className={inputCls} />
                            </div>
                            <label className="flex items-center gap-2.5 py-2 text-sm text-gray-700">
                                <input type="checkbox" checked={data.featured} onChange={(e) => setData('featured', e.target.checked as never)} className="rounded" />
                                Feature this property on website
                            </label>
                            <label className="flex items-center gap-2.5 py-2 text-sm text-gray-700">
                                <input type="checkbox" checked={data.is_website_visible} onChange={(e) => setData('is_website_visible', e.target.checked as never)} className="rounded" />
                                Visible on public website
                            </label>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pb-6">
                    <button type="button" onClick={back} disabled={step === 0} className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600 hover:bg-[#F7F9FC] disabled:opacity-40">
                        <ChevronLeft size={16} /> Back
                    </button>
                    {step < steps.length - 1 ? (
                        <button type="button" onClick={next} className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50] transition-colors">
                            Next <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button type="submit" disabled={processing} className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-gold-500 text-white rounded-lg text-sm font-semibold hover:bg-gold-600 transition-colors disabled:opacity-60">
                            {processing ? 'Saving...' : isEdit ? 'Update Property' : 'Create Property'}
                        </button>
                    )}
                </div>
            </form>
        </AdminLayout>
    );
}
