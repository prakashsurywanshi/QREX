import { useForm, Head, Link } from '@inertiajs/react';
import PublicLayout from '@/components/layout/PublicLayout';
import PropertyCard from '@/components/shared/PropertyCard';
import {
    Search, Star, Phone, ChevronRight, Building2, Users, Trophy, TrendingUp,
    Check, ArrowRight, Quote, MapPin,
} from 'lucide-react';
import type { Property, PageProps } from '@/types';

interface HomePageProps extends PageProps {
    featuredProperties: Property[];
    latestProperties: Property[];
    agents: { id: number; name: string; role: string; branch: string; initials: string }[];
    categoryCounts: Record<string, number>;
    stats: { properties: number; deals: number; customers: number; clients: number; years: number; revenue: string };
}

export default function Home(props: HomePageProps) {
    const { featuredProperties, latestProperties, agents, categoryCounts, stats } = props;
    const { data, setData } = useForm({
        search: '',
        type: 'All',
        city: 'All',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (data.search) params.search = data.search;
        if (data.type !== 'All') params.type = data.type;
        if (data.city !== 'All') params.city = data.city;
        const qs = new URLSearchParams(params).toString();
        window.location.href = '/properties' + (qs ? '?' + qs : '');
    };

    const cities = ['All', 'Mumbai', 'Bangalore', 'Pune', 'Gurugram'];
    const types = ['All', 'Apartment', 'Villa', 'Plot', 'Commercial'];

    const categories = [
        { name: 'Apartments', count: 5, image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format', type: 'Apartment' },
        { name: 'Villas', count: 1, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop&auto=format', type: 'Villa' },
        { name: 'Plots & Land', count: 1, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop&auto=format', type: 'Plot' },
        { name: 'Commercial', count: 1, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&auto=format', type: 'Commercial' },
    ];

    const testimonials = [
        { name: 'Rohan Mehta', role: 'Purchased 3BHK, Powai', quote: 'From the first site visit to the final registration, the team made the entire process completely transparent and stress-free.', initials: 'RM' },
        { name: 'Ananya Sharma', role: 'Invested in Commercial, BKC', quote: 'The market insights and due diligence they provided helped me make a confident investment decision. Highly professional.', initials: 'AS' },
        { name: 'Kiran Patel', role: 'Rented Office, Mumbai', quote: 'Fast, reliable and genuinely helpful. They understood exactly what our business needed and found the perfect space.', initials: 'KP' },
    ];

    return (
        <PublicLayout>
            <Head title="QREX" />

            {/* Hero */}
            <section className="relative min-h-[88vh] flex items-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url(https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&h=900&fit=crop&auto=format)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B3E]/95 via-[#0D1B3E]/70 to-[#0D1B3E]/30" />
                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-20">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-500/40 text-gold-300 px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
                            <Star size={13} fill="currentColor" />
                            Trusted by 1,200+ Happy Clients
                        </div>
                        <h1 className="font-serif text-white text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                            Find Your Dream Home in <span className="text-gold-400">Premium India</span>
                        </h1>
                        <p className="text-blue-100/80 text-lg leading-relaxed mb-9">
                            From luxury apartments to commercial landmarks, NestPrime connects you with the finest curated properties across Mumbai, Bangalore, Pune &amp; Gurugram.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/properties" className="px-7 py-3.5 bg-gold-500 text-white rounded-lg font-semibold hover:bg-gold-600 transition-colors flex items-center gap-2">
                                Explore Properties <ArrowRight size={16} />
                            </Link>
                            <Link href="/contact" className="px-7 py-3.5 bg-white/10 backdrop-blur border border-white/30 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors flex items-center gap-2">
                                <Phone size={16} /> Talk to Advisor
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Search Bar */}
            <section className="relative z-20 -mt-20 mb-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <form onSubmit={submit} className="bg-white rounded-2xl shadow-2xl border border-[#E1E8F0] p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="lg:col-span-2">
                            <label className="block text-xs text-gray-500 mb-1.5"><Search size={12} className="inline mr-1" />Search</label>
                            <input
                                value={data.search}
                                onChange={(e) => setData('search', e.target.value)}
                                placeholder="Search by city, project, or keyword"
                                className="w-full px-4 py-3 bg-[#F7F9FC] border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1.5">Property Type</label>
                            <select value={data.type} onChange={(e) => setData('type', e.target.value)} className="w-full px-4 py-3 bg-[#F7F9FC] border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30">
                                {types.map((t) => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1.5">City</label>
                            <select value={data.city} onChange={(e) => setData('city', e.target.value)} className="w-full px-4 py-3 bg-[#F7F9FC] border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30">
                                {cities.map((c) => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="lg:col-span-4">
                            <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50] transition-colors">
                                <Search size={15} /> Search
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Stats */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Properties Listed', value: String(stats.properties), icon: Building2 },
                        { label: 'Successful Deals', value: String(stats.deals), icon: Trophy },
                        { label: 'Happy Clients', value: String(stats.clients), icon: Users },
                        { label: 'Years Experience', value: String(stats.years), icon: TrendingUp },
                    ].map((s, i) => (
                        <div key={i} className="text-center bg-[#F7F9FC] rounded-2xl p-6">
                            <s.icon size={26} className="mx-auto text-gold-500 mb-3" />
                            <div className="text-3xl font-bold text-[#0D1B3E]">{s.value}</div>
                            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Properties */}
            {featuredProperties.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-20">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-2 text-gold-600 text-sm font-semibold mb-2"><Star size={15} fill="currentColor" /> Featured</div>
                            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D1B3E]">Featured Properties</h2>
                        </div>
                        <Link href="/properties" className="hidden sm:flex items-center gap-1.5 text-[#0D1B3E] font-semibold text-sm hover:text-gold-600">
                            View All <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredProperties.map((p) => <PropertyCard key={p.id} property={p} />)}
                    </div>
                </section>
            )}

            {/* Categories */}
            <section className="bg-[#0D1B3E] py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-10">
                        <div className="text-gold-400 text-sm font-semibold mb-2">Explore By Category</div>
                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">Browse Property Types</h2>
                        <p className="text-blue-200/70 mt-3">Find exactly what you're looking for across all property categories</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((c) => (
                            <Link href={`/properties?type=${encodeURIComponent(c.type)}`} key={c.name} className="group relative rounded-2xl overflow-hidden h-64">
                                <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B3E]/90 via-[#0D1B3E]/30 to-transparent" />
                                <div className="absolute bottom-0 inset-x-0 p-5">
                                    <h3 className="text-white font-bold text-lg">{c.name}</h3>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-blue-200/80 text-sm">{c.count} {c.count === 1 ? 'Property' : 'Properties'}</span>
                                        <span className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center group-hover:bg-white group-hover:text-[#0D1B3E] transition-colors">
                                            <ArrowRight size={15} />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Latest Properties */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <div className="text-gold-600 text-sm font-semibold mb-2">Just Added</div>
                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D1B3E]">Latest Listings</h2>
                    </div>
                    <Link href="/properties" className="hidden sm:flex items-center gap-1.5 text-[#0D1B3E] font-semibold text-sm hover:text-gold-600">
                        View All <ChevronRight size={16} />
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {latestProperties.map((p) => <PropertyCard key={p.id} property={p} />)}
                </div>
            </section>

            {/* About / Why Choose Us */}
            <section className="bg-[#F7F9FC] py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                    <div className="relative">
                        <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=700&h=520&fit=crop&auto=format" alt="NestPrime team" className="rounded-2xl w-full h-[440px] object-cover" />
                        <div className="absolute -bottom-6 right-6 bg-[#0D1B3E] text-white rounded-2xl p-6 shadow-2xl">
                            <div className="text-3xl font-bold text-gold-400">12+</div>
                            <div className="text-blue-200/80 text-sm">Years of Excellence<br />in Real Estate</div>
                        </div>
                    </div>
                    <div>
                        <div className="text-gold-600 text-sm font-semibold mb-2">Why Choose NestPrime</div>
                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D1B3E] leading-tight mb-6">
                            A Legacy of Trust, Transparency &amp; Exceptional Service
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-8">
                            For over a decade, NestPrime has helped thousands of families and businesses find the perfect property. Our deep market knowledge, verified listings, and end-to-end support make the journey seamless.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {[
                                { title: 'Verified Listings', desc: 'Every property is physically verified by our team.' },
                                { title: 'Expert Advisors', desc: 'Dedicated specialists for every property type.' },
                                { title: 'Transparent Pricing', desc: 'No hidden costs. Clear, honest every step.' },
                                { title: 'End-to-End Support', desc: 'From site visits to registration, we handle it all.' },
                            ].map((f) => (
                                <div key={f.title} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gold-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check size={15} className="text-gold-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-[#0D1B3E] text-sm">{f.title}</h4>
                                        <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link href="/about" className="inline-flex items-center gap-2 mt-9 px-6 py-3 bg-[#0D1B3E] text-white rounded-lg font-semibold hover:bg-[#1A2B50] transition-colors">
                            Learn More About Us <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Agents */}
            {agents.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
                    <div className="text-center mb-10">
                        <div className="text-gold-600 text-sm font-semibold mb-2">Meet Our Team</div>
                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D1B3E]">Our Expert Agents</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {agents.map((a) => (
                            <div key={a.id} className="bg-white rounded-2xl border border-[#E1E8F0] p-6 text-center hover:shadow-lg transition-shadow">
                                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#0D1B3E] to-gold-500 flex items-center justify-center text-white text-xl font-bold mb-4">
                                    {a.initials}
                                </div>
                                <h3 className="font-semibold text-[#0D1B3E]">{a.name}</h3>
                                <p className="text-gold-600 text-xs font-medium mt-1">{a.role}</p>
                                <p className="text-gray-400 text-xs mt-1 flex items-center justify-center gap-1"><MapPin size={11} /> {a.branch}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Testimonials */}
            <section className="bg-[#F7F9FC] py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-10">
                        <div className="text-gold-600 text-sm font-semibold mb-2">Client Stories</div>
                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D1B3E]">What Our Clients Say</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t) => (
                            <div key={t.name} className="bg-white rounded-2xl border border-[#E1E8F0] p-7">
                                <Quote size={30} className="text-gold-400 mb-4" />
                                <p className="text-gray-600 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-full bg-[#0D1B3E] text-gold-400 flex items-center justify-center font-bold">{t.initials}</div>
                                    <div>
                                        <div className="font-semibold text-[#0D1B3E] text-sm">{t.name}</div>
                                        <div className="text-gray-400 text-xs">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
                <div className="relative rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-[#0D1B3E]" />
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=400&fit=crop&auto=format)" }} />
                    <div className="relative z-10 px-8 py-14 sm:px-16 text-center">
                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Find Your Perfect Property?</h2>
                        <p className="text-blue-200/70 max-w-xl mx-auto mb-8">Book a free consultation with our real estate experts today.</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/contact" className="px-8 py-3.5 bg-gold-500 text-white rounded-lg font-semibold hover:bg-gold-600 transition-colors">
                                Get Free Consultation
                            </Link>
                            <a href="tel:+919810001111" className="px-8 py-3.5 bg-white/10 backdrop-blur border border-white/30 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors">
                                Call +91 98100 01111
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
