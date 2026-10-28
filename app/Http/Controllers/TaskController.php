<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::query()->with(['assignedTo', 'lead']);

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }
        if ($request->filled('assignee') && $request->assignee !== 'All') {
            $query->where('assigned_to_id', $request->assignee);
        }
        if ($request->filled('search')) {
            $query->where('title', 'like', '%'.$request->search.'%');
        }

        $tasks = $query->orderByRaw("FIELD(status, 'Pending', 'In Progress', 'Overdue', 'Completed')")
            ->orderBy('due_date')
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'task_id' => $t->task_id,
                'title' => $t->title,
                'description' => $t->description,
                'type' => $t->type,
                'status' => $t->status,
                'priority' => $t->priority,
                'due_date' => $t->due_date,
                'due_time' => $t->due_time,
                'related_to' => $t->related_to,
                'related_id' => $t->related_id,
                'lead_id' => $t->lead_id,
                'assignee' => $t->assignedTo ? ['id' => $t->assignedTo->id, 'name' => $t->assignedTo->name, 'initials' => $t->assignedTo->initials] : null,
            ]);

        return Inertia::render('admin/Tasks', [
            'tasks' => $tasks,
            'agents' => User::whereIn('role', ['Sales Executive', 'Senior Agent', 'Admin'])->get(['id', 'name', 'role'])->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'role' => $u->role,
                'initials' => $u->initials,
            ]),
            'leads' => Lead::visibleTo(Auth::user())->orderBy('created_at', 'desc')->limit(20)->get(['id', 'name']),
            'statuses' => ['Pending', 'In Progress', 'Overdue', 'Completed'],
            'types' => ['Follow-up', 'Call', 'Meeting', 'Site Visit', 'Email', 'Document', 'Task', 'Other'],
            'priorities' => ['Low', 'Medium', 'High', 'Urgent'],
            'summary' => [
                'total' => $tasks->count(),
                'pending' => $tasks->where('status', 'Pending')->count(),
                'inProgress' => $tasks->where('status', 'In Progress')->count(),
                'dueToday' => $tasks->where('due_date', now()->format('Y-m-d'))->whereNotIn('status', ['Completed'])->count(),
                'overdue' => $tasks->where('status', 'Overdue')->count(),
                'completed' => $tasks->where('status', 'Completed')->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['nullable', 'string'],
            'priority' => ['nullable', 'string'],
            'due_date' => ['nullable', 'string'],
            'due_time' => ['nullable', 'string'],
            'assigned_to_id' => ['nullable', 'integer'],
            'lead_id' => ['nullable', 'integer'],
            'description' => ['nullable', 'string'],
        ]);

        $task = Task::create([
            'task_id' => $this->nextId('TSK'),
            'title' => $request->title,
            'type' => $request->type ?: 'Follow-up',
            'priority' => $request->priority ?: 'Medium',
            'status' => 'Pending',
            'due_date' => $request->due_date,
            'due_time' => $request->due_time,
            'description' => $request->description,
            'assigned_to_id' => $request->assigned_to_id,
            'lead_id' => $request->lead_id,
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Task created.');
    }

    public function update(Request $request, Task $task)
    {
        $request->validate([
            'status' => ['nullable', 'string'],
            'title' => ['nullable', 'string'],
            'priority' => ['nullable', 'string'],
            'due_date' => ['nullable', 'string'],
            'assigned_to_id' => ['nullable', 'integer'],
        ]);

        $task->update($request->only(['status', 'title', 'priority', 'due_date', 'assigned_to_id', 'description']));

        return back()->with('success', 'Task updated.');
    }

    public function destroy(Task $task)
    {
        $task->delete();

        return back()->with('success', 'Task deleted.');
    }
}
