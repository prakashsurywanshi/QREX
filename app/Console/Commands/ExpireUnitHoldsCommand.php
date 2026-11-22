<?php

namespace App\Console\Commands;

use App\Models\Unit;
use Illuminate\Console\Command;

class ExpireUnitHoldsCommand extends Command
{
    protected $signature = 'qrex:expire-unit-holds';
    protected $description = 'Release units whose hold has expired';

    public function handle(): int
    {
        $count = Unit::where('status', 'hold')
            ->whereNotNull('hold_expires_at')
            ->where('hold_expires_at', '<', now())
            ->update(['status' => 'available', 'held_by' => null, 'hold_expires_at' => null]);
        $this->info("Released {$count} expired holds.");
        return self::SUCCESS;
    }
}
