import { useForm, Head } from '@inertiajs/react';
import PublicLayout from '@/components/layout/PublicLayout';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import type { PageProps } from '@/types';

interface Props extends PageProps {}

export default function Contact(props: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        email: '',
        subject: '',
        message: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/contact/enquiry');
    };

    const officeInfo = [
        { icon: MapPin, title: 'Head Office', lines: ['2nd Floor, Oberoi Mall Annexe', 'Andheri West, Mumbai 400053'] },
        { icon: Phone, title: 'Phone', lines: ['+91 98100 01111', '+91 22 2684 1100'] },
        { icon: Mail, title: 'Email', lines: ['hello@example.com', 'sales@example.com'] },
        { icon: Clock, title: 'Working Hours', lines: ['Mon – Sat: 9:00 AM – 8:00 PM', 'Sunday: By Appointment'] },
    ];

    const branches = [
        { city: 'Mumbai', address: 'Oberoi Mall Annexe, Andheri West', phone: '+91 98100 01111' },
        { city: 'Bangalore', address: 'Orion, Whitefield Main Road', phone: '+91 98450 01111' },
        { city: 'Pune', address: 'Marisoft III, Kalyani Nagar', phone: '+91 98230 01111' },
        { city: 'Gurugram', address: 'Cyber Park, Sector 39', phone: '+91 98110 01111' },
    ];

    return (
        <PublicLayout>
            <Head title="Contact Us — QREX" />

            {/* Hero */}
            <section className="bg-[#0D1B3E] pt-20 pb-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                    <div className="text-gold-400 text-sm font-semibold mb-3">Contact Us</div>
                    <h1 className="font-serif text-4xl font-bold text-white">We're Here to Help</h1>
                    <p className="text-blue-200/70 max-w-xl mx-auto mt-3">Have a question or ready to make a move? Reach out and our team will get back to you within 24 hours.</p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Office info */}
                <div className="lg:col-span-2 space-y-4">
                    {officeInfo.map((o, i) => (
                        <div key={i} className="bg-[#F7F9FC] rounded-2xl p-6 flex gap-4">
                            <div className="w-11 h-11 rounded-xl bg-[#0D1B3E] flex items-center justify-center flex-shrink-0">
                                <o.icon size={19} className="text-gold-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#0D1B3E] mb-1.5">{o.title}</h3>
                                {o.lines.map((l, j) => (
                                    <p key={j} className="text-gray-500 text-sm">{l}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Form */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl border border-[#E1E8F0] shadow-sm p-8">
                        <h2 className="text-xl font-bold text-[#0D1B3E] mb-1">Send Us a Message</h2>
                        <p className="text-gray-500 text-sm mb-6">We'd love to hear from you. Fill out the form below.</p>

                        {errors.message && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">{errors.message}</div>
                        )}

                        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Full Name *</label>
                                <input value={data.name} onChange={(e) => setData('name', e.target.value)} required className="w-full px-4 py-2.5 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" placeholder="Your name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Phone Number *</label>
                                <input value={data.phone} onChange={(e) => setData('phone', e.target.value)} required className="w-full px-4 py-2.5 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" placeholder="+91 XXXXX XXXXX" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Email Address</label>
                                <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="w-full px-4 py-2.5 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" placeholder="you@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Subject</label>
                                <select value={data.subject} onChange={(e) => setData('subject', e.target.value)} className="w-full px-4 py-2.5 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30">
                                    <option value="">Select a subject</option>
                                    <option>Buying a Property</option>
                                    <option>Selling a Property</option>
                                    <option>Renting / Leasing</option>
                                    <option>Site Visit Request</option>
                                    <option>Investment Advisory</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Message</label>
                                <textarea value={data.message} onChange={(e) => setData('message', e.target.value)} rows={4} className="w-full px-4 py-2.5 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" placeholder="How can we help you?" />
                            </div>
                            <div className="sm:col-span-2">
                                <button type="submit" disabled={processing} className="w-full flex items-center justify-center gap-2 bg-[#0D1B3E] text-white py-3 rounded-lg font-semibold hover:bg-[#1A2B50] transition-colors disabled:opacity-60 sm:w-auto sm:px-10">
                                    <Send size={15} /> {processing ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Branches */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
                <h2 className="font-serif text-2xl font-bold text-[#0D1B3E] mb-8 text-center">Our Branches</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {branches.map((b) => (
                        <div key={b.city} className="bg-[#F7F9FC] rounded-2xl p-6 text-center border border-[#E8EEF5]">
                            <div className="w-11 h-11 rounded-xl bg-[#0D1B3E] flex items-center justify-center mx-auto mb-3">
                                <MapPin size={19} className="text-gold-400" />
                            </div>
                            <h3 className="font-bold text-[#0D1B3E] mb-1">{b.city}</h3>
                            <p className="text-gray-500 text-xs mb-1">{b.address}</p>
                            <p className="text-gold-600 text-sm font-semibold">{b.phone}</p>
                        </div>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}
