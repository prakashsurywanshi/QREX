<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\MailConfigService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PasswordResetController extends Controller
{
    public function sendResetLink(Request $request, MailConfigService $mailConfig)
    {
        $request->validate(['email' => ['required', 'email']]);

        try {
            $user = User::where('email', $request->email)->first();

            if ($user) {
                $mailConfig->applyForEmailSending();

                Password::sendResetLink(['email' => $request->email]);
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Password reset email failed: '.$e->getMessage());

            return back()->with('error', 'We could not send the reset link. Please try again later or contact the administrator.');
        }

        return back()->with('success', 'If that email exists, a password reset link has been sent.');
    }

    public function showResetForm(string $token, ?string $email = null)
    {
        return Inertia::render('auth/ResetPassword', [
            'token' => $token,
            'email' => $email ?? '',
        ]);
    }

    public function reset(Request $request)
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => \Illuminate\Support\Facades\Hash::make($password),
                ])->save();

                $user->setRememberToken(Str::random(60));
            }
        );

        return $status === Password::PASSWORD_RESET
            ? redirect()->route('login')->with('success', 'Your password has been reset. You can now sign in.')
            : back()->withErrors(['email' => [__($status)]]);
    }
}
