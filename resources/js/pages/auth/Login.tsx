import { useState } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import { usePage } from '@/hooks/usePage';
import { Building2, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

const roleDemoAccounts: Record<string, { email: string; password: string }> = {
    'Super Admin': { email: 'tejas@qodeigence.com', password: '12345678' },
    Admin: { email: 'neha@example.com', password: 'password' },
    'Sales Executive': { email: 'amit.v@example.com', password: 'password' },
    'Marketing User': { email: 'rahul.m@example.com', password: 'password' },
    Accountant: { email: 'priti.s@example.com', password: 'password' },
};

export default function Login({ settings }: { settings?: { project_name?: string; agency_name?: string; tagline?: string } }) {
    const [showPassword, setShowPassword] = useState(false);
    const [demoRole, setDemoRole] = useState('Super Admin');
    const { app } = usePage();
    const name = settings?.project_name || settings?.agency_name || 'QREX';
    const tagline = settings?.tagline || 'Realty ERP & CRM';
    const logoUrl = app?.logo;
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen flex">
            <Head title="Login" />

            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-[52%] bg-[#0D1B3E] relative overflow-hidden flex-col justify-between p-12">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{ backgroundImage: "url(https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=900&h=1200&fit=crop&auto=format)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B3E]/80 via-[#0D1B3E]/60 to-[#1A3580]/80" />

                <Link href="/" className="relative z-10 flex items-center gap-3">
                    <div className="w-11 h-11 flex items-center justify-center overflow-hidden">
                        {logoUrl ? (
                            <img src={logoUrl} alt={name} className="w-full h-full object-contain" />
                        ) : (
                            <Building2 size={22} className="text-white" />
                        )}
                    </div>
                    <div>
                        <div className="text-white font-bold text-xl tracking-tight">{name}</div>
                        <div className="text-gold-400/80 text-xs uppercase tracking-widest">{tagline}</div>
                    </div>
                </Link>

                <div className="relative z-10">
                    <h1 className="font-serif text-white text-4xl leading-tight mb-4">
                        Every great deal<br />starts with the<br />
                        <span className="text-gold-400">right platform.</span>
                    </h1>
                    <p className="text-blue-200/70 text-base leading-relaxed max-w-md">
                        Manage your entire real estate business — from lead capture to sale closure — in one integrated platform.
                    </p>
                </div>

                <div className="relative z-10 flex gap-8">
                    {[
                        { label: 'Properties', value: '8 Listed' },
                        { label: 'Active Leads', value: '10 Leads' },
                        { label: 'Revenue', value: '₹10 Cr+' },
                    ].map((stat) => (
                        <div key={stat.label}>
                            <div className="text-white font-bold text-xl">{stat.value}</div>
                            <div className="text-blue-200/60 text-xs">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex items-center justify-center bg-[#F4F7FC] px-6">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                            {logoUrl ? (
                                <img src={logoUrl} alt={name} className="w-full h-full object-contain" />
                            ) : (
                                <Building2 size={18} className="text-[#0D1B3E]" />
                            )}
                        </div>
                        <div className="text-[#0D1B3E] font-bold text-lg">{name}</div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-[#E1E8F0] p-8">
                        <h2 className="text-[#0D1B3E] text-2xl font-bold mb-1">Welcome back</h2>
                        <p className="text-gray-500 text-sm mb-6">Sign in to your {name} account to continue</p>

                        {errors.email && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                                {errors.email}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#0D1B3E] mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#0D1B3E] mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full px-4 py-2.5 pr-11 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-xs text-gray-500">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded"
                                    />
                                    Remember me
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-medium text-gold-600 hover:text-gold-700 hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 bg-[#0D1B3E] text-white py-2.5 rounded-lg font-semibold hover:bg-[#1A2B50] transition-colors disabled:opacity-60"
                            >
                                {processing ? <Loader2 size={16} className="animate-spin" /> : 'Sign In'}
                                {!processing && <ArrowRight size={16} />}
                            </button>
                        </form>

                        {/* Demo accounts — select a role to autofill */}
                        <div className="mt-5 pt-5 border-t border-[#F0F4F8]">
                            <p className="text-[11px] text-gray-400 mb-2">Demo accounts — select a role to autofill</p>
                            <div className="flex flex-wrap gap-1.5">
                                {Object.entries(roleDemoAccounts).map(([role, account]) => (
                                    <button
                                        key={role}
                                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${demoRole === role ? 'bg-[#0D1B3E] text-white' : 'bg-[#F4F7FC] text-gray-600 hover:bg-[#E9EEF6]'}`}
                                        onClick={() => {
                                            setDemoRole(role);
                                            setData('email', account.email);
                                            setData('password', account.password);
                                        }}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        © 2026 {name} Real Estate · Powered by {name} ERP
                    </p>
                </div>
            </div>
        </div>
    );
}
