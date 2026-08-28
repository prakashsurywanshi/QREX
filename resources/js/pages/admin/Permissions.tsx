import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Shield, Layers } from 'lucide-react';
import type { PageProps } from '@/types';

interface PermissionItem {
    id: number;
    slug: string;
    name: string;
    action: string;
    field: string | null;
    description: string | null;
}

interface PermissionGroup {
    module: string;
    label: string;
    permissions: PermissionItem[];
}

interface Props extends PageProps {
    permissionGroups: PermissionGroup[];
    total: number;
}

export default function Permissions(props: Props) {
    const { permissionGroups, total } = props;
    const [filter, setFilter] = useState('');

    const filtered = permissionGroups
        .map((group) => ({
            ...group,
            permissions: group.permissions.filter((p) => {
                if (!filter) return true;
                return (
                    p.slug.toLowerCase().includes(filter.toLowerCase()) ||
                    p.name.toLowerCase().includes(filter.toLowerCase())
                );
            }),
        }))
        .filter((group) => group.permissions.length > 0);

    return (
        <AdminLayout>
            <PageHeader
                title="Permissions"
                subtitle={`${total} permission definitions across all modules`}
                breadcrumbs={[{ label: 'Admin' }, { label: 'Permissions' }]}
            />

            <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Shield size={16} className="text-gold-500" />
                    <h3 className="font-semibold text-[#0D1B3E] text-sm">All Permissions</h3>
                    <div className="flex-1" />
                    <input
                        type="text"
                        placeholder="Filter permissions..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3.5 py-1.5 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 w-56"
                    />
                </div>

                <div className="space-y-5">
                    {filtered.map((group) => (
                        <div key={group.module} className="border border-[#F0F4F8] rounded-lg overflow-hidden">
                            <div className="flex items-center gap-2 px-4 py-3 bg-[#F7F9FC] border-b border-[#F0F4F8]">
                                <Layers size={14} className="text-gold-500" />
                                <span className="font-semibold text-[#0D1B3E] text-sm">{group.label}</span>
                                <span className="text-[10px] text-gray-400 ml-auto">{group.permissions.length} permissions</span>
                            </div>
                            <div className="divide-y divide-[#F0F4F8]">
                                {group.permissions.map((perm) => (
                                    <div key={perm.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <code className="text-xs font-mono bg-[#F7F9FC] text-[#0D1B3E] px-2 py-1 rounded-md truncate">{perm.slug}</code>
                                            {perm.field && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gold-100 text-gold-700 font-medium">field</span>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-400 truncate ml-4">{perm.description || perm.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
