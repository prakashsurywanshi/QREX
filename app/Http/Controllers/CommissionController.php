<?php

namespace App\Http\Controllers;

use App\Models\Commission;
use App\Models\CommissionRule;
use App\Models\CommissionSplit;
use App\Models\Deal;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CommissionController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Commission::with(['agent', 'deal', 'booking', 'property', 'approver', 'splits.user']);

        if (!$user->isSuperAdmin() && !$user->hasRole('admin')) {
            $query->where('agent_id', $user->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('agent_id')) {
            $query->where('agent_id', $request->agent_id);
        }

        $commissions = $query->latest()->paginate(15)->withQueryString();

        $summary = [
            'pending' => Commission::pending()->when(!$user->isSuperAdmin() && !$user->hasRole('admin'), fn($q) => $q->where('agent_id', $user->id))->sum('commission_amount'),
            'approved' => Commission::approved()->when(!$user->isSuperAdmin() && !$user->hasRole('admin'), fn($q) => $q->where('agent_id', $user->id))->sum('commission_amount'),
            'paid' => Commission::paid()->when(!$user->isSuperAdmin() && !$user->hasRole('admin'), fn($q) => $q->where('agent_id', $user->id))->sum('commission_amount'),
        ];

        return Inertia::render('admin/Commissions/Index', [
            'commissions' => $commissions,
            'summary' => $summary,
            'agents' => User::whereHas('roles', function($q) {
                $q->whereIn('slug', ['sales-executive', 'senior-agent']);
            })->get(['id', 'name']),
            'filters' => $request->only(['status', 'agent_id']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/Commissions/Create', [
            'deals' => Deal::with('lead', 'property')->latest()->get(),
            'bookings' => Booking::with('property', 'customer')->latest()->get(),
            'agents' => User::whereHas('roles', function($q) {
                $q->whereIn('slug', ['sales-executive', 'senior-agent']);
            })->get(['id', 'name']),
            'rules' => CommissionRule::active()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'deal_id' => 'nullable|exists:deals,id',
            'booking_id' => 'nullable|exists:bookings,id',
            'property_id' => 'nullable|exists:properties,id',
            'agent_id' => 'required|exists:users,id',
            'commission_type' => 'required|in:percentage,fixed',
            'commission_rate' => 'nullable|numeric|min:0',
            'commission_amount' => 'required|numeric|min:0',
            'base_amount' => 'nullable|numeric|min:0',
            'split_type' => 'required|in:individual,team,co-broking',
            'notes' => 'nullable|string',
            'splits' => 'nullable|array',
        ]);

        $commission = DB::transaction(function () use ($validated, $request) {
            $commission = Commission::create([
                ...$validated,
                'created_by' => Auth::id(),
                'status' => 'pending',
                'calculation_details' => $request->input('calculation_details', []),
            ]);

            if (!empty($request->input('splits')) && in_array($validated['split_type'], ['team', 'co-broking'])) {
                foreach ($request->input('splits') as $split) {
                    CommissionSplit::create([
                        'commission_id' => $commission->id,
                        'user_id' => $split['user_id'],
                        'share_percentage' => $split['share_percentage'],
                        'share_amount' => $commission->commission_amount * ($split['share_percentage'] / 100),
                        'role' => $split['role'] ?? 'co-broker',
                    ]);
                }
            }

            return $commission;
        });

        return redirect()->route('admin.commissions.show', $commission)->with('success', 'Commission created successfully');
    }

    public function show(Commission $commission)
    {
        $commission->load(['agent', 'deal', 'booking', 'property', 'approver', 'payer', 'creator', 'splits.user']);
        return Inertia::render('admin/Commissions/Show', [
            'commission' => $commission,
        ]);
    }

    public function edit(Commission $commission)
    {
        if ($commission->status !== 'pending') {
            return redirect()->route('admin.commissions.show', $commission)->with('error', 'Only pending commissions can be edited');
        }

        $commission->load(['splits']);
        return Inertia::render('admin/Commissions/Edit', [
            'commission' => $commission,
            'agents' => User::whereHas('roles', function($q) {
                $q->whereIn('slug', ['sales-executive', 'senior-agent']);
            })->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Commission $commission)
    {
        if ($commission->status !== 'pending') {
            return redirect()->route('admin.commissions.show', $commission)->with('error', 'Only pending commissions can be updated');
        }

        $validated = $request->validate([
            'commission_type' => 'sometimes|in:percentage,fixed',
            'commission_rate' => 'nullable|numeric|min:0',
            'commission_amount' => 'sometimes|numeric|min:0',
            'base_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'splits' => 'nullable|array',
        ]);

        DB::transaction(function () use ($commission, $validated, $request) {
            $commission->update($validated);

            if ($request->has('splits')) {
                $commission->splits()->delete();
                foreach ($request->input('splits', []) as $split) {
                    CommissionSplit::create([
                        'commission_id' => $commission->id,
                        'user_id' => $split['user_id'],
                        'share_percentage' => $split['share_percentage'],
                        'share_amount' => $commission->commission_amount * ($split['share_percentage'] / 100),
                        'role' => $split['role'] ?? 'co-broker',
                    ]);
                }
            }
        });

        return redirect()->route('admin.commissions.show', $commission)->with('success', 'Commission updated successfully');
    }

    public function approve(Commission $commission)
    {
        if ($commission->status !== 'pending') {
            return back()->with('error', 'Only pending commissions can be approved');
        }

        $commission->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        return back()->with('success', 'Commission approved successfully');
    }

    public function pay(Request $request, Commission $commission)
    {
        if ($commission->status !== 'approved') {
            return back()->with('error', 'Only approved commissions can be marked as paid');
        }

        $commission->update([
            'status' => 'paid',
            'paid_by' => Auth::id(),
            'paid_at' => now(),
            'payment_reference' => $request->input('payment_reference'),
        ]);

        return back()->with('success', 'Commission marked as paid successfully');
    }

    public function reject(Request $request, Commission $commission)
    {
        if ($commission->status !== 'pending') {
            return back()->with('error', 'Only pending commissions can be rejected');
        }

        $commission->update([
            'status' => 'rejected',
            'notes' => $request->input('notes', $commission->notes),
        ]);

        return back()->with('success', 'Commission rejected');
    }

    public function destroy(Commission $commission)
    {
        if ($commission->status !== 'pending') {
            return back()->with('error', 'Only pending commissions can be deleted');
        }

        $commission->splits()->delete();
        $commission->delete();

        return redirect()->route('admin.commissions.index')->with('success', 'Commission deleted successfully');
    }
}
