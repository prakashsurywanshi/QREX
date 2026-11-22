<?php

namespace App\Listeners;

use App\Events\SiteVisitScheduled;
use App\Services\WhatsApp\MetaCloudService;
use Illuminate\Support\Facades\Log;

class SendWhatsAppOnSiteVisitScheduled
{
    public function __construct(protected MetaCloudService $whatsapp)
    {
    }

    public function handle(SiteVisitScheduled $event): void
    {
        if (!config('services.whatsapp.enabled', false)) {
            return;
        }

        $visit = $event->siteVisit->loadMissing('lead', 'customer');
        $phone = $visit->lead?->phone ?? $visit->customer?->phone;
        $name = $visit->lead?->name ?? $visit->customer?->name ?? 'there';

        if (!$phone) {
            return;
        }

        try {
            $message = "Hi {$name}, your site visit has been scheduled for " . ($visit->scheduled_at ? $visit->scheduled_at->format('d M Y h:i A') : 'soon') . ". - QREX";
            $this->whatsapp->sendText($phone, $message);
        } catch (\Exception $e) {
            Log::error('WhatsApp trigger failed (site visit): ' . $e->getMessage());
        }
    }
}
