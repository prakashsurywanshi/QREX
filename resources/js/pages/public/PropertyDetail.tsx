import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import PublicLayout from '@/components/layout/PublicLayout';
import PropertyCard from '@/components/shared/PropertyCard';
import {
    MapPin, Bed, Bath, Maximize, ChevronRight, Check, Phone, Mail,
    Building2, CalendarClock, Armchair, CarFront, Layers, Star, ArrowLeft, Send,
} from 'lucide-react';
import type { Property, PageProps } from '@/types';

interface Props extends PageProps {
    property: Property;
    similar: Property[];
    agent: { name: string; phone: string; email: string; role: string; initials: string } | null;
}

export default function PropertyDetail(props: Props) {
    const { property, similar, agent } = props;
    const [activeImage, setActiveImage] = useState(0);
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        email: '',
        message: 'I am interested in this property. Please contact me.',
    });

    const images = property.images?.length
        ? property.images.map((i: any) => i.image)
        : [property.image, property.image, property.image, property.image];

    const submitEnquiry = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/properties/${property.id}/enquiry`);
    };

    const amenities = property.amenities || [];

    return (
        <PublicLayout>
            <Head title={`${property.title} — QREX`} />

            {/* Breadcrumb */}
            <section className="bg-[#0D1B3E] pt-16 pb-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <nav className="flex items-center gap-2 text-sm text-blue-200/70 mb-4">
                        <Link href="/" className="hover:text-white">Home</Link>
                        <ChevronRight size={14} />
                        <Link href="/properties" className="hover:text-white">Properties</Link>
                        <ChevronRight size={14} />
                        <span className="text-gold-400">{property.type}</span>
                    </nav>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">{property.title}</h1>
                            <p className="flex items-center gap-1.5 text-blue-200/70 text-sm mt-2">
                                <MapPin size={14} /> {property.location}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-gold-400">{property.price_label}</div>
                            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300">
                                {property.status}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left - Gallery & Details */}
                <div className="lg:col-span-2">
                    {/* Gallery */}
                    <div className="rounded-2xl overflow-hidden bg-[#0D1B3E]">
                        <img src={images[activeImage]} alt={property.title} className="w-full h-[420px] object-cover" />
                        <div className="grid grid-cols-4 gap-2 p-3">
                            {images.slice(0, 4).map((img: string, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`overflow-hidden rounded-lg h-20 ${activeImage === i ? 'ring-2 ring-gold-400' : 'opacity-70 hover:opacity-100'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Specs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                        {[
                            { icon: Bed, label: 'Bedrooms', value: property.bedrooms > 0 ? `${property.bedrooms} BHK` : '—' },
                            { icon: Bath, label: 'Bathrooms', value: property.bathrooms > 0 ? String(property.bathrooms) : '—' },
                            { icon: Maximize, label: 'Built-up Area', value: `${property.area} sq.ft` },
                            { icon: CarFront, label: 'Parking', value: `${property.parking} Slot` },
                        ].map((s, i) => (
                            <div key={i} className="bg-[#F7F9FC] rounded-xl p-4 text-center">
                                <s.icon size={20} className="mx-auto text-gold-500 mb-2" />
                                <div className="text-[#0D1B3E] font-semibold text-sm">{s.value}</div>
                                <div className="text-gray-400 text-xs mt-0.5">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Description */}
                    <div className="mt-8">
                        <h2 className="font-serif text-xl font-bold text-[#0D1B3E] mb-3">About This Property</h2>
                        <p className="text-gray-600 leading-relaxed">{property.description}</p>
                        {property.description && (
                            <p className="text-gray-600 leading-relaxed mt-4">
                                This {property.type.toLowerCase()} is offered by a trusted partner with full legal verification, clear titles, and transparent documentation. Located in a prime neighborhood with excellent connectivity to schools, hospitals, and commercial hubs.
                            </p>
                        )}
                    </div>

                    {/* Amenities */}
                    <div className="mt-8">
                        <h2 className="font-serif text-xl font-bold text-[#0D1B3E] mb-4">Amenities & Features</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {amenities.map((a: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 bg-[#F7F9FC] rounded-lg px-3 py-2.5">
                                    <Check size={15} className="text-gold-500 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{a}</span>
                                </div>
                            ))}
                            <div className="flex items-center gap-2 bg-[#F7F9FC] rounded-lg px-3 py-2.5">
                                <Check size={15} className="text-gold-500 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{property.furnishing}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-[#F7F9FC] rounded-lg px-3 py-2.5">
                                <Check size={15} className="text-gold-500 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{property.transaction_type}</span>
                            </div>
                        </div>
                    </div>

                    {/* Property Facts */}
                    <div className="mt-8">
                        <h2 className="font-serif text-xl font-bold text-[#0D1B3E] mb-4">Property Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                            {[
                                { label: 'Property Type', value: property.type },
                                { label: 'Transaction Type', value: property.transaction_type },
                                { label: 'Status', value: property.status },
                                { label: 'Possession', value: property.possession_date || '—' },
                                { label: 'Furnishing', value: property.furnishing || '—' },
                                { label: 'Total Floors', value: String(property.floors || 1) },
                                { label: 'City', value: property.city },
                                { label: 'Property ID', value: property.property_id },
                            ].map((f, i) => (
                                <div key={i} className="flex justify-between border-b border-[#F0F4F8] py-2.5">
                                    <span className="text-gray-400 text-sm">{f.label}</span>
                                    <span className="text-[#0D1B3E] font-medium text-sm text-right">{f.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right - Enquiry & Agent */}
                <div>
                    {/* Enquiry Form */}
                    <div className="bg-white rounded-2xl border border-[#E1E8F0] shadow-sm p-6 sticky top-24">
                        <h3 className="text-[#0D1B3E] font-bold text-lg mb-1">Interested in this property?</h3>
                        <p className="text-gray-500 text-sm mb-5">Fill in your details and our agents will get back to you.</p>

                        {errors.message && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">{errors.message}</div>
                        )}

                        <form onSubmit={submitEnquiry} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                                <input value={data.name} onChange={(e) => setData('name', e.target.value)} required className="w-full px-4 py-2.5 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" placeholder="Your name" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                                <input value={data.phone} onChange={(e) => setData('phone', e.target.value)} required className="w-full px-4 py-2.5 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" placeholder="+91 XXXXX XXXXX" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Email (optional)</label>
                                <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="w-full px-4 py-2.5 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" placeholder="you@example.com" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
                                <textarea value={data.message} onChange={(e) => setData('message', e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                            </div>
                            <button type="submit" disabled={processing} className="w-full flex items-center justify-center gap-2 bg-gold-500 text-white py-3 rounded-lg font-semibold hover:bg-gold-600 transition-colors disabled:opacity-60">
                                <Send size={15} /> {processing ? 'Submitting...' : 'Submit Enquiry'}
                            </button>
                        </form>
                    </div>

                    {/* Agent Card */}
                    {agent && (
                        <div className="bg-[#0D1B3E] rounded-2xl p-6 mt-5 text-white">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-lg font-bold">
                                    {agent.initials}
                                </div>
                                <div>
                                    <div className="font-semibold">{agent.name}</div>
                                    <div className="text-blue-200/70 text-xs">{agent.role}</div>
                                </div>
                            </div>
                            <div className="space-y-3 text-sm">
                                <a href={`tel:${agent.phone}`} className="flex items-center gap-3 text-blue-100 hover:text-gold-400 transition-colors">
                                    <Phone size={15} className="text-gold-400" /> {agent.phone}
                                </a>
                                <a href={`mailto:${agent.email}`} className="flex items-center gap-3 text-blue-100 hover:text-gold-400 transition-colors">
                                    <Mail size={15} className="text-gold-400" /> {agent.email}
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Similar Properties */}
            {similar.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
                    <h2 className="font-serif text-2xl font-bold text-[#0D1B3E] mb-6">Similar Properties</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {similar.map((p) => <PropertyCard key={p.id} property={p} />)}
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}
