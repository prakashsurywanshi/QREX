import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/layout/AdminLayout';
import { Plus, Eye, Calendar } from 'lucide-react';

export default function Index({ plans }: any) {
    const formatCurrency = (amount: any) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amount || 0));
    
    return (
        <AdminLayout>
            <Head title="Payment Plans" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Payment Plans</h1>
                        <p className="text-muted-foreground">Manage installment schedules for bookings</p>
                    </div>
                    <Link href={route('admin.payment-plans.create')}>
                        <Button className="gap-2"><Plus className="h-4 w-4" />Create Plan</Button>
                    </Link>
                </div>
                <Card>
                    <CardHeader><CardTitle>All Payment Plans</CardTitle></CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="p-3 text-left text-sm font-medium">Plan</th>
                                        <th className="p-3 text-left text-sm font-medium">Type</th>
                                        <th className="p-3 text-left text-sm font-medium">Total Amount</th>
                                        <th className="p-3 text-left text-sm font-medium">Installments</th>
                                        <th className="p-3 text-left text-sm font-medium">Status</th>
                                        <th className="p-3 text-right text-sm font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plans.data?.map((plan: any) => (
                                        <tr key={plan.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3 font-medium">{plan.plan_name}</td>
                                            <td className="p-3 capitalize">{plan.plan_type}</td>
                                            <td className="p-3 font-semibold">{formatCurrency(plan.total_amount)}</td>
                                            <td className="p-3">{plan.installments?.length || 0}</td>
                                            <td className="p-3"><Badge>{plan.status}</Badge></td>
                                            <td className="p-3 text-right">
                                                <Link href={route('admin.payment-plans.show', plan.id)}>
                                                    <Button variant="ghost" size="sm" className="gap-1"><Eye className="h-4 w-4" />View</Button>
                                                </Link>
                                            </td>
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
