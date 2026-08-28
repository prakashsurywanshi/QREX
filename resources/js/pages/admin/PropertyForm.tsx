import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import { ChevronLeft, ChevronRight, ImagePlus, Check } from 'lucide-react';
import type { Property } from '@/types';

type Agent = { id: number; name: string };

interface Props {
    property: Property | null;
    agents: Agent[];
    errors?: Record<string, string>;
    flash?: { success?: string; error?: string };
    auth?: unknown;
}

const types = ['Apartment', 'Villa', 'Plot', 'Commercial', 'Office', 'Shop', 'Warehouse', 'Farm/Land', 'Other'];
const transactionTypes = ['Buy', 'Rent', 'Lease'];
const statuses = ['Available', 'Reserved', 'Under Negotiation', 'Sold', 'Draft', 'Rented', 'Inactive'];
const furnishing = ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'];

const amenityOptions = [
    'Swimming Pool', 'Gym', 'Garden', 'Clubhouse', 'Security', 'CCTV', 'Lift', 'Power Backup',
    'Parking', 'Sea View', 'Lake View', 'Children\'s Play Area', 'Spa', 'Concierge', 'Jogging Track',
    'High-speed Fiber', 'Conference Room', 'Cafeteria', '24hr AC', 'Private Terrace', 'Private Pool',
];

const steps = [
    { title: 'Basic Info', desc: 'Title, type & status' },
    { title: 'Pricing & Specs', desc: 'Price, size & rooms' },
    { title: 'Location', desc: 'Address details' },
    { title: 'Amenities', desc: 'Features & facilities' },
    { title: 'Image & Website', desc: 'Media & visibility' },
];

export default function PropertyForm(props: Props) {
    const { property, agents } = props;
    const isEdit = !!property;

    const [step, setStep] = useState(0);
    const [amenities, setAmenities] = useState<string[]>(property?.amenities || []);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>(property?.image || '');
    const { data, setData, post, put, processing, errors } = useForm<Record<string, any>>({
        title: property?.title || '',
        type: property?.type || 'Apartment',
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
        image: property?.image || '',
        amenities: property?.amenities || [],
        featured: property?.featured || false,
        is_website_visible: property?.is_website_visible ?? true,
        seo_title: property?.seo_title || '',
        meta_description: property?.meta_description || '',
        agent_id: property?.agent_id || '',
    });

    const toggleAmenity = (a: string) => {
        const next = amenities.includes(a) ? amenities.filter((x) => x !== a) : [...amenities, a];
        setAmenities(next);
        setData('amenities', next as never[]);
    };

    const next = (e: React.MouseEvent) => {
        e.preventDefault();
        if (step < steps.length - 1) setStep(step + 1);
    };
    const back = (e: React.MouseEvent) => {
        e.preventDefault();
        if (step > 0) setStep(step - 1);
    };

    const handleImageFile = (file: File | undefined) => {
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setData('image', file as never);
    };

    const clearImageFile = () => {
        setImageFile(null);
        setImagePreview(property?.image || '');
        setData('image', property?.image || '');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
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
                                <select value={data.type} onChange={(e) => setData('type', e.target.value)} className={inputCls}>
                                    {types.map((t) => <option key={t}>{t}</option>)}
                                </select>
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
                        <h3 className="font-semibold text-[#0D1B3E] mb-4 pb-3 border-b border-[#F0F4F8]">Pricing & Specifications</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className={labelCls}>Price (₹) *</label>
                                <input type="number" value={data.price} onChange={(e) => setData('price', e.target.value as never)} required className={inputCls} placeholder="18500000" />
                            </div>
                            <div>
                                <label className={labelCls}>Area (sq.ft) *</label>
                                <input type="number" value={data.area} onChange={(e) => setData('area', e.target.value as never)} required className={inputCls} placeholder="1450" />
                            </div>
                            <div>
                                <label className={labelCls}>Furnishing</label>
                                <select value={data.furnishing} onChange={(e) => setData('furnishing', e.target.value)} className={inputCls}>
                                    {furnishing.map((f) => <option key={f}>{f}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Bedrooms</label>
                                <input type="number" value={data.bedrooms} onChange={(e) => setData('bedrooms', e.target.value as never)} className={inputCls} placeholder="3" />
                            </div>
                            <div>
                                <label className={labelCls}>Bathrooms</label>
                                <input type="number" value={data.bathrooms} onChange={(e) => setData('bathrooms', e.target.value as never)} className={inputCls} placeholder="2" />
                            </div>
                            <div>
                                <label className={labelCls}>Total Floors</label>
                                <input type="number" value={data.floors} onChange={(e) => setData('floors', e.target.value as never)} className={inputCls} placeholder="1" />
                            </div>
                            <div>
                                <label className={labelCls}>Parking Slots</label>
                                <input type="number" value={data.parking} onChange={(e) => setData('parking', e.target.value as never)} className={inputCls} placeholder="1" />
                            </div>
                            <div>
                                <label className={labelCls}>Possession Date</label>
                                <input value={data.possession_date} onChange={(e) => setData('possession_date', e.target.value)} className={inputCls} placeholder="Dec 2026" />
                            </div>
                        </div>
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
                        <h3 className="font-semibold text-[#0D1B3E] mb-4 pb-3 border-b border-[#F0F4F8]">Amenities</h3>
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
                                        {active ? a : a}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-6">
                        <h3 className="font-semibold text-[#0D1B3E] mb-4 pb-3 border-b border-[#F0F4F8]">Image & Website</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className={labelCls}>Property Image</label>
                                <div className="flex gap-3">
                                    <label className="cursor-pointer w-28 h-28 rounded-lg border border-dashed border-[#E1E8F0] bg-[#F7F9FC] flex items-center justify-center hover:border-gold-400/60 hover:bg-gold-50/40 transition-colors overflow-hidden shrink-0">
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e.target.files?.[0])} />
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center text-gray-400 gap-1">
                                                <ImagePlus size={20} />
                                                <span className="text-[10px] font-medium">Add Image</span>
                                            </div>
                                        )}
                                    </label>
                                    <div className="flex-1 space-y-2">
                                        <div className="text-xs text-gray-500">{imageFile ? `Selected: ${imageFile.name}` : (data.image && typeof data.image === 'string' ? 'Using image URL below' : 'No image selected')}</div>
                                        <input value={typeof data.image === 'string' ? data.image : ''} onChange={(e) => { setData('image', e.target.value); setImageFile(null); }} className={inputCls} placeholder="...or paste an image URL" />
                                        {imageFile && (
                                            <button type="button" onClick={clearImageFile} className="text-xs font-semibold text-red-500 hover:underline">Remove uploaded image</button>
                                        )}
                                    </div>
                                </div>
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
