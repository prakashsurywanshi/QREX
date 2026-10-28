import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import { Plus, Shield, Check, Minus, Pencil, Trash2, Eye, Users as UsersIcon } from 'lucide-react';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    users: { data: any[]; current_page: number; last_page: number; total: number; per_page: number };
    roles: { id: number; name: string; slug: string; description?: string; is_system?: boolean }[];
    rolePermissions: Record<string, Record<string, string[]>>;
    filters: { role: string };
}

export default function Users(props: Props) {
    const { users, roles, rolePermissions, auth, can, filters } = props;
    const isSuperAdmin = auth.user?.role === 'Super Admin';
    const [roleFilter, setRoleFilter] = useState(filters.role || 'All');
    const [showAdd, setShowAdd] = useState(false);
    const [editTarget, setEditTarget] = useState<any | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        role: 'Sales Executive',
        role_id: 0,
        branch: 'Mumbai',
    });

    const editForm = useForm({
        name: '',
        email: '',
        phone: '',
        branch: '',
        role_id: 0,
        status: 'Active',
        password: '',
    });

    const rolesNames = roles.map((r) => r.name);
    const selectableRoles = isSuperAdmin ? rolesNames : rolesNames.filter((n) => n !== 'Super Admin');
    const canEdit = can?.users?.edit ?? false;
    const canDelete = can?.users?.delete ?? false;

    const list = Array.isArray(users?.data) ? users.data : [];

    const applyRoleFilter = (r: string) => {
        setRoleFilter(r);
        router.get('/admin/users', r === 'All' ? {} : { role: r }, { preserveState: true });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/users', { onSuccess: () => setShowAdd(false) });
    };

    const openEdit = (u: any) => {
        editForm.setData({
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            branch: u.branch || '',
            role_id: u.role_id || 0,
            status: u.status || 'Active',
            password: '',
        });
        setEditTarget(u);
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.put(`/admin/users/${editTarget.id}`, { onSuccess: () => setEditTarget(null) });
    };

    const confirmDelete = () => {
        if (deleteTarget) {
            router.delete(`/admin/users/${deleteTarget.id}`, { onSuccess: () => setDeleteTarget(null) });
        }
    };

    return (
        <AdminLayout>
            <PageHeader
                title="Users & Roles"
                subtitle="Manage team members and access permissions"
                breadcrumbs={[{ label: 'Admin' }, { label: 'Users & Roles' }]}
                actions={
                    <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50] transition-colors">
                        <Plus size={16} /> Invite User
                    </button>
                }
            />

            <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                <div className="flex flex-wrap gap-2 mb-4">
                    {['All', ...rolesNames].map((r) => (
                        <button key={r} onClick={() => applyRoleFilter(r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${roleFilter === r ? 'bg-[#0D1B3E] text-white' : 'bg-[#F7F9FC] text-gray-500'}`}>
                            {r}
                        </button>
                    ))}
                </div>
                <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="text-left text-xs text-gray-400 border-b border-[#F0F4F8]">
                                    <th className="pb-3 font-medium">User</th>
                                    <th className="pb-3 font-medium">Role</th>
                                    <th className="pb-3 font-medium">Branch</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium">Last Login</th>
                                    <th className="pb-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map((u) => (
                                    <tr key={u.id} className="border-b border-[#F0F4F8] last:border-0 hover:bg-[#F7F9FC]">
                                        <td className="py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0D1B3E] to-gold-500 flex items-center justify-center text-white text-xs font-bold">
                                                    {u.name?.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                                                </div>
                                                <div>
                                                    <Link href={`/admin/users/${u.id}`} className="font-medium text-[#0D1B3E] text-sm hover:text-gold-600">{u.name}</Link>
                                                    <div className="text-gray-400 text-xs">{u.email} · {u.user_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.roleName === 'Super Admin' || u.roleName === 'Admin' ? 'bg-gold-100 text-gold-700' : 'bg-[#0D1B3E]/5 text-[#0D1B3E]'}`}>{u.roleName || u.role}</span>
                                        </td>
                                        <td className="py-3.5 text-sm text-gray-600">{u.branch}</td>
                                        <td className="py-3.5">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{u.status || 'Active'}</span>
                                        </td>
                                        <td className="py-3.5 text-sm text-gray-500">{u.last_login || '—'}</td>
                                        <td className="py-3.5">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link href={`/admin/users/${u.id}`} className="p-1.5 text-gray-400 hover:text-[#0D1B3E] hover:bg-[#F0F4F8] rounded-lg" title="View profile">
                                                    <Eye size={15} />
                                                </Link>
                                                {canEdit && (
                                                    <button onClick={() => openEdit(u)} className="p-1.5 text-gray-400 hover:text-[#0D1B3E] hover:bg-[#F0F4F8] rounded-lg" title="Edit">
                                                        <Pencil size={15} />
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button onClick={() => setDeleteTarget(u)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-[#F0F4F8] rounded-lg" title="Delete">
                                                        <Trash2 size={15} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {list.length === 0 && (
                        <div className="text-center py-14">
                            <UsersIcon size={40} className="mx-auto text-gray-300 mb-3" />
                            <h3 className="font-semibold text-[#0D1B3E]">No users found</h3>
                            <p className="text-gray-400 text-sm mt-1">Try a different role filter.</p>
                        </div>
                    )}
                    {users.last_page > 1 && (
                        <div className="border-t border-[#F0F4F8] mt-2">
                            <Pagination
                                currentPage={users.current_page}
                                lastPage={users.last_page}
                                total={users.total}
                                perPage={users.per_page}
                                onPageChange={(page) => router.get('/admin/users', roleFilter && roleFilter !== 'All' ? { role: roleFilter, page } : { page }, { preserveState: true })}
                            />
                        </div>
                    )}
                </div>

                {/* Roles & permissions */}
                <div className="bg-white rounded-xl border border-[#E1E8F0] p-5 mt-6">
                    <h3 className="font-semibold text-[#0D1B3E] mb-4 flex items-center gap-2"><Shield size={16} /> Role Permissions</h3>
                    <p className="text-xs text-gray-400 mb-4">Capability matrix by role and module</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rolesNames.map((role) => {
                            const perms = rolePermissions[role] ?? {};
                            return (
                                <div key={role} className="border border-[#F0F4F8] rounded-lg p-3.5">
                                    <div className="flex items-center justify-between mb-2.5">
                                        <span className="font-semibold text-[#0D1B3E] text-sm">{role}</span>
                                        <span className="text-[10px] text-gray-400">{Object.keys(perms).filter((k) => (perms[k]?.length ?? 0) > 0).length} modules</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {Object.entries(perms).map(([mod, abilities]) => (
                                            <div key={mod} className="flex items-center justify-between text-xs">
                                                <span className="text-gray-600">{mod}</span>
                                                <span className={`font-medium ${(abilities ?? []).length > 0 ? 'text-gold-600' : 'text-gray-300'}`}>
                                                    {abilities && abilities.length > 0 ? <><Check size={12} className="inline" /> {abilities.length} abilities</> : <><Minus size={12} className="inline" /> None</>}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            {/* Add user modal */}
            <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Invite Team Member">
                <form onSubmit={submit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                            <input value={data.name} onChange={(e) => setData('name', e.target.value)} required className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                            <input value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                            <select
                                value={data.role}
                                onChange={(e) => {
                                    const name = e.target.value;
                                    const role = roles.find((r) => r.name === name);
                                    setData((prev) => ({ ...prev, role: name, role_id: role?.id ?? 0 }));
                                }}
                                className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none"
                            >
                                {selectableRoles.map((r) => <option key={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Branch</label>
                            <select value={data.branch} onChange={(e) => setData('branch', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                {['HQ Mumbai', 'Mumbai', 'Bangalore', 'Gurugram'].map((b) => <option key={b}>{b}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                        <button type="submit" disabled={processing} className="px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                            {processing ? 'Inviting...' : 'Invite User'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit user modal */}
            <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit User" subtitle={editTarget ? `${editTarget.name} · ${editTarget.user_id}` : undefined}>
                <form onSubmit={submitEdit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                            <input value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                            {editForm.errors.name && <p className="text-red-500 text-xs mt-1">{editForm.errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                            <input type="email" value={editForm.data.email} onChange={(e) => editForm.setData('email', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                            {editForm.errors.email && <p className="text-red-500 text-xs mt-1">{editForm.errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                            <input value={editForm.data.phone} onChange={(e) => editForm.setData('phone', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                            <select
                                value={editForm.data.role_id}
                                onChange={(e) => editForm.setData('role_id', Number(e.target.value))}
                                className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none"
                            >
                                <option value={0}>— Select role —</option>
                                {selectableRoles.map((name) => {
                                    const r = roles.find((x) => x.name === name);
                                    return <option key={name} value={r?.id}>{name}</option>;
                                })}
                            </select>
                            {editForm.errors.role_id && <p className="text-red-500 text-xs mt-1">{editForm.errors.role_id}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Branch</label>
                            <select value={editForm.data.branch} onChange={(e) => editForm.setData('branch', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                {['HQ Mumbai', 'Mumbai', 'Bangalore', 'Gurugram'].map((b) => <option key={b}>{b}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                            <select value={editForm.data.status} onChange={(e) => editForm.setData('status', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span></label>
                            <input type="password" value={editForm.data.password} onChange={(e) => editForm.setData('password', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                            {editForm.errors.password && <p className="text-red-500 text-xs mt-1">{editForm.errors.password}</p>}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setEditTarget(null)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                        <button type="submit" disabled={editForm.processing} className="px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                            {editForm.processing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete confirmation modal */}
            <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete User" size="sm">
                <p className="text-sm text-gray-600">
                    Are you sure you want to delete <span className="font-semibold text-[#0D1B3E]">{deleteTarget?.name}</span>? This cannot be undone.
                </p>
                <div className="flex justify-end gap-2 pt-5">
                    <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                    <button onClick={confirmDelete} className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600">
                        Delete User
                    </button>
                </div>
            </Modal>
        </AdminLayout>
    );
}
