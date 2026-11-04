<?php

namespace App\Providers;

use App\Events\BookingCreated;
use App\Events\LeadCreated;
use App\Events\SiteVisitScheduled;
use App\Listeners\SendWhatsAppOnLeadCreated;
use App\Listeners\SendWhatsAppOnSiteVisitScheduled;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        LeadCreated::class => [
            SendWhatsAppOnLeadCreated::class,
        ],
        SiteVisitScheduled::class => [
            SendWhatsAppOnSiteVisitScheduled::class,
        ],
        BookingCreated::class => [
            // Can add booking WhatsApp notification later
        ],
    ];

    public function boot(): void
    {
        //
    }
}
