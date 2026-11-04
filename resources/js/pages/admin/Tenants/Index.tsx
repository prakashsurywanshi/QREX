import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/layout/AdminLayout';
import { Plus, Building } from 'lucide-react';

export default function Index({ tenants }: any) {
    return (
        <AdminLayout>
            <Head title="Tenants" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
                        <p className="text-muted-foreground">Multi-tenant management for SaaS mode</p>
                    </div>
                    <Link href={route('admin.tenants.create')}>
                        <Button className="gap-2"><Plus className="h-4 w-4" />Add Tenant</Button>
                    </Link>
                </div>
                <Card>
                    <CardHeader><CardTitle>All Tenants</CardTitle></CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="p-3 text-left text-sm font-medium">Name</th>
                                        <th className="p-3 text-left text-sm font-medium">Domain/Subdomain</th>
                                        <th className="p-3 text-left text-sm font-medium">Status</th>
                                        <th className="p-3 text-left text-sm font-medium">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tenants.data?.map((t: any) => (
                                        <tr key={t.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3 font-medium flex items-center gap-2"><Building className="h-4 w-4" />{t.name}</td>
                                            <td className="p-3 text-sm text-muted-foreground">{t.domain || t.subdomain || '-'}</td>
                                            <td className="p-3"><Badge className="capitalize">{t.status}</Badge></td>
                                            <td className="p-3 text-muted-foreground">{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
