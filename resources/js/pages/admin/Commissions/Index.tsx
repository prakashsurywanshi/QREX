import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/AdminLayout';
import { Plus, Eye, CheckCircle, XCircle, DollarSign, Clock, CheckCheck } from 'lucide-react';
import { useState } from 'react';

interface Commission {
    id: number;
    agent: { name: string };
    commission_type: string;
    commission_amount: string;
    base_amount: string;
    status: string;
    split_type: string;
    deal?: { id: number };
    booking?: { id: number };
    created_at: string;
}

interface Props {
    commissions: { data: Commission[]; links: any[]; meta?: any };
    summary: { pending: number; approved: number; paid: number };
    agents: { id: number; name: string }[];
    filters: { status?: string; agent_id?: string };
}

export default function Index({ commissions, summary, agents, filters }: Props) {
    const [status, setStatus] = useState(filters.status || 'all');
    const [agentId, setAgentId] = useState(filters.agent_id || 'all');

    const applyFilters = () => {
        router.get(route('admin.commissions.index'), {
            status: status === 'all' ? undefined : status,
            agent_id: agentId === 'all' ? undefined : agentId,
        }, { preserveState: true });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            pending: { variant: 'secondary', icon: Clock, label: 'Pending' },
            approved: { variant: 'default', icon: CheckCircle, label: 'Approved' },
            paid: { variant: 'success', icon: DollarSign, label: 'Paid' },
            rejected: { variant: 'destructive', icon: XCircle, label: 'Rejected' },
        };
        const v = variants[status] || variants.pending;
        const Icon = v.icon;
        return <Badge variant={v.variant} className="gap-1"><Icon className="h-3 w-3" />{v.label}</Badge>;
    };

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amount));
    };

    return (
        <AdminLayout>
            <Head title="Commissions" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Commissions</h1>
                        <p className="text-muted-foreground">Manage agent commissions, splits and payouts</p>
                    </div>
                    <Link href={route('admin.commissions.create')}>
                        <Button className="gap-2"><Plus className="h-4 w-4" />Create Commission</Button>
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.pending.toString())}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.approved.toString())}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Paid</CardTitle>
                            <CheckCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.paid.toString())}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap items-center gap-4">
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={agentId} onValueChange={setAgentId}>
                                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Agent" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Agents</SelectItem>
                                    {agents.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Button onClick={applyFilters}>Apply Filters</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="p-3 text-left text-sm font-medium">Agent</th>
                                        <th className="p-3 text-left text-sm font-medium">Type</th>
                                        <th className="p-3 text-left text-sm font-medium">Base Amount</th>
                                        <th className="p-3 text-left text-sm font-medium">Commission</th>
                                        <th className="p-3 text-left text-sm font-medium">Split</th>
                                        <th className="p-3 text-left text-sm font-medium">Status</th>
                                        <th className="p-3 text-left text-sm font-medium">Date</th>
                                        <th className="p-3 text-right text-sm font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {commissions.data.map((c) => (
                                        <tr key={c.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3 font-medium">{c.agent?.name}</td>
                                            <td className="p-3 capitalize">{c.commission_type}</td>
                                            <td className="p-3">{c.base_amount ? formatCurrency(c.base_amount) : '-'}</td>
                                            <td className="p-3 font-semibold">{formatCurrency(c.commission_amount)}</td>
                                            <td className="p-3 capitalize">{c.split_type}</td>
                                            <td className="p-3">{getStatusBadge(c.status)}</td>
                                            <td className="p-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                                            <td className="p-3 text-right">
                                                <Link href={route('admin.commissions.show', c.id)}>
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
