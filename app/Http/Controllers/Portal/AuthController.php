<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Buyer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('portal/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $buyer = Buyer::where('email', $credentials['email'])->where('status', 'active')->first();

        if (!$buyer || !$buyer->password || !Hash::check($credentials['password'], $buyer->password)) {
            return back()->withErrors(['email' => 'Invalid credentials']);
        }

        Auth::guard('buyer')->login($buyer, $request->boolean('remember'));
        $buyer->update(['last_login_at' => now()]);

        return redirect()->route('portal.dashboard');
    }

    public function logout(Request $request)
    {
        Auth::guard('buyer')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('portal.login');
    }
}
