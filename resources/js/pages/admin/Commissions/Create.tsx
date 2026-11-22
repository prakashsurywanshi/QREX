import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/components/layout/AdminLayout';
import { Calculator, Save } from 'lucide-react';

interface Props {
    deals: any[];
    bookings: any[];
    agents: { id: number; name: string }[];
    rules: any[];
}

export default function Create({ deals, bookings, agents }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        deal_id: '',
        booking_id: '',
        property_id: '',
        agent_id: '',
        commission_type: 'percentage',
        commission_rate: '',
        commission_amount: '',
        base_amount: '',
        split_type: 'individual',
        notes: '',
        splits: [],
    });

    const calculateCommission = () => {
        const base = parseFloat(data.base_amount) || 0;
        if (data.commission_type === 'percentage' && data.commission_rate) {
            const amount = (base * parseFloat(data.commission_rate)) / 100;
            setData('commission_amount', amount.toFixed(2));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.commissions.store'));
    };

    return (
        <AdminLayout>
            <Head title="Create Commission" />
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Commission</h1>
                    <p className="text-muted-foreground">Generate commission for deal or booking</p>
                </div>

                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Commission Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Related Deal (Optional)</Label>
                                    <Select value={data.deal_id} onValueChange={(v) => setData('deal_id', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select deal" /></SelectTrigger>
                                        <SelectContent>
                                            {deals.map(d => <SelectItem key={d.id} value={d.id.toString()}>Deal #{d.id}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Related Booking (Optional)</Label>
                                    <Select value={data.booking_id} onValueChange={(v) => setData('booking_id', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select booking" /></SelectTrigger>
                                        <SelectContent>
                                            {bookings.map(b => <SelectItem key={b.id} value={b.id.toString()}>Booking #{b.id}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Agent *</Label>
                                <Select value={data.agent_id} onValueChange={(v) => setData('agent_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
                                    <SelectContent>
                                        {agents.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {errors.agent_id && <p className="text-sm text-destructive">{errors.agent_id}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Base Amount (Deal/Booking Value)</Label>
                                    <Input type="number" value={data.base_amount} onChange={e => setData('base_amount', e.target.value)} placeholder="Enter base amount" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Commission Type *</Label>
                                    <Select value={data.commission_type} onValueChange={(v) => setData('commission_type', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage</SelectItem>
                                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {data.commission_type === 'percentage' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Commission Rate (%)</Label>
                                        <Input type="number" step="0.01" value={data.commission_rate} onChange={e => setData('commission_rate', e.target.value)} placeholder="e.g., 2.5" />
                                    </div>
                                    <div className="flex items-end">
                                        <Button type="button" variant="outline" onClick={calculateCommission} className="gap-2"><Calculator className="h-4 w-4" />Calculate</Button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Commission Amount *</Label>
                                <Input type="number" step="0.01" value={data.commission_amount} onChange={e => setData('commission_amount', e.target.value)} placeholder="Enter commission amount" required />
                                {errors.commission_amount && <p className="text-sm text-destructive">{errors.commission_amount}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Split Type *</Label>
                                <Select value={data.split_type} onValueChange={(v) => setData('split_type', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="individual">Individual</SelectItem>
                                        <SelectItem value="team">Team Split</SelectItem>
                                        <SelectItem value="co-broking">Co-Broking</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea value={data.notes} onChange={e => setData('notes', e.target.value)} placeholder="Additional notes..." />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing} className="gap-2"><Save className="h-4 w-4" />Create Commission</Button>
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AdminLayout>
    );
}
