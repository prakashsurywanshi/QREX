<?php

namespace App\Listeners;

use App\Events\PaymentReceived;
use App\Services\WhatsApp\MetaCloudService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendWhatsAppOnPaymentReceived implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(private MetaCloudService $whatsapp)
    {
    }

    public function handle(PaymentReceived $event): void
    {
        if (!config('services.whatsapp.enabled', false)) return;
        $payment = $event->payment->loadMissing('customer');
        if (!$payment->customer || !$payment->customer->phone) return;
        $this->whatsapp->sendTemplate($payment->customer->phone, 'payment_receipt', 'en_US', [
            ['type' => 'body', 'parameters' => [['type' => 'text', 'text' => (string) ($payment->amount ?? '')]]],
        ]);
    }
}
