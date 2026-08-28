import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import {
    ChevronLeft, MapPin, Bed, Bath, Maximize, Star, CarFront, Clock,
    ArrowRightLeft, Pencil, Trash2, ExternalLink, Users,
} from 'lucide-react';
import type { Property, Lead, PageProps } from '@/types';

interface Props extends PageProps {
    property: Property;
    leads: Lead[];
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

export default function PropertyDetail(props: Props) {
    const { property, leads } = props;

    const destroy = () => {
        if (confirm(`Delete "${property.title}"? This cannot be undone.`)) {
            router.delete(`/admin/properties/${property.id}`, {
                onSuccess: () => window.location.href = '/admin/properties',
            });
        }
    };

    const amenities = property.amenities || [];

    return (
        <AdminLayout>
            <PageHeader
                title={property.title}
                subtitle={property.property_id}
                breadcrumbs={[{ label: 'Sales' }, { label: 'Properties', href: '/admin/properties' }, { label: property.property_id }]}
                actions={
                    <>
                        <Link href="/admin/properties" className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600 hover:bg-[#F7F9FC]">
                            <ChevronLeft size={16} /> Back
                        </Link>
                        <Link href={`/properties/${property.id}`} target="_blank" className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600 hover:bg-[#F7F9FC]">
                            <ExternalLink size={15} /> View Site
                        </Link>
                        <Link href={`/admin/properties/${property.id}/edit`} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50]">
                            <Pencil size={15} /> Edit
                        </Link>
                        <button onClick={destroy} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-red-200 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-50">
                            <Trash2 size={15} /> Delete
                        </button>
                    </>
                }
            />

            {/* Hero */}
            <div className="bg-white rounded-xl border border-[#E1E8F0] overflow-hidden mb-6">
                <div className="relative h-64 sm:h-80">
                    <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`status-badge ${statusColor[property.status] || 'bg-gray-100 text-gray-600'}`}>{property.status}</span>
                        <span className="status-badge bg-[#0D1B3E] text-white">{property.type}</span>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-[#0D1B3E]/90 text-white px-4 py-2 rounded-lg font-bold text-lg backdrop-blur">
                        {property.price_label}
                    </div>
                    {property.featured && (
                        <span className="absolute top-4 right-4 status-badge bg-gold-500 text-white">
                            <Star size={11} fill="currentColor" /> Featured
                        </span>
                    )}
                </div>
                <div className="p-5">
                    <p className="flex items-center gap-1.5 text-gray-500 text-sm"><MapPin size={15} /> {property.location}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick specs */}
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                        <h3 className="font-semibold text-[#0D1B3E] mb-4">Property Highlights</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                                { icon: Bed, label: 'Bedrooms', value: property.bedrooms > 0 ? `${property.bedrooms} BHK` : '—' },
                                { icon: Bath, label: 'Bathrooms', value: property.bathrooms > 0 ? String(property.bathrooms) : '—' },
                                { icon: Maximize, label: 'Area', value: `${property.area} sqft` },
                                { icon: CarFront, label: 'Parking', value: `${property.parking} slot` },
                                { icon: Clock, label: 'Possession', value: property.possession_date || '—' },
                                { icon: ArrowRightLeft, label: 'Transaction', value: property.transaction_type },
                            ].map((s, i) => (
                                <div key={i} className="bg-[#F7F9FC] rounded-lg p-3.5">
                                    <s.icon size={16} className="text-gold-500 mb-2" />
                                    <div className="text-[#0D1B3E] font-semibold text-sm">{s.value}</div>
                                    <div className="text-gray-400 text-xs">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                        <h3 className="font-semibold text-[#0D1B3E] mb-3">Description</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">{property.description}</p>
                    </div>

                    {/* Amenities */}
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                        <h3 className="font-semibold text-[#0D1B3E] mb-4">Amenities ({amenities.length})</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {amenities.map((a, i) => (
                                <div key={i} className="flex items-center gap-2 bg-[#F7F9FC] rounded-lg px-3 py-2 text-sm text-gray-700 text-[13px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500 flex-shrink-0" /> {a}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Leads */}
                    <div className="bg-white rounded-xl border border-[#E1E8F0]">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F4F8]">
                            <h3 className="font-semibold text-[#0D1B3E] flex items-center gap-2"><Users size={16} /> Interested Leads ({leads.length})</h3>
                            <Link href="/admin/leads" className="text-gold-600 text-xs font-semibold hover:text-gold-700">Manage Leads</Link>
                        </div>
                        <div className="divide-y divide-[#F0F4F8]">
                            {leads.map((l) => (
                                <Link key={l.id} href={`/admin/leads/${l.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-[#FAFBFD]">
                                    <div className="w-9 h-9 rounded-full bg-[#0D1B3E]/5 flex items-center justify-center text-xs font-bold text-[#0D1B3E]">
                                        {l.name?.split(' ').map(w => w[0]).slice(0, 2).join('')}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-[#0D1B3E] text-sm">{l.name}</div>
                                        <div className="text-gray-400 text-xs">{l.source} · {l.status}</div>
                                    </div>
                                    <span className="text-gold-600 text-xs">View →</span>
                                </Link>
                            ))}
                            {leads.length === 0 && (
                                <div className="px-5 py-8 text-center text-gray-400 text-sm">No leads yet for this property</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Agent */}
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                        <h3 className="font-semibold text-[#0D1B3E] mb-4">Listed By</h3>
                        {property.agent ? (
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0D1B3E] to-gold-500 flex items-center justify-center text-white font-bold">
                                    {property.agent.initials}
                                </div>
                                <div>
                                    <div className="font-medium text-[#0D1B3E] text-sm">{property.agent.name}</div>
                                    <div className="text-gray-400 text-xs">{property.agent.role}</div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm">No agent assigned</p>
                        )}
                    </div>

                    {/* Details */}
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                        <h3 className="font-semibold text-[#0D1B3E] mb-4">Property Details</h3>
                        <div className="space-y-2.5">
                            {[
                                { label: 'Property ID', value: property.property_id },
                                { label: 'Type', value: property.type },
                                { label: 'Furnishing', value: property.furnishing || '—' },
                                { label: 'Pages', value: String(property.floors || 1) },
                                { label: 'City', value: property.city },
                                { label: 'State', value: property.state },
                                { label: 'Country', value: property.country },
                                { label: 'Pincode', value: property.pincode || '—' },
                                { label: 'Website Visible', value: property.is_website_visible ? 'Yes' : 'No' },
                            ].map((f) => (
                                <div key={f.label} className="flex justify-between text-sm border-b border-[#F0F4F8] pb-2">
                                    <span className="text-gray-400">{f.label}</span>
                                    <span className="font-medium text-[#0D1B3E] text-right">{f.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
