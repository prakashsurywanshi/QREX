<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        \App\Events\LeadCreated::class => [
            \App\Listeners\SendWhatsAppOnLeadCreated::class,
        ],
        \App\Events\SiteVisitScheduled::class => [
            \App\Listeners\SendWhatsAppOnSiteVisitScheduled::class,
        ],
        \App\Events\BookingCreated::class => [
            \App\Listeners\SendWhatsAppOnBookingCreated::class,
        ],
        \App\Events\PaymentReceived::class => [
            \App\Listeners\SendWhatsAppOnPaymentReceived::class,
        ],
    ];

    public function boot(): void
    {
        //
    }

    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
