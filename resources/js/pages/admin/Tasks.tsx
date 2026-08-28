import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { Plus, CheckSquare, Clock, AlertTriangle, CheckCircle2, CalendarDays, Trash2, Phone, CalendarCheck, Mail, FileText, User, Filter } from 'lucide-react';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    tasks: any[];
    agents: any[];
    leads: any[];
    statuses: string[];
    types: string[];
    priorities: string[];
    summary: any;
}

const priorityColor: Record<string, string> = {
    Low: 'bg-gray-100 text-gray-600',
    Medium: 'bg-blue-100 text-blue-700',
    High: 'bg-amber-100 text-amber-700',
    Urgent: 'bg-red-100 text-red-700',
};

const statusColor: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    Overdue: 'bg-red-100 text-red-700',
    Completed: 'bg-emerald-100 text-emerald-700',
};

const typeIcon: Record<string, any> = {
    Call: Phone,
    Email: Mail,
    'Site Visit': CalendarCheck,
    Document: FileText,
    Meeting: CheckSquare,
};

const formatDue = (d: string) => {
    if (!d) return 'No due date';
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export default function Tasks(props: Props) {
    const { tasks, agents, leads, statuses, types, priorities, summary } = props;
    const [statusFilter, setStatusFilter] = useState('All');
    const [showAdd, setShowAdd] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        type: 'Follow-up',
        priority: 'Medium',
        due_date: '',
        due_time: '',
        assigned_to_id: '',
        lead_id: '',
        description: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/tasks', { onSuccess: () => setShowAdd(false) });
    };

    const changeStatus = (id: number, status: string) => {
        router.put(`/admin/tasks/${id}`, { status }, { preserveScroll: true });
    };

    const destroy = (id: number) => {
        if (confirm('Delete this task?')) {
            router.delete(`/admin/tasks/${id}`);
        }
    };

    const filtered = statusFilter === 'All' ? tasks : tasks.filter((t) => t.status === statusFilter);

    return (
        <AdminLayout>
            <PageHeader
                title="Tasks & Follow-ups"
                subtitle="Manage tasks, reminders and follow-up activities"
                breadcrumbs={[{ label: 'Sales' }, { label: 'Tasks & Follow-ups' }]}
                actions={
                    <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-bold hover:bg-[#1A2B50] transition-colors">
                        <Plus size={16} /> New Task
                    </button>
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
                <StatCard icon={CheckSquare} label="Total" value={String(summary.total)} color="navy" />
                <StatCard icon={Clock} label="Pending" value={String(summary.pending)} color="gold" />
                <StatCard icon={AlertTriangle} label="Due Today" value={String(summary.dueToday)} color="red" />
                <StatCard icon={CalendarDays} label="In Progress" value={String(summary.inProgress)} color="blue" />
                <StatCard icon={AlertTriangle} label="Overdue" value={String(summary.overdue)} color="red" />
                <StatCard icon={CheckCircle2} label="Completed" value={String(summary.completed)} color="emerald" />
            </div>

            <div className="bg-white rounded-xl border border-[#E1E8F0] p-5">
                <div className="flex flex-wrap gap-2 mb-4">
                    {['All', ...statuses].map((s) => (
                        <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${statusFilter === s ? 'bg-[#0D1B3E] text-white' : 'bg-[#F7F9FC] text-gray-500'}`}>
                            {s}
                        </button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <EmptyState title="No tasks found" description="Create a new task or follow-up to get started." action={
                        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-bold">
                            <Plus size={16} /> Create Task
                        </button>
                    } />
                ) : (
                    <div className="space-y-2.5">
                        {filtered.map((t) => {
                            const TypeIcon = typeIcon[t.type] || CheckSquare;
                            return (
                                <div key={t.id} className="flex items-center gap-4 bg-[#F7F9FC] rounded-xl px-4 py-3">
                                    <div className="w-9 h-9 rounded-lg bg-[#0D1B3E]/5 text-[#0D1B3E] flex items-center justify-center flex-shrink-0">
                                        <TypeIcon size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-[#0D1B3E] text-sm truncate">{t.title}</div>
                                        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                                            <span>{t.task_id}</span>
                                            <span>·</span>
                                            <span>{t.type}</span>
                                            <span>·</span>
                                            <span className="flex items-center gap-1"><CalendarDays size={11} /> {formatDue(t.due_date)} {t.due_time && t.due_time}</span>
                                            <span>·</span>
                                            <span className="flex items-center gap-1"><User size={11} /> {t.assignee?.name || 'Unassigned'}</span>
                                        </div>
                                    </div>
                                    <span className={`status-badge ${priorityColor[t.priority] || 'bg-gray-100 text-gray-600'}`}>{t.priority}</span>
                                    <div className="hidden sm:flex items-center gap-1.5 bg-white border border-[#E1E8F0] rounded-lg p-0.5">
                                        {statuses.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => changeStatus(t.id, s)}
                                                title={s}
                                                className={`w-2.5 h-2.5 rounded-full transition-colors ${t.status === s ? 'ring-2 ring-[#0D1B3E]' : 'bg-gray-200 hover:bg-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className={`status-badge hidden md:inline-flex ${statusColor[t.status] || 'bg-gray-100 text-gray-600'}`}>{t.status}</span>
                                    <button onClick={() => destroy(t.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-white">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* New Task Modal */}
            <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Create Task" subtitle="Add a new task or follow-up" size="lg">
                <form onSubmit={submit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Task Title *</label>
                            <input value={data.title} onChange={(e) => setData('title', e.target.value)} required placeholder="e.g. Follow up with Rahul Sharma" className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type</label>
                            <select value={data.type} onChange={(e) => setData('type', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                {types.map((t) => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Priority</label>
                            <select value={data.priority} onChange={(e) => setData('priority', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                {priorities.map((p) => <option key={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Due Date</label>
                            <input type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Due Time</label>
                            <input type="time" value={data.due_time} onChange={(e) => setData('due_time', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Assign To</label>
                            <select value={data.assigned_to_id} onChange={(e) => setData('assigned_to_id', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                <option value="">Unassigned</option>
                                {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Related Lead</label>
                            <select value={data.lead_id} onChange={(e) => setData('lead_id', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                <option value="">None</option>
                                {leads.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={2} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                        <button type="submit" disabled={processing} className="px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-bold disabled:opacity-60">
                            {processing ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
