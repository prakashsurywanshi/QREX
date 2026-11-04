import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/layout/AdminLayout';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function Show({ plan }: any) {
    const formatCurrency = (amount: any) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amount || 0));
    const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN');

    const getStatusBadge = (status: string) => {
        const variants: any = { pending: 'secondary', partially_paid: 'warning', paid: 'default', overdue: 'destructive', waived: 'outline' };
        return <Badge variant={variants[status] || 'secondary'} className="capitalize">{status.replace('_', ' ')}</Badge>;
    };

    return (
        <AdminLayout>
            <Head title={plan.plan_name} />
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.payment-plans.index')}>
                            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{plan.plan_name}</h1>
                            <p className="text-muted-foreground capitalize">{plan.plan_type} Plan</p>
                        </div>
                    </div>
                    <Badge>{plan.status}</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Amount</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{formatCurrency(plan.total_amount)}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Installments</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{plan.installments?.length || 0}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Plan Type</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold capitalize">{plan.plan_type}</div></CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader><CardTitle>Installment Schedule</CardTitle></CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="p-3 text-left text-sm font-medium">#</th>
                                        <th className="p-3 text-left text-sm font-medium">Milestone</th>
                                        <th className="p-3 text-left text-sm font-medium">Due Date</th>
                                        <th className="p-3 text-left text-sm font-medium">Amount</th>
                                        <th className="p-3 text-left text-sm font-medium">Paid</th>
                                        <th className="p-3 text-left text-sm font-medium">Balance</th>
                                        <th className="p-3 text-left text-sm font-medium">Status</th>
                                        <th className="p-3 text-right text-sm font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plan.installments?.map((inst: any) => (
                                        <tr key={inst.id} className="border-b">
                                            <td className="p-3">{inst.installment_no}</td>
                                            <td className="p-3 font-medium">{inst.milestone_name}</td>
                                            <td className="p-3">{formatDate(inst.due_date)}</td>
                                            <td className="p-3">{formatCurrency(inst.amount)}</td>
                                            <td className="p-3">{formatCurrency(inst.paid_amount)}</td>
                                            <td className="p-3">{formatCurrency(inst.balance_amount)}</td>
                                            <td className="p-3">{getStatusBadge(inst.status)}</td>
                                            <td className="p-3 text-right">
                                                {inst.status !== 'paid' && (
                                                    <Button size="sm" variant="outline" className="gap-1"><CheckCircle className="h-4 w-4" />Mark Paid</Button>
                                                )}
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
