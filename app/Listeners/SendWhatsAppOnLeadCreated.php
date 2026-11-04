<?php

namespace App\Listeners;

use App\Events\LeadCreated;
use App\Services\WhatsApp\MetaCloudService;
use Illuminate\Support\Facades\Log;

class SendWhatsAppOnLeadCreated
{
    public function __construct(protected MetaCloudService $whatsapp)
    {
    }

    public function handle(LeadCreated $event): void
    {
        if (!env('WHATSAPP_ENABLED', false)) {
            return;
        }

        $lead = $event->lead;
        if (!$lead->phone) {
            return;
        }

        try {
            $this->whatsapp->sendText($lead->phone, "Hi {$lead->name}, thank you for your enquiry at QREX. Our team will get back to you shortly.");
        } catch (\Exception $e) {
            Log::error('WhatsApp trigger failed (lead created): ' . $e->getMessage());
        }
    }
}
