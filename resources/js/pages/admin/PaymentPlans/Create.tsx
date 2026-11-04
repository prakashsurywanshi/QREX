import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/layout/AdminLayout';
import { Plus, Trash2, Save } from 'lucide-react';
import { useState } from 'react';

export default function Create({ bookings, units }: any) {
    const { data, setData, post, processing } = useForm({
        plan_name: '',
        booking_id: '',
        unit_id: '',
        total_amount: '',
        plan_type: 'milestone',
        installments: [{ milestone_name: 'Booking Amount', due_date: '', amount: '', percentage: '' }],
    });

    const addInstallment = () => {
        setData('installments', [...data.installments, { milestone_name: '', due_date: '', amount: '', percentage: '' }]);
    };

    const removeInstallment = (idx: number) => {
        setData('installments', data.installments.filter((_: any, i: number) => i !== idx));
    };

    const updateInstallment = (idx: number, field: string, value: string) => {
        const updated = [...data.installments];
        updated[idx][field] = value;
        setData('installments', updated);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.payment-plans.store'));
    };

    return (
        <AdminLayout>
            <Head title="Create Payment Plan" />
            <div className="max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Payment Plan</h1>
                    <p className="text-muted-foreground">Milestone or slab-based installment schedule</p>
                </div>
                <form onSubmit={submit}>
                    <Card>
                        <CardHeader><CardTitle>Plan Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Plan Name *</Label>
                                    <Input value={data.plan_name} onChange={e => setData('plan_name', e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Plan Type *</Label>
                                    <Select value={data.plan_type} onValueChange={(v) => setData('plan_type', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="milestone">Milestone</SelectItem>
                                            <SelectItem value="slab">Slab-wise</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Booking (Optional)</Label>
                                    <Select value={data.booking_id} onValueChange={(v) => setData('booking_id', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {bookings?.map((b: any) => <SelectItem key={b.id} value={b.id.toString()}>Booking #{b.id}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Unit (Optional)</Label>
                                    <Select value={data.unit_id} onValueChange={(v) => setData('unit_id', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {units?.map((u: any) => <SelectItem key={u.id} value={u.id.toString()}>{u.unit_no}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Total Amount *</Label>
                                    <Input type="number" value={data.total_amount} onChange={e => setData('total_amount', e.target.value)} required />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Installments</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addInstallment} className="gap-1"><Plus className="h-4 w-4" />Add Installment</Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {data.installments.map((inst: any, idx: number) => (
                                <div key={idx} className="grid grid-cols-5 gap-3 items-end p-3 border rounded-lg">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Milestone</Label>
                                        <Input value={inst.milestone_name} onChange={e => updateInstallment(idx, 'milestone_name', e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Due Date</Label>
                                        <Input type="date" value={inst.due_date} onChange={e => updateInstallment(idx, 'due_date', e.target.value)} required />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Amount</Label>
                                        <Input type="number" value={inst.amount} onChange={e => updateInstallment(idx, 'amount', e.target.value)} required />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">%</Label>
                                        <Input type="number" value={inst.percentage} onChange={e => updateInstallment(idx, 'percentage', e.target.value)} />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeInstallment(idx)} disabled={data.installments.length === 1}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            ))}
                            <Button type="submit" disabled={processing} className="gap-2"><Save className="h-4 w-4" />Create Payment Plan</Button>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AdminLayout>
    );
}
