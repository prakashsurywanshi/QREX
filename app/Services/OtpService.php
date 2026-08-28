<?php

namespace App\Services;

use App\Mail\EmailOtpMail;
use App\Models\EmailOtp;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;

class OtpService
{
    public const TTL_MINUTES = 10;

    public const RESEND_SECONDS = 60;

    public const MAX_ATTEMPTS = 5;

    protected static function sendKey(int $userId, string $purpose): string
    {
        return "email-otp-send-{$userId}-{$purpose}";
    }

    protected static function attemptKey(int $userId, string $purpose): string
    {
        return "email-otp-attempts-{$userId}-{$purpose}";
    }

    public function generate(): string
    {
        return (string) random_int(100000, 999999);
    }

    public function canResend(User $user, string $purpose): bool
    {
        return !RateLimiter::tooManyAttempts(self::sendKey($user->id, $purpose), 1);
    }

    public function remainingResendSeconds(User $user, string $purpose): int
    {
        $key = self::sendKey($user->id, $purpose);

        return RateLimiter::tooManyAttempts($key, 1)
            ? RateLimiter::availableIn($key)
            : 0;
    }

    public function exhaustedAttempts(User $user, string $purpose): bool
    {
        return RateLimiter::tooManyAttempts(self::attemptKey($user->id, $purpose), self::MAX_ATTEMPTS);
    }

    public function send(User $user, string $email, string $purpose, ?string $newEmail = null): string
    {
        $code = $this->generate();

        EmailOtp::create([
            'user_id' => $user->id,
            'email' => $email,
            'purpose' => $purpose,
            'new_email' => $newEmail,
            'code' => Hash::make($code),
            'expires_at' => now()->addMinutes(self::TTL_MINUTES),
        ]);

        app(MailConfigService::class)->applyForEmailSending();

        Mail::to($email)->send(new EmailOtpMail($code, $purpose, $user->name));

        RateLimiter::hit(self::sendKey($user->id, $purpose), self::RESEND_SECONDS);

        return $code;
    }

    public function verify(User $user, string $email, string $purpose, string $code, ?string $newEmail = null): bool
    {
        $attemptKey = self::attemptKey($user->id, $purpose);

        if (RateLimiter::tooManyAttempts($attemptKey, self::MAX_ATTEMPTS)) {
            throw new \RuntimeException('Too many verification attempts. Please request a new code and try again later.');
        }

        RateLimiter::hit($attemptKey, 60 * 60);

        $query = EmailOtp::where('user_id', $user->id)
            ->where('email', $email)
            ->where('purpose', $purpose)
            ->whereNull('used_at')
            ->where('expires_at', '>', now());

        if ($newEmail !== null) {
            $query->where('new_email', $newEmail);
        }

        $otp = $query->latest('id')->first();

        if (!$otp || !Hash::check($code, $otp->code)) {
            return false;
        }

        $otp->update(['used_at' => now()]);

        return true;
    }

    public function forgetAttempts(User $user, string $purpose): void
    {
        RateLimiter::clear(self::attemptKey($user->id, $purpose));
    }
}
