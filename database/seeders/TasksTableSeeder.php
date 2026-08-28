<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class TasksTableSeeder extends Seeder
{
    public function run(): void
    {
        $agent = User::where('email', 'amit.v@example.in')->first();
        $agent2 = User::where('email', 'sneha.k@example.in')->first();
        $manager = User::where('email', 'vikram@example.in')->first();

        $tasks = [
            ['id' => 'TSK-001', 'title' => 'Follow up with Rohit Joshi on Skyline Heights', 'type' => 'Follow-up', 'status' => 'Pending', 'priority' => 'High', 'due' => now()->format('Y-m-d'), 'assignee' => $agent],
            ['id' => 'TSK-002', 'title' => 'Call Priya Patel — resume negotiation', 'type' => 'Call', 'status' => 'In Progress', 'priority' => 'High', 'due' => now()->format('Y-m-d'), 'assignee' => $agent2],
            ['id' => 'TSK-003', 'title' => 'Prepare agreement for Anjali Verma', 'type' => 'Document', 'status' => 'Pending', 'priority' => 'Urgent', 'due' => now()->addDay()->format('Y-m-d'), 'assignee' => $manager],
            ['id' => 'TSK-004', 'title' => 'Site visit follow-up — Marina Bay', 'type' => 'Site Visit', 'status' => 'Pending', 'priority' => 'Medium', 'due' => now()->addDays(2)->format('Y-m-d'), 'assignee' => $agent],
            ['id' => 'TSK-005', 'title' => 'Send brochure to Manish Agarwal', 'type' => 'Email', 'status' => 'Completed', 'priority' => 'Low', 'due' => now()->subDay()->format('Y-m-d'), 'assignee' => $agent2],
            ['id' => 'TSK-006', 'title' => 'Update BKC Commercial listing details', 'type' => 'Task', 'status' => 'Pending', 'priority' => 'Medium', 'due' => now()->addDays(1)->format('Y-m-d'), 'assignee' => $agent2],
        ];

        foreach ($tasks as $t) {
            Task::updateOrCreate(
                ['task_id' => $t['id']],
                [
                    'title' => $t['title'],
                    'type' => $t['type'],
                    'status' => $t['status'],
                    'priority' => $t['priority'],
                    'due_date' => $t['due'],
                    'assigned_to_id' => $t['assignee']?->id,
                    'created_by' => $manager?->id,
                ]
            );
        }
    }
}
