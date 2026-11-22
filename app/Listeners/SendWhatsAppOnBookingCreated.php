<?php

namespace App\Listeners;

use App\Events\BookingCreated;
use App\Services\WhatsApp\MetaCloudService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendWhatsAppOnBookingCreated implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(private MetaCloudService $whatsapp)
    {
    }

    public function handle(BookingCreated $event): void
    {
        if (!config('services.whatsapp.enabled', false)) return;
        $booking = $event->booking->loadMissing('customer');
        if (!$booking->customer || !$booking->customer->phone) return;
        $this->whatsapp->sendTemplate($booking->customer->phone, 'booking_confirmed', 'en_US', [
            ['type' => 'body', 'parameters' => [['type' => 'text', 'text' => $booking->customer->first_name ?? $booking->customer->name ?? 'Customer']]],
        ]);
    }
}
