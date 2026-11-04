<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\PaymentPlan;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PaymentPlanWebController extends Controller
{
    public function index()
    {
        $plans = PaymentPlan::with(['booking', 'deal', 'unit', 'installments'])->latest()->paginate(15);
        return Inertia::render('admin/PaymentPlans/Index', ['plans' => $plans]);
    }

    public function create()
    {
        return Inertia::render('admin/PaymentPlans/Create', [
            'bookings' => Booking::with('property')->latest()->get(),
            'units' => Unit::with('project')->where('status', 'available')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'nullable|exists:bookings,id',
            'unit_id' => 'nullable|exists:units,id',
            'plan_name' => 'required|string',
            'total_amount' => 'required|numeric',
            'plan_type' => 'required|in:milestone,slab,custom',
            'installments' => 'required|array',
        ]);

        $plan = DB::transaction(function () use ($validated, $request) {
            $plan = PaymentPlan::create([
                'plan_name' => $validated['plan_name'],
                'booking_id' => $validated['booking_id'] ?? null,
                'unit_id' => $validated['unit_id'] ?? null,
                'total_amount' => $validated['total_amount'],
                'plan_type' => $validated['plan_type'],
                'created_by' => Auth::id(),
                'status' => 'active',
            ]);

            foreach ($request->installments as $idx => $inst) {
                $plan->installments()->create([
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

        return redirect()->route('admin.payment-plans.show', $plan)->with('success', 'Payment plan created');
    }

    public function show(PaymentPlan $paymentPlan)
    {
        $paymentPlan->load(['booking', 'deal', 'unit', 'installments']);
        return Inertia::render('admin/PaymentPlans/Show', ['plan' => $paymentPlan]);
    }
}
