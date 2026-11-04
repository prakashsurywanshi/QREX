import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Phone, Mail, Calendar, FileText } from 'lucide-react';
import { router } from '@inertiajs/react';

interface Props {
    leadId: number;
    communications?: any[];
}

export default function CommunicationTimeline({ leadId, communications = [] }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [type, setType] = useState('note');
    const [content, setContent] = useState('');
    const [callOutcome, setCallOutcome] = useState('');
    const [duration, setDuration] = useState('');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('admin.communications.store'), {
            communicable_type: 'App\\Models\\Lead',
            communicable_id: leadId,
            type,
            content,
            direction: type === 'call' ? 'outbound' : 'outbound',
            call_outcome: callOutcome || null,
            duration_minutes: duration ? parseInt(duration) : null,
        }, {
            onSuccess: () => {
                setShowForm(false);
                setContent('');
                setCallOutcome('');
                setDuration('');
            }
        });
    };

    const getIcon = (type: string) => {
        if (type === 'call') return Phone;
        if (type === 'whatsapp') return MessageSquare;
        if (type === 'email') return Mail;
        if (type === 'site_visit') return Calendar;
        return FileText;
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />Communication Timeline</CardTitle>
                <Button size="sm" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Log Activity'}</Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {showForm && (
                    <form onSubmit={submit} className="space-y-3 p-4 border rounded-lg bg-muted/30">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>Type</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="note">Note</SelectItem>
                                        <SelectItem value="call">Call</SelectItem>
                                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {type === 'call' && (
                                <>
                                    <div className="space-y-1">
                                        <Label>Outcome</Label>
                                        <Select value={callOutcome} onValueChange={setCallOutcome}>
                                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="connected">Connected</SelectItem>
                                                <SelectItem value="interested">Interested</SelectItem>
                                                <SelectItem value="not-interested">Not Interested</SelectItem>
                                                <SelectItem value="voicemail">Voicemail</SelectItem>
                                                <SelectItem value="no-answer">No Answer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Duration (min)</Label>
                                        <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label>Details</Label>
                            <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Add notes, call summary..." required />
                        </div>
                        <Button type="submit" size="sm">Save</Button>
                    </form>
                )}

                <div className="space-y-3">
                    {communications.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No communications yet</p>
                    ) : (
                        communications.map((comm: any) => {
                            const Icon = getIcon(comm.type);
                            return (
                                <div key={comm.id} className="flex gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                        <Icon className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium capitalize">{comm.type.replace('_', ' ')}</p>
                                            <span className="text-xs text-muted-foreground">{new Date(comm.created_at).toLocaleString('en-IN')}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{comm.content}</p>
                                        {comm.call_outcome && <p className="text-xs">Outcome: <span className="capitalize">{comm.call_outcome.replace('-', ' ')}</span></p>}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
