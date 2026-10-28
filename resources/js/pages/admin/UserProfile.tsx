import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import Modal from '@/components/ui/Modal';
import { ChevronLeft, Phone, Mail, MapPin, Pencil, Trash2, Shield, CalendarClock, Clock } from 'lucide-react';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    user: any;
    roles: { id: number; name: string; slug: string; description?: string; is_system?: boolean }[];
}

export default function UserProfile(props: Props) {
    const { user, roles, auth, can } = props;
    const isSuperAdmin = auth.user?.role === 'Super Admin';
    const canEdit = can?.users?.edit ?? false;
    const canDelete = can?.users?.delete ?? false;

    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const form = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        branch: user.branch || '',
        role_id: user.role_id || 0,
        status: user.status || 'Active',
        password: '',
    });

    const selectableRoles = isSuperAdmin ? roles : roles.filter((r) => r.slug !== 'super-admin');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/admin/users/${user.id}`, { onSuccess: () => setEditOpen(false) });
    };

    const confirmDelete = () => {
        router.delete(`/admin/users/${user.id}`, { onSuccess: () => router.visit('/admin/users') });
    };

    const stats = [
        { label: 'User ID', value: user.user_id },
        { label: 'Branch', value: user.branch || '—' },
        { label: 'Joined', value: user.created_at || '—' },
        { label: 'Last Login', value: user.last_login || '—' },
    ];

    return (
        <AdminLayout>
            <PageHeader
                title={user.name}
                subtitle={`${user.user_id} · ${user.roleName || user.role}`}
                breadcrumbs={[{ label: 'Admin' }, { label: 'Users', href: '/admin/users' }, { label: user.name }]}
                actions={
                    <>
                        <Link href="/admin/users" className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600 hover:bg-[#F7F9FC]">
                            <ChevronLeft size={16} /> Back
                        </Link>
                        {canDelete && (
                            <button onClick={() => setDeleteOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-red-200 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-50">
                                <Trash2 size={14} /> Delete
                            </button>
                        )}
                        {canEdit && (
                            <button onClick={() => setEditOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50]">
                                <Pencil size={14} /> Edit
                            </button>
                        )}
                    </>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0D1B3E] to-gold-500 flex items-center justify-center text-white font-bold text-xl">
                                {user.name?.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-[#0D1B3E]">{user.name}</h2>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{user.status || 'Active'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gold-600 text-sm mt-0.5 font-medium">
                                    <Shield size={14} /> {user.roleName || user.role}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-[#F7F9FC] rounded-lg px-3 py-2.5 truncate">
                                <Mail size={15} className="text-[#0D1B3E]" /> {user.email || '—'}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-[#F7F9FC] rounded-lg px-3 py-2.5">
                                <Phone size={15} className="text-[#0D1B3E]" /> {user.phone || '—'}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-[#F7F9FC] rounded-lg px-3 py-2.5">
                                <MapPin size={15} className="text-[#0D1B3E]" /> {user.branch || '—'}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-[#E1E8F0] p-6">
                        <h3 className="font-semibold text-[#0D1B3E] mb-4 flex items-center gap-2"><CalendarClock size={16} /> Account Summary</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {stats.map((s) => (
                                <div key={s.label} className="bg-[#F7F9FC] rounded-xl p-4">
                                    <div className="text-xs text-gray-400">{s.label}</div>
                                    <div className="font-semibold text-[#0D1B3E] mt-1 text-sm">{s.value}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                            <Clock size={13} /> Account created and managed by the admin team
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="bg-white rounded-xl border border-[#E1E8F0] p-6 h-fit">
                    <h3 className="font-semibold text-[#0D1B3E] mb-4 flex items-center gap-2"><Shield size={15} /> Role Details</h3>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-medium text-[#0D1B3E]">{user.roleName || user.role}</span>
                    </div>
                    <p className="text-xs text-gray-400">{roles.find((r) => r.id === user.role_id)?.description || 'Team member role with assigned permissions.'}</p>
                </div>
            </div>

            {/* Edit modal */}
            <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit User" subtitle={`${user.name} · ${user.user_id}`}>
                <form onSubmit={submit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                            <input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                            {form.errors.name && <p className="text-red-500 text-xs mt-1">{form.errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                            <input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                            {form.errors.email && <p className="text-red-500 text-xs mt-1">{form.errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                            <input value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                            <select value={form.data.role_id} onChange={(e) => form.setData('role_id', Number(e.target.value))} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                <option value={0}>— Select role —</option>
                                {selectableRoles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Branch</label>
                            <select value={form.data.branch} onChange={(e) => form.setData('branch', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                {['HQ Mumbai', 'Mumbai', 'Bangalore', 'Gurugram'].map((b) => <option key={b}>{b}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                            <select value={form.data.status} onChange={(e) => form.setData('status', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span></label>
                            <input type="password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                            {form.errors.password && <p className="text-red-500 text-xs mt-1">{form.errors.password}</p>}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                        <button type="submit" disabled={form.processing} className="px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                            {form.processing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete modal */}
            <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete User" size="sm">
                <p className="text-sm text-gray-600">
                    Are you sure you want to delete <span className="font-semibold text-[#0D1B3E]">{user.name}</span>? This cannot be undone.
                </p>
                <div className="flex justify-end gap-2 pt-5">
                    <button onClick={() => setDeleteOpen(false)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                    <button onClick={confirmDelete} className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600">Delete User</button>
                </div>
            </Modal>
        </AdminLayout>
    );
}
