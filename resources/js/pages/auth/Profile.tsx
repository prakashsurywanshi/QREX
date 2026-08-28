import { useForm } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import { User, Lock, Mail, Phone, Building2, BadgeCheck, CalendarDays, KeyRound, ShieldCheck, CheckCircle2, Send, Loader2 } from 'lucide-react';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    user: any;
    emailChange?: EmailChangeProps;
}

function OtpCodeInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
    return (
        <input
            inputMode="numeric"
            maxLength={6}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
            placeholder="••••••"
            className="w-40 px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-center text-lg tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-gold-400/30 disabled:opacity-60"
        />
    );
}

interface EmailChangeProps {
    currentVerified: boolean;
    pendingEmail?: string | null;
    currentOtpSent?: boolean;
    newOtpSent?: boolean;
}

function ChangeEmailCard({ user, emailChange }: { user: any; emailChange: EmailChangeProps }) {
    const currentOtp = useForm({ otp: '' });
    const currentEmailForm = useForm({ email: user.email });
    const newOtp = useForm({ email: emailChange.pendingEmail || '', otp: '' });

    const currentOtpSent = emailChange.currentOtpSent ?? false;
    const newOtpSent = emailChange.newOtpSent ?? false;

    const sendCurrent = () => {
        currentEmailForm.post('/profile/email/otp', {
            onSuccess: () => {},
        });
    };

    const verifyCurrent = (e: React.FormEvent) => {
        e.preventDefault();
        currentOtp.post('/profile/email/verify-current');
    };

    const sendNew = () => {
        newOtp.post('/profile/email/new-otp', {
            preserveScroll: true,
        });
    };

    const verifyNew = (e: React.FormEvent) => {
        e.preventDefault();
        newOtp.post('/profile/email/verify-new', {
            preserveScroll: true,
        });
    };

    return (
        <div className="bg-white rounded-2xl border border-[#E1E8F0] p-6">
            <div className="flex items-center gap-2 mb-5">
                <Mail size={17} className="text-gold-600" />
                <h3 className="font-semibold text-[#0D1B3E]">Change Email Address</h3>
            </div>

            <div className="space-y-6">
                {/* Step 1: verify current email */}
                <div className={`rounded-xl border p-4 ${emailChange.currentVerified ? 'border-emerald-200 bg-emerald-50/40' : 'border-[#E1E8F0]'}`}>
                    <div className="flex items-center gap-2 mb-1">
                        {emailChange.currentVerified
                            ? <CheckCircle2 size={16} className="text-emerald-600" />
                            : <ShieldCheck size={16} className="text-gold-600" />}
                        <span className="text-sm font-semibold text-[#0D1B3E]">Step 1 · Verify current email</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                        Current email: <span className="font-medium text-gray-700">{user.email}</span>
                    </p>

                    {!emailChange.currentVerified && (
                        <>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={sendCurrent}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50] transition-colors"
                                >
                                    <Send size={14} /> Send Code
                                </button>
                                {currentOtpSent && <span className="text-xs text-gray-500">Code sent — check your inbox.</span>}
                            </div>
                            {currentOtpSent && (
                                <form onSubmit={verifyCurrent} className="mt-4 flex items-end gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Enter 6-digit code</label>
                                        <OtpCodeInput value={currentOtp.data.otp} onChange={(v) => currentOtp.setData('otp', v)} disabled={currentOtp.processing} />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={currentOtp.processing || currentOtp.data.otp.length !== 6}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 text-[#0D1B3E] rounded-lg text-sm font-bold hover:bg-gold-400 transition-colors disabled:opacity-60"
                                    >
                                        {currentOtp.processing ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />} Verify
                                    </button>
                                </form>
                            )}
                        </>
                    )}

                    {emailChange.currentVerified && (
                        <span className="text-xs font-semibold text-emerald-600">Verified</span>
                    )}
                </div>

                {/* Step 2: verify new email */}
                <div className={`rounded-xl border p-4 ${emailChange.currentVerified ? 'border-[#E1E8F0]' : 'border-gray-100 bg-gray-50/40 opacity-60 pointer-events-none'}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <Mail size={16} className="text-gold-600" />
                        <span className="text-sm font-semibold text-[#0D1B3E]">Step 2 · Verify new email</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">A code will be sent to your new email to confirm you own it.</p>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">New Email Address</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="email"
                                    value={newOtp.data.email}
                                    onChange={(e) => newOtp.setData('email', e.target.value)}
                                    placeholder="new@example.com"
                                    className="flex-1 px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                                />
                                <button
                                    type="button"
                                    onClick={sendNew}
                                    disabled={!newOtp.data.email || newOtp.processing}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50] transition-colors disabled:opacity-60"
                                >
                                    {newOtp.processing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send Code
                                </button>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1">New email must be different from your current email.</p>
                        </div>

                        {newOtpSent && (
                            <form onSubmit={verifyNew} className="flex items-end gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Enter 6-digit code</label>
                                    <OtpCodeInput value={newOtp.data.otp} onChange={(v) => newOtp.setData('otp', v)} disabled={newOtp.processing} />
                                </div>
                                <button
                                    type="submit"
                                    disabled={newOtp.processing || newOtp.data.otp.length !== 6}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 text-[#0D1B3E] rounded-lg text-sm font-bold hover:bg-gold-400 transition-colors disabled:opacity-60"
                                >
                                    {newOtp.processing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Verify & Save
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Profile({ user, emailChange }: Props) {
    const profileForm = useForm({
        name: user.name,
        phone: user.phone || '',
    });

    const passForm = useForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    const submitProfile = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.put('/profile');
    };

    const submitPass = (e: React.FormEvent) => {
        e.preventDefault();
        passForm.put('/password', {
            onSuccess: () => passForm.reset(),
        });
    };

    return (
        <AdminLayout>
            <PageHeader
                title="My Profile"
                subtitle="View and update your account details"
                breadcrumbs={[{ label: 'Account' }, { label: 'My Profile' }]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-[#E1E8F0] p-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-gold-500 text-white text-2xl font-bold flex items-center justify-center mx-auto">
                            {user.initials}
                        </div>
                        <h2 className="text-lg font-bold text-[#0D1B3E] mt-4">{user.name}</h2>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <span className="status-badge bg-gold-100 text-gold-700 mt-3 inline-flex capitalize">{user.role}</span>
                        <div className="mt-6 space-y-3 text-left">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Mail size={15} className="text-gold-600" /> {user.email}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Phone size={15} className="text-gold-600" /> {user.phone || 'Not provided'}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Building2 size={15} className="text-gold-600" /> {user.branch}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <BadgeCheck size={15} className="text-gold-600" /> {user.role}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <CalendarDays size={15} className="text-gold-600" /> Last login: {user.last_login_at}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-[#E1E8F0] p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <User size={17} className="text-gold-600" />
                            <h3 className="font-semibold text-[#0D1B3E]">Personal Information</h3>
                        </div>
                        <form onSubmit={submitProfile} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                                <input value={profileForm.data.name} onChange={(e) => profileForm.setData('name', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                                {profileForm.errors.name && <p className="text-xs text-red-500 mt-1">{profileForm.errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                                <input value={user.email} disabled className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm bg-gray-50 text-gray-400" />
                                <p className="text-[11px] text-gray-400 mt-1">Use the "Change Email Address" section below to update your email.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone</label>
                                <input value={profileForm.data.phone} onChange={(e) => profileForm.setData('phone', e.target.value)} placeholder="+91" className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                            </div>
                            <button type="submit" disabled={profileForm.processing} className="px-5 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-bold disabled:opacity-60">
                                {profileForm.processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>

                    <ChangeEmailCard user={user} emailChange={emailChange || { currentVerified: false, pendingEmail: null }} />

                    <div className="bg-white rounded-2xl border border-[#E1E8F0] p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <Lock size={17} className="text-gold-600" />
                            <h3 className="font-semibold text-[#0D1B3E]">Change Password</h3>
                        </div>
                        <form onSubmit={submitPass} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Current Password</label>
                                <input type="password" value={passForm.data.current_password} onChange={(e) => passForm.setData('current_password', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                                {passForm.errors.current_password && <p className="text-xs text-red-500 mt-1">{passForm.errors.current_password}</p>}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Password</label>
                                    <input type="password" value={passForm.data.new_password} onChange={(e) => passForm.setData('new_password', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                                    {passForm.errors.new_password && <p className="text-xs text-red-500 mt-1">{passForm.errors.new_password}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm New Password</label>
                                    <input type="password" value={passForm.data.new_password_confirmation} onChange={(e) => passForm.setData('new_password_confirmation', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                                </div>
                            </div>
                            <button type="submit" disabled={passForm.processing} className="px-5 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-bold disabled:opacity-60">
                                {passForm.processing ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
