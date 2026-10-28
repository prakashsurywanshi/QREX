import { useState, type ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { usePage } from '@/hooks/usePage';
import Flash from '@/components/shared/Flash';
import {
    Building2, Phone, Mail, MapPin, Menu, X, ChevronRight, Share2, Globe, MessageSquare,
} from 'lucide-react';

const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Properties', href: '/properties' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
];

interface PublicLayoutProps {
    children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    const { site, app } = usePage();
    const agencyName = site?.project_name || site?.agency_name || 'QREX';
    const logoUrl = app?.logo;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white">
            <Flash />
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                            {logoUrl ? (
                                <img src={logoUrl} alt={agencyName} className="w-full h-full object-contain" />
                            ) : (
                                <Building2 size={20} className="text-[#0D1B3E]" />
                            )}
                        </div>
                        <div>
                            <div className="font-bold text-[#0D1B3E] text-lg leading-tight">{agencyName}</div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-widest truncate max-w-[200px]">{site?.tagline || 'Real Estate Advisory'}</div>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-gray-700 hover:text-[#0D1B3E] transition-colors relative group"
                            >
                                {link.label}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-500 transition-all group-hover:w-full" />
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-3">
                        <Link
                            href="/admin/dashboard"
                            className="px-5 py-2.5 border border-[#0D1B3E] text-[#0D1B3E] rounded-lg text-sm font-semibold hover:bg-[#0D1B3E] hover:text-white transition-colors"
                        >
                            Login
                        </Link>
                        <Link
                            href="/properties"
                            className="px-5 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50] transition-colors flex items-center gap-1.5"
                        >
                            Enquire Now <ChevronRight size={14} />
                        </Link>
                    </div>

                    <button className="md:hidden p-2 text-[#0D1B3E]" onClick={() => setMobileOpen(true)}>
                        <Menu size={24} />
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-gray-100 bg-white">
                        <div className="px-4 py-4 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="block px-3 py-2.5 text-gray-700 hover:bg-[#F8FAFD] rounded-lg"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-2 flex gap-3">
                                <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2.5 border border-[#0D1B3E] text-[#0D1B3E] rounded-lg text-sm font-semibold">Login</Link>
                                <Link href="/properties" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold">Enquire</Link>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Body */}
            <div className="pt-18">{children}</div>

            {/* Footer */}
            <footer className="bg-[#0D1B3E] text-white mt-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                        <div>
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center">
                                    <Building2 size={20} className="text-white" />
                                </div>
                                <div>
                                    <div className="font-bold text-lg leading-tight">{agencyName}</div>
                                    <div className="text-[10px] text-blue-200/60 uppercase tracking-widest">{site?.tagline || 'Real Estate'}</div>
                                </div>
                            </div>
                            <p className="text-blue-200/70 text-sm leading-relaxed">
                                QREX advisory serving Mumbai, Bangalore, Pune & Gurugram for over 12 years.
                            </p>
                            <div className="flex gap-3">
                                {[Share2, Globe, MessageSquare].map((Icon, i) => (
                                    <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold-500 transition-colors">
                                        <Icon size={16} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gold-400">Quick Links</h4>
                            <ul className="space-y-2.5 text-blue-200/70 text-sm">
                                {['Home', 'Properties', 'About Us', 'Contact', 'Login'].map((l, i) => (
                                    <li key={l}><a href="#" className="hover:text-white">{l}</a></li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gold-400">Property Types</h4>
                            <ul className="space-y-2.5 text-blue-200/70 text-sm">
                                {['Apartments', 'Villas', 'Plots', 'Commercial', 'Offices'].map((l) => (
                                    <li key={l}><a href="#" className="hover:text-white">{l}</a></li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gold-400">Contact</h4>
                            <ul className="space-y-3 text-blue-200/70 text-sm">
                                <li className="flex gap-2.5"><MapPin size={16} className="text-gold-400 flex-shrink-0" /> {site?.address || '2nd Floor, Oberoi Mall Annexe, Andheri West, Mumbai 400053'}</li>
                                <li className="flex gap-2.5"><Phone size={16} className="text-gold-400 flex-shrink-0" /> {site?.contact_phone || '+91 98100 01111'}</li>
                                <li className="flex gap-2.5"><Mail size={16} className="text-gold-400 flex-shrink-0" /> {site?.contact_email || 'hello@example.in'}</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-blue-200/50 text-xs">
                        <span>© {new Date().getFullYear()} QODEIGENCE, Inc. All rights reserved.</span>
                        <span>RERA Reg. No. A51700038472</span>
                    </div>
                    <div className="pt-3 text-center text-blue-200/40 text-xs">
                        Designed and maintained by QODEIGENCE
                    </div>
                </div>
            </footer>
        </div>
    );
}
