import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/components/layout/PublicLayout';
import {
    MapPin, Check, Trophy, Users, Building2, TrendingUp, Target,
    Award, Handshake, ArrowRight, ShieldCheck, Sparkles,
} from 'lucide-react';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    agents: { id: number; name: string; role: string; branch: string; initials: string }[];
    stats: { properties: number; deals: number; customers: number; clients: number; years: number; revenue: string };
}

export default function About(props: Props) {
    const { agents, stats } = props;

    const milestones = [
        { year: '2014', title: 'The Beginning', desc: 'NestPrime founded in Mumbai with a vision to bring transparency to Indian real estate.' },
        { year: '2017', title: 'Expansion to Bangalore', desc: 'Opened our second branch and launched commercial advisory services.' },
        { year: '2020', title: '1,000+ Clients Served', desc: 'Crossed a major milestone with a 4.9★ average client rating.' },
        { year: '2024', title: 'Pune & Gurugram', desc: 'Expanded operations to four cities with a team of 40+ experts.' },
        { year: '2026', title: '₹100 Cr+ Sales', desc: 'Surpassed ₹100 crore in successful property transactions.' },
    ];

    const values = [
        { icon: ShieldCheck, title: 'Integrity', desc: 'Honest advice and complete transparency in every transaction.' },
        { icon: Sparkles, title: 'Excellence', desc: 'Uncompromising quality in every property we recommend.' },
        { icon: Users, title: 'Customer First', desc: 'Your needs and goals always come before anything else.' },
        { icon: Handshake, title: 'Partnership', desc: 'We build long-term relationships, not one-time deals.' },
    ];

    return (
        <PublicLayout>
            <Head title="About Us — QREX" />

            {/* Hero */}
            <section className="relative bg-[#0D1B3E] pt-20 pb-24 overflow-hidden">
                <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1400&h=500&fit=crop&auto=format)" }} />
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
                    <div className="text-gold-400 text-sm font-semibold mb-3">About NestPrime</div>
                    <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white leading-tight max-w-3xl mx-auto">
                        Building Trust in Real Estate, One <span className="text-gold-400">Successful Deal</span> at a Time
                    </h1>
                </div>
            </section>

            {/* Stats */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 relative z-20">
                <div className="bg-white rounded-2xl shadow-xl border border-[#E1E8F0] grid grid-cols-2 md:grid-cols-5 gap-6 p-8">
                    {[
                        { label: 'Properties', value: stats.properties },
                        { label: 'Deals Closed', value: stats.deals },
                        { label: 'Happy Clients', value: stats.clients },
                        { label: 'Years Experience', value: stats.years },
                        { label: 'Sales Revenue', value: stats.revenue },
                    ].map((s, i) => (
                        <div key={i} className="text-center">
                            <div className="text-3xl font-bold text-[#0D1B3E]">{s.value}</div>
                            <div className="text-gray-400 text-sm mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Our Story */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                <div>
                    <div className="text-gold-600 text-sm font-semibold mb-2">Our Story</div>
                    <h2 className="font-serif text-3xl font-bold text-[#0D1B3E] leading-tight mb-6">A Decade of Dedicated Real Estate Advisory</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        Founded in 2014, NestPrime began with a simple mission: to make the complex, fragmented Indian real estate market simple, transparent, and trustworthy for every buyer and investor.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        What started as a two-person advisory in Mumbai has grown into a full-service real estate firm spanning four major cities. Today, our team of 40+ specialists handles everything — residential, commercial, land, and investment advisory — with the same personal care we gave to our very first client.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                        Every property we recommend is physically verified, legally vetted, and priced transparently. It's not just our process — it's our promise.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {values.map((v, i) => (
                        <div key={i} className={`bg-[#F7F9FC] rounded-2xl p-6 ${i % 2 === 1 ? 'sm:mt-8' : ''}`}>
                            <div className="w-11 h-11 rounded-xl bg-[#0D1B3E] flex items-center justify-center mb-4">
                                <v.icon size={20} className="text-gold-400" />
                            </div>
                            <h3 className="font-semibold text-[#0D1B3E] mb-1.5">{v.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Milestones */}
            <section className="bg-[#F7F9FC] py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-12">
                        <div className="text-gold-600 text-sm font-semibold mb-2">Our Journey</div>
                        <h2 className="font-serif text-3xl font-bold text-[#0D1B3E]">Key Milestones</h2>
                    </div>
                    <div className="relative">
                        <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px bg-[#E1E8F0] sm:-translate-x-px" />
                        <div className="space-y-10">
                            {milestones.map((m, i) => (
                                <div key={m.year} className={`relative flex ${i % 2 === 0 ? 'sm:justify-start' : 'sm:justify-end'}`}>
                                    <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gold-500 ring-4 ring-white" />
                                    <div className={`ml-16 sm:ml-0 sm:w-[calc(50%-2.5rem)] ${i % 2 === 0 ? '' : ''} bg-white rounded-2xl border border-[#E1E8F0] p-5`}>
                                        <div className="text-gold-600 font-bold text-sm mb-1">{m.year}</div>
                                        <h3 className="font-semibold text-[#0D1B3E] mb-1">{m.title}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">{m.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Team */}
            {agents.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
                    <div className="text-center mb-12">
                        <div className="text-gold-600 text-sm font-semibold mb-2">Leadership Team</div>
                        <h2 className="font-serif text-3xl font-bold text-[#0D1B3E]">Meet Our Experts</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {agents.map((a, i) => (
                            <div key={a.id} className="bg-white rounded-2xl border border-[#E1E8F0] p-7 text-center hover:shadow-lg transition-shadow">
                                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#0D1B3E] to-gold-500 flex items-center justify-center text-white text-2xl font-bold mb-4">
                                    {a.initials}
                                </div>
                                <h3 className="font-semibold text-[#0D1B3E] text-lg">{a.name}</h3>
                                <p className="text-gold-600 text-sm font-medium mt-1">{a.role}</p>
                                <p className="text-gray-400 text-xs mt-1.5 flex items-center justify-center gap-1"><MapPin size={11} /> {a.branch}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
                <div className="bg-[#0D1B3E] rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=400&fit=crop&auto=format)" }} />
                    <div className="relative z-10">
                        <h2 className="font-serif text-3xl font-bold text-white mb-4">Let's Write Your Next Chapter Together</h2>
                        <p className="text-blue-200/70 max-w-xl mx-auto mb-8">Whether you're buying your first home or building an investment portfolio, our experts are ready to guide you.</p>
                        <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold-500 text-white rounded-lg font-semibold hover:bg-gold-600 transition-colors">
                            Get in Touch <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
