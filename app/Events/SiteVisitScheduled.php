<?php

namespace App\Events;

use App\Models\SiteVisit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SiteVisitScheduled
{
    use Dispatchable, SerializesModels;

    public function __construct(public SiteVisit $siteVisit)
    {
    }
}
