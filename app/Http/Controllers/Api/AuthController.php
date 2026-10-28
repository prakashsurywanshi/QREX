<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Mail\EmailOtpMail;
use App\Models\EmailOtp;
use App\Models\Setting;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use App\Services\MailConfigService;
use App\Services\OtpService;
use App\Services\PermissionPayloadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (RateLimiter::tooManyAttempts('api-login:'.$request->ip(), 5)) {
            return ApiResponse::error('Too many login attempts. Please try again later.', 429);
        }

        $user = User::where('email', $credentials['email'])->first();

        if ($user && $user->status === 'Inactive') {
            return ApiResponse::error('This account is inactive. Please contact your administrator.', 403);
        }

        if (!Auth::attempt($credentials)) {
            RateLimiter::hit('api-login:'.$request->ip(), 60);
            return ApiResponse::error('The provided credentials do not match our records.', 401);
        }

        RateLimiter::clear('api-login:'.$request->ip());

        $user = Auth::user();
        $user->update(['last_login_at' => now()]);

        $token = $user->createToken('mobile', $user->getPermissionSlugs())->plainTextToken;

        return ApiResponse::success([
            'token' => $token,
            'user' => $this->userPayload($user),
        ], 'Login successful.');
    }

    public function me(Request $request)
    {
        return ApiResponse::success([
            'user' => $this->userPayload($request->user()),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return ApiResponse::success(null, 'Logged out successfully.');
    }

    public function updateProfile(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        $request->user()->update($data);

        return ApiResponse::success($this->userPayload($request->user()), 'Profile updated.');
    }

    public function changePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => ['required', 'current_password'],
            'new_password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($data['new_password']),
        ]);

        return ApiResponse::success(null, 'Password changed.');
    }

    public function sendResetLink(Request $request, MailConfigService $mail)
    {
        $data = $request->validate(['email' => ['required', 'email']]);

        $user = User::where('email', $data['email'])->first();

        if (!$user) {
            return ApiResponse::success(null, 'If that email exists, a reset link has been sent.');
        }

        if ($user->status === 'Inactive') {
            return ApiResponse::error('This account is inactive. Please contact your administrator.', 403);
        }

        $token = Password::broker()->createToken($user);
        $url = url('/reset-password/'.$token.'?email='.$user->email);

        $user->notify(new ResetPasswordNotification($url, $user->name));

        return ApiResponse::success(null, 'If that email exists, a reset link has been sent.');
    }

    public function sendCurrentEmailOtp(Request $request, OtpService $otp)
    {
        $user = $request->user();

        $data = $request->validate(['email' => ['required', 'email']]);

        if (strcasecmp($data['email'], $user->email) !== 0) {
            return ApiResponse::error('You must verify your current email address before changing it.', 422);
        }

        if (!$otp->canResend($user, EmailOtp::PURPOSE_CURRENT)) {
            return ApiResponse::error('Please wait '.$otp->remainingResendSeconds($user, EmailOtp::PURPOSE_CURRENT).'s before requesting another code.', 429);
        }

        try {
            $otp->send($user, $user->email, EmailOtp::PURPOSE_CURRENT);
        } catch (\Throwable $e) {
            return ApiResponse::error('We could not send the verification code. Please try again later.', 500);
        }

        return ApiResponse::success(['currentOtpSent' => true], 'A verification code has been sent to your current email address.');
    }

    public function verifyCurrentEmail(Request $request, OtpService $otp)
    {
        $user = $request->user();

        $data = $request->validate(['otp' => ['required', 'digits:6']]);

        if ($otp->exhaustedAttempts($user, EmailOtp::PURPOSE_CURRENT)) {
            return ApiResponse::error('Too many verification attempts. Please request a new code.', 429);
        }

        if (!$otp->verify($user, $user->email, EmailOtp::PURPOSE_CURRENT, $data['otp'])) {
            return ApiResponse::error('The verification code is invalid or has expired.', 422);
        }

        $otp->forgetAttempts($user, EmailOtp::PURPOSE_CURRENT);

        return ApiResponse::success(['currentVerified' => true], 'Current email verified. Enter your new email address.');
    }

    public function sendNewEmailOtp(Request $request, OtpService $otp)
    {
        $user = $request->user();

        $data = $request->validate([
            'email' => [
                'required', 'email',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
        ]);

        if (strcasecmp($data['email'], $user->email) === 0) {
            return ApiResponse::error('New email must be different from your current email.', 422);
        }

        if (!$otp->canResend($user, EmailOtp::PURPOSE_NEW)) {
            return ApiResponse::error('Please wait before requesting another code.', 429);
        }

        try {
            $otp->send($user, $data['email'], EmailOtp::PURPOSE_NEW, $data['email']);
        } catch (\Throwable $e) {
            return ApiResponse::error('We could not send the verification code. Please try again later.', 500);
        }

        return ApiResponse::success(['newOtpSent' => true, 'pendingEmail' => $data['email']], 'A verification code has been sent to your new email address.');
    }

    public function verifyNewEmail(Request $request, OtpService $otp)
    {
        $user = $request->user();

        $data = $request->validate([
            'otp' => ['required', 'digits:6'],
            'email' => [
                'required', 'email',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
        ]);

        if ($otp->exhaustedAttempts($user, EmailOtp::PURPOSE_NEW)) {
            return ApiResponse::error('Too many verification attempts. Please request a new code.', 429);
        }

        if (!$otp->verify($user, $data['email'], EmailOtp::PURPOSE_NEW, $data['otp'], $data['email'])) {
            return ApiResponse::error('The verification code is invalid or has expired.', 422);
        }

        $user->forceFill([
            'email' => $data['email'],
            'email_verified_at' => now(),
        ])->save();

        $otp->forgetAttempts($user, EmailOtp::PURPOSE_NEW);

        return ApiResponse::success($this->userPayload($user), 'Your email address has been updated.');
    }

    protected function userPayload(User $user): array
    {
        $roles = $user->roles()->get();

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $roles->first()?->name ?? $user->role,
            'role_slugs' => $roles->pluck('slug')->toArray(),
            'branch' => $user->branch,
            'avatar' => $user->avatar,
            'initials' => $user->initials,
            'status' => $user->status,
            'last_login_at' => $user->last_login_at?->format('Y-m-d h:i A'),
            'can' => app(PermissionPayloadService::class)->build($user),
            'unread_notifications' => \App\Models\Notification::where('user_id', $user->id)->where('is_read', false)->count(),
        ];
    }
}
