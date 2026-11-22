<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ReadinessCheckCommand extends Command
{
    protected $signature = 'qrex:readiness-check';
    protected $description = 'Basic production readiness checks';

    public function handle(): int
    {
        $ok = true;
        $this->line('APP_ENV=' . config('app.env'));
        $this->line('APP_DEBUG=' . (config('app.debug') ? 'true' : 'false'));
        $this->line('SENTRY_DSN=' . (config('sentry.dsn') ? 'set' : 'missing'));
        $this->line('QREX_MULTI_TENANT=' . (config('qrex.multi_tenant') ? 'true' : 'false'));

        try { DB::select('select 1'); $this->info('DB: ok'); }
        catch (\Throwable $e) { $this->error('DB: fail'); $ok = false; }

        foreach (['storage','bootstrap/cache'] as $p) {
            $path = base_path($p);
            $w = is_writable($path);
            $this->line($p . ': ' . ($w ? 'writable' : 'not writable'));
            if (!$w) $ok = false;
        }

        return $ok ? self::SUCCESS : self::FAILURE;
    }
}
