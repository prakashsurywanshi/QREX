import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/layout/AdminLayout';
import { ArrowLeft, Plus, Building2 } from 'lucide-react';

export default function Show({ project }: any) {
    const getStatusColor = (status: string) => {
        const colors: any = { available: 'default', hold: 'secondary', booked: 'warning', sold: 'destructive', blocked: 'outline' };
        return colors[status] || 'secondary';
    };

    return (
        <AdminLayout>
            <Head title={project.name} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.projects.index')}>
                            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Building2 className="h-8 w-8" />{project.name}</h1>
                            <p className="text-muted-foreground">{project.location} • {project.developer}</p>
                        </div>
                    </div>
                    <Badge variant={project.status === 'ongoing' ? 'default' : 'secondary'} className="capitalize">{project.status}</Badge>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Inventory Matrix</CardTitle>
                        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Add Unit</Button>
                    </CardHeader>
                    <CardContent>
                        {project.towers?.length > 0 ? (
                            project.towers.map((tower: any) => (
                                <div key={tower.id} className="mb-6">
                                    <h3 className="text-lg font-semibold mb-3">{tower.name}</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                        {tower.units?.map((unit: any) => (
                                            <Card key={unit.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                                <CardContent className="p-3 text-center">
                                                    <div className="font-semibold">{unit.unit_no}</div>
                                                    <div className="text-xs text-muted-foreground">{unit.unit_type.toUpperCase()}</div>
                                                    <Badge variant={getStatusColor(unit.status)} className="mt-1 text-xs capitalize">{unit.status}</Badge>
                                                    {unit.price && <div className="text-xs mt-1 font-medium">₹{Number(unit.price).toLocaleString('en-IN')}</div>}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No towers added yet. Add towers and units to manage inventory.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
