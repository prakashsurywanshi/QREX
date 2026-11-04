import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/layout/AdminLayout';
import { Save } from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing } = useForm({
        name: '', domain: '', subdomain: '', status: 'active',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.tenants.store'));
    };

    return (
        <AdminLayout>
            <Head title="Create Tenant" />
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Tenant</h1>
                    <p className="text-muted-foreground">Add new tenant for SaaS/white-label</p>
                </div>
                <form onSubmit={submit}>
                    <Card>
                        <CardHeader><CardTitle>Tenant Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Tenant Name *</Label>
                                <Input value={data.name} onChange={e => setData('name', e.target.value)} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Custom Domain</Label>
                                    <Input value={data.domain} onChange={e => setData('domain', e.target.value)} placeholder="example.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Subdomain</Label>
                                    <Input value={data.subdomain} onChange={e => setData('subdomain', e.target.value)} placeholder="client" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Status *</Label>
                                <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="trial">Trial</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" disabled={processing} className="gap-2"><Save className="h-4 w-4" />Create Tenant</Button>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AdminLayout>
    );
}
