<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Models\Task;
use Illuminate\Console\Command;

class CheckFollowups extends Command
{
    protected $signature = 'leads:check-followups';

    protected $description = 'Flags overdue follow-up tasks and notifies the assigned agents';

    public function handle(): int
    {
        $today = now()->toDateString();

        $tasks = Task::query()
            ->with(['assignedTo', 'lead'])
            ->where('type', 'Follow-up')
            ->where('status', '!=', 'Completed')
            ->whereNotNull('due_date')
            ->where('due_date', '<=', $today)
            ->get();

        $notified = 0;

        foreach ($tasks as $task) {
            if ($task->due_date < $today && $task->status !== 'Overdue') {
                $task->update(['status' => 'Overdue']);
            }

            $user = $task->assignedTo;

            if (!$user) {
                continue;
            }

            $recent = Notification::where('user_id', $user->id)
                ->where('type', 'followup')
                ->where('related_id', $task->lead_id)
                ->where('is_read', false)
                ->where('created_at', '>=', now()->subHours(12))
                ->exists();

            if ($recent) {
                continue;
            }

            $isDueToday = $task->due_date === $today;

            $title = $isDueToday ? 'Follow-up due today' : 'Follow-up overdue';
            $message = sprintf(
                '%s: %s (%s)',
                $task->title,
                $isDueToday ? 'due today' : 'overdue since '.$task->due_date,
                $task->lead?->name ? 'Lead: '.$task->lead->name : 'No lead'
            );

            Notification::create([
                'user_id' => $user->id,
                'title' => $title,
                'message' => $message,
                'type' => 'followup',
                'related_id' => $task->lead_id,
                'is_read' => false,
            ]);

            $notified++;
        }

        $this->info("Checked follow-up tasks. Notified {$notified} agent(s).");

        return self::SUCCESS;
    }
}
