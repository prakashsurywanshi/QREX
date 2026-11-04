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
        $booking = $event->booking->load(['customer']);
        if (!$booking->customer || !$booking->customer->phone) return;
        $this->whatsapp->sendTemplate($booking->customer->phone, 'booking_confirmed', ['name' => $booking->customer->first_name]);
    }
}
