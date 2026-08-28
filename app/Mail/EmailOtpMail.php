<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $otp,
        public string $purpose,
        public ?string $userName = null,
    ) {
    }

    public function envelope(): Envelope
    {
        $subject = $this->purpose === 'new'
            ? 'Verify Your New Email - '.config('app.name')
            : 'Verify Your Email - '.config('app.name');

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.otp', with: [
            'otp' => $this->otp,
            'purpose' => $this->purpose,
            'userName' => $this->userName ?? 'there',
            'appName' => config('app.name'),
        ]);
    }
}
