import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import Modal from '@/components/ui/Modal';
import { Plus, Shield, Pencil, Trash2, Lock, Check } from 'lucide-react';
import type { PageProps } from '@/types';

interface PermissionAction {
    slug: string;
    action: string;
    label: string;
}

interface PermissionFieldGroup {
    action: string;
    fields: { slug: string; field: string; label: string }[];
}

interface PermissionModule {
    module: string;
    label: string;
    actions: PermissionAction[];
    fields: PermissionFieldGroup[];
}

interface RoleItem {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_system: boolean;
    permission_count: number;
    user_count: number;
    permission_slugs: string[];
}

interface Props extends PageProps {
    roles: RoleItem[];
    permissions: PermissionModule[];
}

const alwaysShownActions = ['view', 'create', 'edit', 'delete', 'export', 'approve'];

export default function Roles(props: Props) {
    const { roles, permissions, can } = props;
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<RoleItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<RoleItem | null>(null);

    const permissionSlugs = permissions.flatMap((mod) => [
        ...mod.actions.map((a) => a.slug),
        ...mod.fields.flatMap((f) => f.fields.map((ff) => ff.slug)),
    ]);

    const getSlugsForCell = (permissionsArr: PermissionModule[], module: string, action: string): string[] => {
        const mod = permissionsArr.find((m) => m.module === module);
        if (!mod) return [];

        const actionSlug = mod.actions.find((a) => a.action === action)?.slug;
        const fieldSlugs = mod.fields.find((f) => f.action === action)?.fields.map((ff) => ff.slug) ?? [];

        return actionSlug ? [actionSlug, ...fieldSlugs] : [];
    };

    const RoleForm = ({ role, isEdit }: { role: RoleItem | null; isEdit: boolean }) => {
        const [selected, setSelected] = useState<string[]>(Array.isArray(role?.permission_slugs) ? [...role.permission_slugs] : []);

        const form = useForm({
            name: role?.name ?? '',
            description: role?.description ?? '',
            permissions: selected,
        });

        const toggleAction = (module: string, action: string) => {
            const slugs = getSlugsForCell(permissions, module, action);

            setSelected((prev) => {
                const allSelected = slugs.every((s) => prev.includes(s));
                const next = allSelected
                    ? prev.filter((s) => !slugs.includes(s))
                    : [...new Set([...prev, ...slugs])];
                form.setData('permissions', next);
                return next;
            });
        };

        const submit = (e: React.FormEvent) => {
            e.preventDefault();
            const payload = { name: form.data.name, description: form.data.description, permissions: selected };
            router[isEdit ? 'put' : 'post'](isEdit ? `/admin/roles/${role?.id}` : '/admin/roles', payload, {
                onSuccess: () => {
                    form.reset();
                    setSelected([]);
                    setShowCreate(false);
                    setEditing(null);
                },
            });
        };

        const isActionSelected = (module: string, action: string): boolean => {
            const slugs = getSlugsForCell(permissions, module, action);
            return slugs.length > 0 && slugs.every((s) => selected.includes(s));
        };

        const isActionPartial = (module: string, action: string): boolean => {
            const slugs = getSlugsForCell(permissions, module, action);
            if (slugs.length === 0) return false;
            const some = slugs.some((s) => selected.includes(s));
            return some && !isActionSelected(module, action);
        };

        return (
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Role Name *</label>
                        <input
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            disabled={isEdit && role?.is_system}
                            required
                            className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 disabled:bg-[#F7F9FC] disabled:text-gray-400"
                        />
                        {form.errors.name && <p className="text-red-500 text-xs mt-1">{form.errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                        <input
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            disabled={isEdit && role?.is_system}
                            className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 disabled:bg-[#F7F9FC] disabled:text-gray-400"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-medium text-gray-600">Permissions</label>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => { setSelected(permissionSlugs); form.setData('permissions', permissionSlugs); }} className="text-xs text-gold-600 font-medium hover:underline">
                                Select All
                            </button>
                            <button type="button" onClick={() => { setSelected([]); form.setData('permissions', []); }} className="text-xs text-gray-400 font-medium hover:underline">
                                Clear All
                            </button>
                        </div>
                    </div>

                    <div className="border border-[#E1E8F0] rounded-xl overflow-hidden max-h-[50vh] overflow-y-auto">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-[#F7F9FC] sticky top-0 z-10">
                                <tr className="text-left text-xs text-gray-400 border-b border-[#E1E8F0]">
                                    <th className="px-4 py-3 font-medium">Module</th>
                                    {alwaysShownActions.map((action) => (
                                        <th key={action} className="px-2 py-3 font-medium text-center uppercase">{action}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {permissions.map((mod) => (
                                    <tr key={mod.module} className="border-b border-[#F0F4F8] last:border-0">
                                        <td className="px-4 py-3 text-sm font-medium text-[#0D1B3E]">{mod.label}</td>
                                        {alwaysShownActions.map((action) => {
                                            const hasAction = mod.actions.some((a) => a.action === action);
                                            if (!hasAction) {
                                                return <td key={action} className="px-2 py-3 text-center"><span className="text-gray-200">—</span></td>;
                                            }
                                            const isSelected = isActionSelected(mod.module, action);
                                            const isPartial = isActionPartial(mod.module, action);
                                            return (
                                                <td key={action} className="px-2 py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        disabled={isEdit && role?.is_system}
                                                        onChange={() => toggleAction(mod.module, action)}
                                                        className={`w-4 h-4 rounded cursor-pointer ${isPartial ? 'ring-2 ring-gold-400/40' : ''}`}
                                                    />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                        {selected.length} of {permissionSlugs.length} permissions selected
                    </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#F0F4F8]">
                    <button type="button" onClick={() => { setShowCreate(false); setEditing(null); }} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">
                        Cancel
                    </button>
                    <button type="submit" disabled={form.processing || (isEdit && role?.is_system)} className="px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                        {form.processing ? 'Saving...' : isEdit ? 'Update Role' : 'Create Role'}
                    </button>
                </div>
            </form>
        );
    };

    return (
        <AdminLayout>
            <PageHeader
                title="Roles & Permissions"
                subtitle="Manage access control across the system"
                breadcrumbs={[{ label: 'Admin' }, { label: 'Roles & Permissions' }]}
                actions={
                    can?.roles?.create ? (
                        <button onClick={() => { setEditing(null); setShowCreate(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50] transition-colors">
                            <Plus size={16} /> Create Role
                        </button>
                    ) : undefined
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Roles list */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-[#E1E8F0] p-5">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="text-left text-xs text-gray-400 border-b border-[#F0F4F8]">
                                    <th className="pb-3 font-medium">Role</th>
                                    <th className="pb-3 font-medium">Description</th>
                                    <th className="pb-3 font-medium">Permissions</th>
                                    <th className="pb-3 font-medium">Users</th>
                                    <th className="pb-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.map((role) => (
                                    <tr key={role.id} className="border-b border-[#F0F4F8] last:border-0">
                                        <td className="py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0D1B3E] to-gold-500 flex items-center justify-center">
                                                    <Shield size={16} className="text-white" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-[#0D1B3E] text-sm flex items-center gap-1.5">
                                                        {role.name}
                                                        {role.is_system && (
                                                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-gold-600 bg-gold-100 px-1.5 py-0.5 rounded-full">
                                                                <Lock size={9} /> System
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-gray-400 text-xs">{role.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 text-sm text-gray-500 max-w-[220px] truncate">{role.description || '—'}</td>
                                        <td className="py-3.5 text-sm text-gray-600">{role.permission_count}</td>
                                        <td className="py-3.5 text-sm text-gray-600">{role.user_count}</td>
                                        <td className="py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => { setShowCreate(false); setEditing(role); }}
                                                    disabled={!can?.roles?.edit || role.is_system}
                                                    title={role.is_system ? 'System roles cannot be edited' : 'Edit role'}
                                                    className="p-2 text-gray-400 hover:text-[#0D1B3E] rounded-lg hover:bg-[#F8FAFD] disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(role)}
                                                    disabled={!can?.roles?.delete || role.is_system}
                                                    title={role.is_system ? 'System roles cannot be deleted' : 'Delete role'}
                                                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Help card */}
                <div className="bg-gradient-to-br from-[#0D1B3E] to-[#1A2B50] rounded-xl p-5 text-white h-fit sticky top-20">
                    <div className="flex items-center gap-2 mb-3">
                        <Shield size={18} className="text-gold-400" />
                        <h3 className="font-semibold">Access Control</h3>
                    </div>
                    <p className="text-sm text-blue-200/80 leading-relaxed mb-4">
                        Roles define the specific actions users can perform. Each permission controls access to a module, action, or individual field.
                    </p>
                    <ul className="space-y-2 text-xs text-blue-200/70">
                        <li className="flex gap-2"><Check size={14} className="text-gold-400 flex-shrink-0 mt-0.5" /> Module-level: view/create/edit/delete</li>
                        <li className="flex gap-2"><Check size={14} className="text-gold-400 flex-shrink-0 mt-0.5" /> Action-level: export, approve</li>
                        <li className="flex gap-2"><Check size={14} className="text-gold-400 flex-shrink-0 mt-0.5" /> Field-level: fine-grained control</li>
                    </ul>
                    <p className="text-xs text-blue-200/50 mt-4 italic">
                        Super Admin and Admin are system roles and cannot be modified.
                    </p>
                </div>
            </div>

            <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Role" subtitle="Define a new role and its access permissions" size="xl">
                <RoleForm role={null} isEdit={false} />
            </Modal>

            <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit Role`} subtitle={editing?.name} size="xl">
                {editing && <RoleForm role={editing} isEdit={true} />}
            </Modal>

            <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Role" size="sm">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Are you sure you want to delete the role <span className="font-semibold text-[#0D1B3E]">{deleteTarget?.name}</span>? This cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (deleteTarget) {
                                    router.delete(`/admin/roles/${deleteTarget.id}`, { onSuccess: () => setDeleteTarget(null) });
                                }
                            }}
                            className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
                        >
                            Delete Role
                        </button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
