<?php

namespace App\Console\Commands;

use App\Models\Installment;
use Illuminate\Console\Command;

class MarkOverdueInstallmentsCommand extends Command
{
    protected $signature = 'qrex:mark-overdue-installments';
    protected $description = 'Mark pending/partially paid installments past due as overdue';

    public function handle(): int
    {
        $count = Installment::query()
            ->whereIn('status', ['pending', 'partially_paid'])
            ->whereDate('due_date', '<', now()->toDateString())
            ->update(['status' => 'overdue']);

        $this->info("Marked {$count} installments as overdue.");
        return self::SUCCESS;
    }
}
