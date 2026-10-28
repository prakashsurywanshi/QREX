import { Link } from '@inertiajs/react';
import { MapPin, Bed, Bath, Maximize, Star } from 'lucide-react';
import type { Property } from '@/types';
import { inrLabel, PLACEHOLDER_IMAGE } from '@/lib/utils';

interface PropertyCardProps {
    property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
    const cover = property.images?.find((i) => i.is_cover)?.path ?? property.images?.[0]?.path ?? PLACEHOLDER_IMAGE;

    return (
        <Link
            href={`/properties/${property.public_id}`}
            className="group bg-white rounded-2xl overflow-hidden border border-[#E1E8F0] hover:shadow-xl transition-shadow"
        >
            <div className="relative h-52 overflow-hidden">
                <img
                    src={cover}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {property.featured && (
                    <span className="absolute top-3 left-3 flex items-center gap-1 bg-gold-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                        <Star size={12} fill="currentColor" /> Featured
                    </span>
                )}
                <span className="absolute bottom-3 left-3 bg-[#0D1B3E]/85 text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur">
                    {inrLabel(property.price)}
                </span>
                <span className="absolute top-3 right-3 bg-emerald-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                    {property.status}
                </span>
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-[#0D1B3E] text-base leading-snug group-hover:text-gold-600 transition-colors">
                    {property.title}
                </h3>
                <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1.5">
                    <MapPin size={13} />
                    <span>{property.location}</span>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#F0F4F8] text-gray-500 text-xs">
                    {property.bedrooms > 0 && (
                        <span className="flex items-center gap-1"><Bed size={14} /> {property.bedrooms} BHK</span>
                    )}
                    {property.bathrooms > 0 && (
                        <span className="flex items-center gap-1"><Bath size={14} /> {property.bathrooms}</span>
                    )}
                    <span className="flex items-center gap-1"><Maximize size={14} /> {property.area} sqft</span>
                    <span className="ml-auto text-xs font-medium text-gold-600">{property.type}</span>
                </div>
            </div>
        </Link>
    );
}
