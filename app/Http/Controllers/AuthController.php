<?php

namespace App\Http\Controllers;

use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('auth/Login', [
            'settings' => [
                'project_name' => \App\Models\Setting::where('key', 'project_name')->value('value') ?? config('app.name', 'QREX'),
                'tagline' => \App\Models\Setting::where('key', 'tagline')->value('value') ?? 'Realty ERP & CRM',
            ],
        ]);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $remember = $request->boolean('remember');

        $user = \App\Models\User::where('email', $credentials['email'])->first();

        if ($user && $user->status === 'Inactive') {
            return back()->withErrors([
                'email' => 'This account is inactive. Please contact your administrator.',
            ])->withInput();
        }

        if (Auth::attempt($credentials, $remember)) {
            $request->session()->regenerate();
            auth()->user()->update(['last_login_at' => now()]);

            return redirect()->intended('/admin/dashboard');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function profile()
    {
        $user = auth()->user();

        return Inertia::render('auth/Profile', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'branch' => $user->branch,
                'initials' => $user->initials,
                'last_login_at' => $user->last_login_at?->format('Y-m-d h:i A'),
            ],
            'emailChange' => [
                'currentVerified' => (bool) session()->get('email_change.current_verified', false),
                'pendingEmail' => session()->get('email_change.pending_email'),
                'currentOtpSent' => (bool) session()->get('email_change.current_otp_sent', false),
                'newOtpSent' => (bool) session()->get('email_change.new_otp_sent', false),
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        auth()->user()->update([
            'name' => $request->name,
            'phone' => $request->phone,
        ]);

        return back()->with('success', 'Profile updated.');
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'new_password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        auth()->user()->update([
            'password' => Hash::make($request->new_password),
        ]);

        return back()->with('success', 'Password changed.');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    public function sendCurrentEmailOtp(Request $request, OtpService $otp)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = auth()->user();

        if (strcasecmp($request->email, $user->email) !== 0) {
            return back()->with('error', 'You must verify your current email address before changing it.');
        }

        if (!$otp->canResend($user, \App\Models\EmailOtp::PURPOSE_CURRENT)) {
            return back()->with('error', 'Please wait before requesting another code.');
        }

        try {
            $otp->send($user, $user->email, \App\Models\EmailOtp::PURPOSE_CURRENT);
            $request->session()->put('email_change.current_otp_sent', true);

            return back()->with('success', 'A verification code has been sent to your current email address.');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Current email OTP send failed: '.$e->getMessage());

            return back()->with('error', 'We could not send the verification code. Please try again later.');
        }
    }

    public function verifyCurrentEmail(Request $request, OtpService $otp)
    {
        $request->validate([
            'otp' => ['required', 'digits:6'],
        ]);

        $user = auth()->user();

        if ($otp->exhaustedAttempts($user, \App\Models\EmailOtp::PURPOSE_CURRENT)) {
            return back()->with('error', 'Too many verification attempts. Please request a new code.');
        }

        if (!$otp->verify($user, $user->email, \App\Models\EmailOtp::PURPOSE_CURRENT, $request->otp)) {
            return back()->with('error', 'The verification code is invalid or has expired.');
        }

        $otp->forgetAttempts($user, \App\Models\EmailOtp::PURPOSE_CURRENT);
        $request->session()->put('email_change.current_verified', true);
        $request->session()->forget('email_change.current_otp_sent');

        return back()->with('success', 'Current email verified. Enter your new email address.');
    }

    public function sendNewEmailOtp(Request $request, OtpService $otp)
    {
        if (!$request->session()->get('email_change.current_verified')) {
            return back()->with('error', 'Please verify your current email first.');
        }

        $user = auth()->user();

        $request->validate([
            'email' => [
                'required', 'email',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
        ]);

        if (strcasecmp($request->email, $user->email) === 0) {
            return back()->with('error', 'New email must be different from your current email.');
        }

        if (!$otp->canResend($user, \App\Models\EmailOtp::PURPOSE_NEW)) {
            return back()->with('error', 'Please wait before requesting another code.');
        }

        try {
            $otp->send($user, $request->email, \App\Models\EmailOtp::PURPOSE_NEW, $request->email);
            $request->session()->put('email_change.pending_email', $request->email);
            $request->session()->put('email_change.new_otp_sent', true);

            return back()->with('success', 'A verification code has been sent to your new email address.');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('New email OTP send failed: '.$e->getMessage());

            return back()->with('error', 'We could not send the verification code. Please try again later.');
        }
    }

    public function verifyNewEmail(Request $request, OtpService $otp)
    {
        if (!$request->session()->get('email_change.current_verified')) {
            return back()->with('error', 'Please verify your current email first.');
        }

        $user = auth()->user();

        $request->validate([
            'otp' => ['required', 'digits:6'],
            'email' => [
                'required', 'email',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
        ]);

        if ($otp->exhaustedAttempts($user, \App\Models\EmailOtp::PURPOSE_NEW)) {
            return back()->with('error', 'Too many verification attempts. Please request a new code.');
        }

        if (!$otp->verify($user, $request->email, \App\Models\EmailOtp::PURPOSE_NEW, $request->otp, $request->email)) {
            return back()->with('error', 'The verification code is invalid or has expired.');
        }

        $user->forceFill([
            'email' => $request->email,
            'email_verified_at' => now(),
        ])->save();

        $otp->forgetAttempts($user, \App\Models\EmailOtp::PURPOSE_NEW);
        $request->session()->forget([
            'email_change.current_verified',
            'email_change.pending_email',
            'email_change.new_otp_sent',
            'email_change.current_otp_sent',
        ]);

        return back()->with('success', 'Your email address has been updated.');
    }
}
