<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentPlan;
use App\Models\PaymentPlanInstallment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentPlanController extends Controller
{
    public function index()
    {
        $plans = PaymentPlan::with(['project', 'installments'])->latest()->paginate(15);
        return Inertia::render('admin/PaymentPlans/Index', ['plans' => $plans]);
    }

    public function show(PaymentPlan $paymentPlan)
    {
        $paymentPlan->load(['project', 'installments']);
        return Inertia::render('admin/PaymentPlans/Show', ['plan' => $paymentPlan]);
    }

    public function recordInstallment(Request $request, PaymentPlanInstallment $installment)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'reference_no' => 'nullable|string',
            'payment_mode' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $installment->update([
            'paid_amount' => $validated['amount'],
            'payment_date' => $validated['payment_date'],
            'reference_no' => $validated['reference_no'] ?? null,
            'payment_mode' => $validated['payment_mode'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'status' => 'paid',
        ]);

        return redirect()->back()->with('success', 'Installment marked as paid');
    }
}
