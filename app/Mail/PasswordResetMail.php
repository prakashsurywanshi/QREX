<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $url, public ?string $userName = null)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Reset Your Password - '.config('app.name'));
    }

    public function content(): Content
    {
        return new Content(view: 'emails.password-reset', with: [
            'url' => $this->url,
            'userName' => $this->userName ?? 'there',
            'appName' => config('app.name'),
        ]);
    }
}
