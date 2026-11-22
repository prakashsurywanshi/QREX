<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Commission;
use App\Models\CommissionRule;
use App\Models\CommissionSplit;
use App\Models\Deal;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CommissionController extends ApiController
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

        if ($request->filled('split_type')) {
            $query->where('split_type', $request->split_type);
        }

        $perPage = max(1, (int) $request->integer('per_page', 15));
        $commissions = $query->latest()->paginate($perPage);

        $summary = [
            'pending' => Commission::pending()->when(!$user->isSuperAdmin() && !$user->hasRole('admin'), fn($q) => $q->where('agent_id', $user->id))->sum('commission_amount'),
            'approved' => Commission::approved()->when(!$user->isSuperAdmin() && !$user->hasRole('admin'), fn($q) => $q->where('agent_id', $user->id))->sum('commission_amount'),
            'paid' => Commission::paid()->when(!$user->isSuperAdmin() && !$user->hasRole('admin'), fn($q) => $q->where('agent_id', $user->id))->sum('commission_amount'),
        ];

        return ApiResponse::success([
            'commissions' => $commissions,
            'summary' => $summary,
            'agents' => User::whereHas('roles', function($q) {
                $q->whereIn('slug', ['sales-executive', 'senior-agent']);
            })->get(['id', 'name']),
            'statuses' => ['pending', 'approved', 'paid', 'rejected'],
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
            'splits.*.user_id' => 'required_with:splits|exists:users,id',
            'splits.*.share_percentage' => 'required_with:splits|numeric|min:0|max:100',
            'splits.*.role' => 'nullable|in:primary,co-broker',
        ]);

        $commission = DB::transaction(function () use ($validated, $request) {
            $commission = Commission::create([
                ...$validated,
                'created_by' => Auth::id(),
                'status' => 'pending',
                'calculation_details' => $request->input('calculation_details', []),
            ]);

            if (!empty($validated['splits']) && in_array($validated['split_type'], ['team', 'co-broking'])) {
                foreach ($validated['splits'] as $split) {
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

        $commission->load(['agent', 'deal', 'booking', 'property', 'splits.user']);

        return ApiResponse::success($commission, 'Commission created successfully', 201);
    }

    public function show(Commission $commission)
    {
        $this->authorize('view', $commission);
        $commission->load(['agent', 'deal', 'booking', 'property', 'approver', 'payer', 'creator', 'splits.user', 'parentCommission', 'splits']);
        return ApiResponse::success($commission);
    }

    public function update(Request $request, Commission $commission)
    {
        $this->authorize('update', $commission);
        if ($commission->status !== 'pending') {
            return ApiResponse::error('Only pending commissions can be updated', 422);
        }

        $validated = $request->validate([
            'commission_type' => 'sometimes|in:percentage,fixed',
            'commission_rate' => 'nullable|numeric|min:0',
            'commission_amount' => 'sometimes|numeric|min:0',
            'base_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'splits' => 'nullable|array',
        ]);

        $commission = DB::transaction(function () use ($commission, $validated, $request) {
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

            return $commission;
        });

        $commission->load(['agent', 'splits.user']);
        return ApiResponse::success($commission, 'Commission updated successfully');
    }

    public function approve(Request $request, Commission $commission)
    {
        $this->authorize('approve', $commission);
        if ($commission->status !== 'pending') {
            return ApiResponse::error('Only pending commissions can be approved', 422);
        }

        $commission->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'notes' => $request->input('notes', $commission->notes),
        ]);

        return ApiResponse::success($commission->fresh(), 'Commission approved successfully');
    }

    public function pay(Request $request, Commission $commission)
    {
        $this->authorize('pay', $commission);
        if ($commission->status !== 'approved') {
            return ApiResponse::error('Only approved commissions can be marked as paid', 422);
        }

        $validated = $request->validate([
            'payment_reference' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $commission->update([
            'status' => 'paid',
            'paid_by' => Auth::id(),
            'paid_at' => now(),
            'payment_reference' => $validated['payment_reference'] ?? null,
            'notes' => $validated['notes'] ?? $commission->notes,
        ]);

        return ApiResponse::success($commission->fresh(), 'Commission marked as paid successfully');
    }

    public function reject(Request $request, Commission $commission)
    {
        $this->authorize('approve', $commission);
        if ($commission->status !== 'pending') {
            return ApiResponse::error('Only pending commissions can be rejected', 422);
        }

        $commission->update([
            'status' => 'rejected',
            'notes' => $request->input('notes', $commission->notes),
        ]);

        return ApiResponse::success($commission->fresh(), 'Commission rejected');
    }

    public function destroy(Commission $commission)
    {
        $this->authorize('delete', $commission);
        if ($commission->status !== 'pending') {
            return ApiResponse::error('Only pending commissions can be deleted', 422);
        }

        $commission->splits()->delete();
        $commission->delete();

        return ApiResponse::success(null, 'Commission deleted successfully');
    }

    public function calculate(Request $request)
    {
        $validated = $request->validate([
            'base_amount' => 'required|numeric|min:0',
            'commission_type' => 'required|in:percentage,fixed',
            'commission_rate' => 'nullable|numeric|min:0',
            'commission_amount' => 'nullable|numeric|min:0',
        ]);

        if ($validated['commission_type'] === 'percentage') {
            $rate = $validated['commission_rate'] ?? 0;
            $amount = ($validated['base_amount'] * $rate) / 100;
        } else {
            $amount = $validated['commission_amount'] ?? 0;
        }

        $rules = CommissionRule::active()->get();
        foreach ($rules as $rule) {
            if ($validated['base_amount'] >= $rule->min_value && ($rule->max_value === null || $validated['base_amount'] <= $rule->max_value)) {
                if ($rule->type === 'percentage' && $rule->percentage) {
                    $amount = ($validated['base_amount'] * $rule->percentage) / 100;
                    break;
                } elseif ($rule->type === 'fixed' && $rule->fixed_amount) {
                    $amount = $rule->fixed_amount;
                    break;
                }
            }
        }

        return ApiResponse::success([
            'commission_amount' => round($amount, 2),
            'base_amount' => $validated['base_amount'],
        ]);
    }
}
