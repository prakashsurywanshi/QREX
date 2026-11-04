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
        $payment = $event->payment->load(['customer']);
        if (!$payment->customer || !$payment->customer->phone) return;
        $this->whatsapp->sendTemplate($payment->customer->phone, 'payment_receipt', ['amount' => $payment->amount]);
    }
}
