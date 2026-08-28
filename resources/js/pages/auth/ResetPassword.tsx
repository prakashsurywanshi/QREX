import { useState } from 'react';
import { useForm, Head, Link, usePage } from '@inertiajs/react';
import { Building2, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function ResetPassword() {
    const page = usePage();
    const props = page.props as any;
    const token = props.token ?? '';
    const prefillEmail = props.email ?? '';

    const [done, setDone] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email: prefillEmail,
        password: '',
        password_confirmation: '',
        token,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/reset-password', { onSuccess: () => setDone(true) });
    };

    if (done) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4F7FC] px-6">
                <Head title="Password Reset" />
                <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#E1E8F0] p-8 text-center">
                    <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                    <h2 className="text-[#0D1B3E] text-xl font-bold mb-2">Password updated</h2>
                    <p className="text-gray-500 text-sm mb-6">Your password has been reset successfully. You can now sign in with your new password.</p>
                    <Link href="/login" className="inline-block bg-[#0D1B3E] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1A2B50]">
                        Go to Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F4F7FC] px-6">
            <Head title="Reset Password" />
            <div className="w-full max-w-md">
                <div className="flex items-center gap-3 mb-6 justify-center">
                    <div className="w-10 h-10 rounded-xl bg-[#0D1B3E] flex items-center justify-center">
                        <Building2 size={18} className="text-gold-400" />
                    </div>
                    <div className="text-[#0D1B3E] font-bold text-lg">QREX ERP</div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-[#E1E8F0] p-8">
                    <h2 className="text-[#0D1B3E] text-2xl font-bold mb-1">Create a new password</h2>
                    <p className="text-gray-500 text-sm mb-6">Choose a strong password for your account.</p>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#0D1B3E] mb-1.5">Email Address</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full px-4 py-2.5 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400"
                                required
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#0D1B3E] mb-1.5">New Password</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full px-4 py-2.5 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400"
                                required
                                minLength={8}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#0D1B3E] mb-1.5">Confirm New Password</label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="w-full px-4 py-2.5 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex items-center justify-center gap-2 bg-[#0D1B3E] text-white py-2.5 rounded-lg font-semibold hover:bg-[#1A2B50] transition-colors disabled:opacity-60"
                        >
                            {processing ? <Loader2 size={16} className="animate-spin" /> : 'Reset Password'}
                        </button>
                    </form>

                    <Link href="/login" className="flex items-center justify-center gap-1.5 text-gray-500 text-sm mt-5 hover:text-[#0D1B3E]">
                        <ArrowLeft size={14} />
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
