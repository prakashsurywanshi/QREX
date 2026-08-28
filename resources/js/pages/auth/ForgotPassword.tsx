import { useState } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import { Building2, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
    const [submitted, setSubmitted] = useState(false);
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/forgot-password', {
            onSuccess: () => setSubmitted(true),
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F4F7FC] px-6">
            <Head title="Forgot Password" />
            <div className="w-full max-w-md">
                <div className="flex items-center gap-3 mb-6 justify-center">
                    <div className="w-10 h-10 rounded-xl bg-[#0D1B3E] flex items-center justify-center">
                        <Building2 size={18} className="text-gold-400" />
                    </div>
                    <div className="text-[#0D1B3E] font-bold text-lg">QREX ERP</div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-[#E1E8F0] p-8">
                    {submitted ? (
                        <div className="text-center">
                            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                            <h2 className="text-[#0D1B3E] text-xl font-bold mb-2">Check your email</h2>
                            <p className="text-gray-500 text-sm mb-6">
                                We've sent password reset instructions to <span className="font-medium text-[#0D1B3E]">{data.email || 'your email'}</span>.
                            </p>
                            <Link href="/login" className="text-gold-600 font-medium text-sm hover:underline">
                                Back to Sign In
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-[#0D1B3E] text-2xl font-bold mb-1">Forgot password?</h2>
                            <p className="text-gray-500 text-sm mb-6">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>

                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#0D1B3E] mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400"
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full flex items-center justify-center gap-2 bg-[#0D1B3E] text-white py-2.5 rounded-lg font-semibold hover:bg-[#1A2B50] transition-colors disabled:opacity-60"
                                >
                                    {processing ? <Loader2 size={16} className="animate-spin" /> : 'Send Reset Link'}
                                </button>
                            </form>

                            <Link href="/login" className="flex items-center justify-center gap-1.5 text-gray-500 text-sm mt-5 hover:text-[#0D1B3E]">
                                <ArrowLeft size={14} />
                                Back to Sign In
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
