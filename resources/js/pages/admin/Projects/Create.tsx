import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/components/layout/AdminLayout';
import { Save } from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing } = useForm({
        name: '', location: '', developer: '', rera_no: '', status: 'upcoming', description: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.projects.store'));
    };

    return (
        <AdminLayout>
            <Head title="Create Project" />
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Project</h1>
                    <p className="text-muted-foreground">Add new project with towers and units</p>
                </div>
                <form onSubmit={submit}>
                    <Card>
                        <CardHeader><CardTitle>Project Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Project Name *</Label>
                                    <Input value={data.name} onChange={e => setData('name', e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status *</Label>
                                    <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="upcoming">Upcoming</SelectItem>
                                            <SelectItem value="ongoing">Ongoing</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Input value={data.location} onChange={e => setData('location', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Developer</Label>
                                    <Input value={data.developer} onChange={e => setData('developer', e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>RERA No.</Label>
                                <Input value={data.rera_no} onChange={e => setData('rera_no', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={4} />
                            </div>
                            <Button type="submit" disabled={processing} className="gap-2"><Save className="h-4 w-4" />Create Project</Button>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AdminLayout>
    );
}
