import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/layout/AdminLayout';
import { Plus, Eye, Building2 } from 'lucide-react';

export default function Index({ projects }: any) {
    return (
        <AdminLayout>
            <Head title="Projects & Inventory" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Projects & Inventory</h1>
                        <p className="text-muted-foreground">Manage projects, towers, units with availability</p>
                    </div>
                    <Link href={route('admin.projects.create')}>
                        <Button className="gap-2"><Plus className="h-4 w-4" />Add Project</Button>
                    </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.data?.map((project: any) => (
                        <Card key={project.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />{project.name}</CardTitle>
                                    <Badge variant={project.status === 'ongoing' ? 'default' : 'secondary'}>{project.status}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground">{project.location}</p>
                                <div className="flex items-center justify-between text-sm">
                                    <span>Total Units</span>
                                    <span className="font-semibold">{project.units_count || 0}</span>
                                </div>
                                <Link href={route('admin.projects.show', project.id)}>
                                    <Button variant="outline" className="w-full gap-2"><Eye className="h-4 w-4" />View Inventory</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
