import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/layout/AdminLayout';
import { ArrowLeft, CheckCircle, XCircle, DollarSign, Edit } from 'lucide-react';

interface Props {
    commission: any;
}

export default function Show({ commission }: Props) {
    const formatCurrency = (amount: any) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amount || 0));
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            pending: { variant: 'secondary', label: 'Pending' },
            approved: { variant: 'default', label: 'Approved' },
            paid: { variant: 'success', label: 'Paid' },
            rejected: { variant: 'destructive', label: 'Rejected' },
        };
        const v = variants[status] || variants.pending;
        return <Badge variant={v.variant}>{v.label}</Badge>;
    };

    return (
        <AdminLayout>
            <Head title={`Commission #${commission.id}`} />
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.commissions.index')}>
                            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Commission #{commission.id}</h1>
                            <p className="text-muted-foreground">Commission details and actions</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {commission.status === 'pending' && (
                            <>
                                <Link href={route('admin.commissions.edit', commission.id)}>
                                    <Button variant="outline" className="gap-2"><Edit className="h-4 w-4" />Edit</Button>
                                </Link>
                                <Button onClick={() => router.post(route('admin.commissions.approve', commission.id))} className="gap-2"><CheckCircle className="h-4 w-4" />Approve</Button>
                                <Button variant="destructive" onClick={() => router.post(route('admin.commissions.reject', commission.id))} className="gap-2"><XCircle className="h-4 w-4" />Reject</Button>
                            </>
                        )}
                        {commission.status === 'approved' && (
                            <Button onClick={() => router.post(route('admin.commissions.pay', commission.id))} className="gap-2"><DollarSign className="h-4 w-4" />Mark as Paid</Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Commission Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                {getStatusBadge(commission.status)}
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Agent</span>
                                <span className="font-medium">{commission.agent?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Type</span>
                                <span className="capitalize">{commission.commission_type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Split Type</span>
                                <span className="capitalize">{commission.split_type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Base Amount</span>
                                <span>{formatCurrency(commission.base_amount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Commission Amount</span>
                                <span className="text-lg font-bold">{formatCurrency(commission.commission_amount)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created</span>
                                <span>{new Date(commission.created_at).toLocaleString('en-IN')}</span>
                            </div>
                            {commission.approved_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Approved</span>
                                    <span>{new Date(commission.approved_at).toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            {commission.paid_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Paid</span>
                                    <span>{new Date(commission.paid_at).toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            {commission.payment_reference && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Payment Ref</span>
                                    <span>{commission.payment_reference}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {commission.splits && commission.splits.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Commission Splits</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left text-sm font-medium">User</th>
                                            <th className="p-3 text-left text-sm font-medium">Role</th>
                                            <th className="p-3 text-left text-sm font-medium">Share %</th>
                                            <th className="p-3 text-right text-sm font-medium">Share Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {commission.splits.map((split: any) => (
                                            <tr key={split.id} className="border-b">
                                                <td className="p-3">{split.user?.name}</td>
                                                <td className="p-3 capitalize">{split.role}</td>
                                                <td className="p-3">{split.share_percentage}%</td>
                                                <td className="p-3 text-right font-medium">{formatCurrency(split.share_amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {commission.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{commission.notes}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}
