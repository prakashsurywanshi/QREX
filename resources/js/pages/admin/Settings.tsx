import { useForm } from '@inertiajs/react';
import { usePage } from '@/hooks/usePage';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Building2, Bell, Shield, Palette, Save, Mail, Send } from 'lucide-react';
import type { PageProps } from '@/types';

interface SmtpSettings {
    enabled: boolean;
    host: string;
    port: number;
    username: string;
    password: string;
    encryption: string;
    from_address: string;
    from_name: string;
    test_email: string;
}

interface Props extends PageProps {
    settings: Record<string, any>;
    smtp?: SmtpSettings;
}

function Section({ title, subtitle, icon: Icon, children }: any) {
    return (
        <div className="bg-white rounded-xl border border-[#E1E8F0] p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-gold-500/15 flex items-center justify-center">
                    <Icon size={16} className="text-gold-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-[#0D1B3E]">{title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

function Label({ children }: any) {
    return <label className="block text-xs font-medium text-gray-600 mb-1.5">{children}</label>;
}

function Toggle({ label, desc, value, onChange }: any) {
    return (
        <div className="flex items-center justify-between py-2.5">
            <div>
                <div className="text-sm font-medium text-[#0D1B3E]">{label}</div>
                <div className="text-xs text-gray-400">{desc}</div>
            </div>
            <button onClick={() => onChange(!value)} className={`w-11 h-6 rounded-full relative transition-colors ${value ? 'bg-[#0D1B3E]' : 'bg-gray-200'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
        </div>
    );
}

export default function Settings({ settings, smtp }: Props) {
    const { auth } = usePage();
    const isSuperAdmin = auth.user?.role === 'Super Admin';

    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        project_name: settings.project_name || 'QREX',
        agency_name: settings.agency_name || 'QREX',
        tagline: settings.tagline || 'Luxury Living, Redefined',
        contact_email: settings.contact_email || 'hello@example.com',
        contact_phone: settings.contact_phone || '+91 98765 43210',
        address: settings.address || '702, Trident Tower, BKC, Mumbai 400051',
        currency: settings.currency || 'INR (₹)',
        timezone: settings.timezone || 'Asia/Kolkata',
        date_format: settings.date_format || 'DD MMM YYYY',
        lead_auto_assign: settings.lead_auto_assign !== false,
        visit_reminders: settings.visit_reminders !== false,
        payment_alerts: settings.payment_alerts !== false,
        low_inventory_alert: !!settings.low_inventory_alert,
        two_factor: !!settings.two_factor,
        maintenance_mode: !!settings.maintenance_mode,
        primary_color: settings.primary_color || '#0D1B3E',
        accent_color: settings.accent_color || '#C9963A',
    });

    const save = () => put('/admin/settings', { preserveScroll: true });

    const smtpForm = useForm({
        enabled: !!smtp?.enabled,
        host: smtp?.host || '',
        port: smtp?.port || 587,
        username: smtp?.username || '',
        password: smtp?.password || '',
        encryption: smtp?.encryption || 'tls',
        from_address: smtp?.from_address || '',
        from_name: smtp?.from_name || '',
        test_email: smtp?.test_email || '',
    });

    const saveSmtp = () => smtpForm.put('/admin/settings/smtp', { preserveScroll: true });

    const testForm = useForm({ email: smtp?.test_email || '' });
    const sendTestMail = () => testForm.post('/admin/settings/test-mail', { preserveScroll: true });

    return (
        <AdminLayout>
            <PageHeader
                title="Settings"
                subtitle="Agency and system preferences"
                breadcrumbs={[{ label: 'Administration' }, { label: 'Settings' }]}
                actions={
                    <button onClick={save} disabled={processing} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50] transition-colors disabled:opacity-60">
                        <Save size={15} /> {processing ? 'Saving...' : recentlySuccessful ? 'Saved ✓' : 'Save Changes'}
                    </button>
                }
            />

            <form onSubmit={(e) => { e.preventDefault(); save(); }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General */}
                <Section title="General Information" subtitle="Agency identity & details" icon={Building2}>
                    <div className="space-y-4">
                        {isSuperAdmin && (
                            <div>
                                <Label>Project Name</Label>
                                <input value={data.project_name} onChange={(e) => setData('project_name', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                                <p className="text-[11px] text-gray-400 mt-1">Displayed across the admin portal. Only Super Admins can edit this.</p>
                            </div>
                        )}
                        <div>
                            <Label>Agency Name</Label>
                            <input value={data.agency_name} onChange={(e) => setData('agency_name', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                            {errors.agency_name && <p className="text-red-500 text-xs mt-1">{errors.agency_name}</p>}
                        </div>
                        <div>
                            <Label>Tagline</Label>
                            <input value={data.tagline} onChange={(e) => setData('tagline', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Contact Email</Label>
                                <input value={data.contact_email} onChange={(e) => setData('contact_email', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                            </div>
                            <div>
                                <Label>Contact Phone</Label>
                                <input value={data.contact_phone} onChange={(e) => setData('contact_phone', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                            </div>
                        </div>
                        <div>
                            <Label>Office Address</Label>
                            <textarea value={data.address} onChange={(e) => setData('address', e.target.value)} rows={2} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                    </div>
                </Section>

                {/* Branding */}
                <Section title="Branding" subtitle="Portal colors & content display" icon={Palette}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Currency</Label>
                                <select value={data.currency} onChange={(e) => setData('currency', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                    {['INR (₹)', 'USD ($)', 'EUR (€)', 'AED (د.إ)'].map((c) => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <Label>Timezone</Label>
                                <select value={data.timezone} onChange={(e) => setData('timezone', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                    {['Asia/Kolkata', 'Asia/Dubai', 'UTC'].map((t) => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <Label>Date Format</Label>
                            <select value={data.date_format} onChange={(e) => setData('date_format', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                {['DD MMM YYYY', 'MM/DD/YYYY', 'DD/MM/YYYY'].map((d) => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Primary Color</Label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={data.primary_color} onChange={(e) => setData('primary_color', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-[#E1E8F0]" />
                                    <span className="text-sm text-gray-500">{data.primary_color}</span>
                                </div>
                            </div>
                            <div>
                                <Label>Accent Color</Label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={data.accent_color} onChange={(e) => setData('accent_color', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-[#E1E8F0]" />
                                    <span className="text-sm text-gray-500">{data.accent_color}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Notifications */}
                <Section title="Notifications" subtitle="Email & alert preferences" icon={Bell}>
                    <div className="divide-y divide-[#F0F4F8]">
                        <Toggle label="Lead Auto-Assignment" desc="Automatically assign new leads to available agents" value={data.lead_auto_assign} onChange={(v: boolean) => setData('lead_auto_assign', v)} />
                        <Toggle label="Site Visit Reminders" desc="Notify agents before upcoming site visits" value={data.visit_reminders} onChange={(v: boolean) => setData('visit_reminders', v)} />
                        <Toggle label="Payment Alerts" desc="Alert on due & overdue installment payments" value={data.payment_alerts} onChange={(v: boolean) => setData('payment_alerts', v)} />
                        <Toggle label="Low Inventory Alerts" desc="Notify when property listings run low" value={data.low_inventory_alert} onChange={(v: boolean) => setData('low_inventory_alert', v)} />
                    </div>
                </Section>

                {/* Security */}
                <Section title="Security" subtitle="Access & system controls" icon={Shield}>
                    <div className="divide-y divide-[#F0F4F8]">
                        <Toggle label="Two-Factor Authentication" desc="Require OTP for all admin logins" value={data.two_factor} onChange={(v: boolean) => setData('two_factor', v)} />
                        <Toggle label="Maintenance Mode" desc="Temporarily hide the public website" value={data.maintenance_mode} onChange={(v: boolean) => setData('maintenance_mode', v)} />
                    </div>
                </Section>

                {/* SMTP (Super Admin only) */}
                {isSuperAdmin && (
                    <div className="lg:col-span-2">
                        <Section title="SMTP / Email Configuration" subtitle="Configure mail server to send password reset & notification emails" icon={Mail}>
                            <div className="space-y-4">
                                <Toggle label="Enable SMTP" desc="Send real emails through your SMTP server instead of the log driver" value={smtpForm.data.enabled} onChange={(v: boolean) => smtpForm.setData('enabled', v)} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <Label>Mail Host</Label>
                                        <input
                                            value={smtpForm.data.host}
                                            onChange={(e) => smtpForm.setData('host', e.target.value)}
                                            placeholder="smtp.gmail.com"
                                            className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                                        />
                                        <p className="text-[11px] text-gray-400 mt-1">SMTP server hostname, e.g. smtp.gmail.com, smtp.mailgun.com</p>
                                    </div>
                                    <div>
                                        <Label>Port</Label>
                                        <input
                                            type="number"
                                            value={smtpForm.data.port}
                                            onChange={(e) => smtpForm.setData('port', Number(e.target.value))}
                                            className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                                        />
                                    </div>
                                    <div>
                                        <Label>Encryption</Label>
                                        <select value={smtpForm.data.encryption} onChange={(e) => smtpForm.setData('encryption', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                            <option value="tls">TLS (recommended)</option>
                                            <option value="ssl">SSL</option>
                                            <option value="">None</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label>Username</Label>
                                        <input
                                            value={smtpForm.data.username}
                                            onChange={(e) => smtpForm.setData('username', e.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                                        />
                                    </div>
                                    <div>
                                        <Label>Password</Label>
                                        <input
                                            type="password"
                                            value={smtpForm.data.password}
                                            onChange={(e) => smtpForm.setData('password', e.target.value)}
                                            placeholder="SMTP password / app password"
                                            className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                                        />
                                    </div>
                                    <div>
                                        <Label>From Address</Label>
                                        <input
                                            type="email"
                                            value={smtpForm.data.from_address}
                                            onChange={(e) => smtpForm.setData('from_address', e.target.value)}
                                            placeholder="no-reply@example.com"
                                            className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                                        />
                                    </div>
                                    <div>
                                        <Label>From Name</Label>
                                        <input
                                            value={smtpForm.data.from_name}
                                            onChange={(e) => smtpForm.setData('from_name', e.target.value)}
                                            placeholder="QREX ERP"
                                            className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label>Test Email Address</Label>
                                        <input
                                            type="email"
                                            value={smtpForm.data.test_email}
                                            onChange={(e) => smtpForm.setData('test_email', e.target.value)}
                                            placeholder="admin@example.com"
                                            className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                                        />
                                        <p className="text-[11px] text-gray-400 mt-1">Used when sending the test email. You can override it in the test box below.</p>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={saveSmtp}
                                        disabled={smtpForm.processing}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50] transition-colors disabled:opacity-60"
                                    >
                                        <Save size={15} /> {smtpForm.processing ? 'Saving...' : 'Save SMTP Settings'}
                                    </button>
                                </div>

                                <div className="border-t border-[#F0F4F8] pt-5">
                                    <h4 className="text-sm font-semibold text-[#0D1B3E] mb-1 flex items-center gap-2"><Send size={14} className="text-gold-600" /> Test Mail</h4>
                                    <p className="text-xs text-gray-400 mb-3">Send a test email to verify your SMTP configuration is working.</p>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="email"
                                            value={testForm.data.email}
                                            onChange={(e) => testForm.setData('email', e.target.value)}
                                            placeholder="recipient@example.com"
                                            className="flex-1 px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                                        />
                                        <button
                                            type="button"
                                            onClick={sendTestMail}
                                            disabled={testForm.processing}
                                            className="inline-flex items-center justify-center gap-2 px-5 py-2 border border-gold-500 text-gold-700 rounded-lg text-sm font-semibold hover:bg-gold-500/10 transition-colors disabled:opacity-60"
                                        >
                                            <Send size={14} /> {testForm.processing ? 'Sending...' : 'Send Test Email'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Section>
                    </div>
                )}
            </form>
        </AdminLayout>
    );
}
