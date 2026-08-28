<?php

namespace App\Notifications;

use App\Mail\PasswordResetMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(public string $url, public ?string $userName = null)
    {
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): PasswordResetMail
    {
        return (new PasswordResetMail($this->url, $this->userName))
            ->to($notifiable->routeNotificationFor('mail', $notifiable));
    }
}
