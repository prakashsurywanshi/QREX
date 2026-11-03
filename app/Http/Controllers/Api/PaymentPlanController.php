<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Booking;
use App\Models\Installment;
use App\Models\PaymentPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PaymentPlanController extends ApiController
{
    public function index(Request $request)
    {
        $plans = PaymentPlan::with(['booking', 'deal', 'unit', 'installments'])
            ->when($request->booking_id, fn($q,$v)=>$q->where('booking_id',$v))
            ->latest()->paginate(15);
        return ApiResponse::success($plans);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'nullable|exists:bookings,id',
            'deal_id' => 'nullable|exists:deals,id',
            'unit_id' => 'nullable|exists:units,id',
            'plan_name' => 'required|string|max:255',
            'total_amount' => 'required|numeric|min:0',
            'booking_amount' => 'nullable|numeric|min:0',
            'plan_type' => 'required|in:milestone,slab,custom',
            'start_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'installments' => 'required|array|min:1',
            'installments.*.milestone_name' => 'nullable|string',
            'installments.*.due_date' => 'required|date',
            'installments.*.amount' => 'required|numeric|min:0',
            'installments.*.percentage' => 'nullable|numeric|min:0|max:100',
        ]);

        $plan = DB::transaction(function () use ($validated, $request) {
            $plan = PaymentPlan::create([
                ...$validated,
                'created_by' => Auth::id(),
                'status' => 'active',
            ]);

            foreach ($validated['installments'] as $idx => $inst) {
                Installment::create([
                    'payment_plan_id' => $plan->id,
                    'installment_no' => $idx + 1,
                    'milestone_name' => $inst['milestone_name'] ?? 'Installment ' . ($idx + 1),
                    'due_date' => $inst['due_date'],
                    'amount' => $inst['amount'],
                    'percentage' => $inst['percentage'] ?? null,
                    'status' => 'pending',
                    'paid_amount' => 0,
                    'balance_amount' => $inst['amount'],
                ]);
            }
            return $plan;
        });

        $plan->load('installments');
        return ApiResponse::success($plan, 'Payment plan created successfully', 201);
    }

    public function show(PaymentPlan $paymentPlan)
    {
        $paymentPlan->load(['booking', 'deal', 'unit', 'installments', 'creator']);
        return ApiResponse::success($paymentPlan);
    }

    public function payInstallment(Request $request, Installment $installment)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_id' => 'nullable|exists:payments,id',
            'notes' => 'nullable|string',
        ]);

        $payAmount = $validated['amount'];
        $newPaid = (float)$installment->paid_amount + $payAmount;
        $total = (float)$installment->amount;

        if ($newPaid >= $total) {
            $installment->update([
                'paid_amount' => $total,
                'balance_amount' => 0,
                'status' => 'paid',
                'paid_at' => now(),
                'payment_id' => $validated['payment_id'] ?? null,
                'notes' => $validated['notes'] ?? $installment->notes,
            ]);
        } else {
            $installment->update([
                'paid_amount' => $newPaid,
                'balance_amount' => $total - $newPaid,
                'status' => 'partially_paid',
                'payment_id' => $validated['payment_id'] ?? null,
            ]);
        }

        return ApiResponse::success($installment->fresh(), 'Installment updated successfully');
    }

    public function destroy(PaymentPlan $paymentPlan)
    {
        $paymentPlan->installments()->delete();
        $paymentPlan->delete();
        return ApiResponse::success(null, 'Payment plan deleted successfully');
    }
}
