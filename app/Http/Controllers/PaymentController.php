<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index()
    {
        $payments = Payment::latest()->get();

        return Inertia::render('admin/Payments', [
            'payments' => $payments,
            'widgets' => [
                'total' => $payments->whereNotIn('status', ['Cancelled'])->sum('amount'),
                'received' => $payments->where('status', 'Paid')->sum('amount'),
                'receivable' => $payments->whereNotIn('status', ['Paid', 'Cancelled'])->sum('amount'),
                'pending' => $payments->whereIn('status', ['Pending', 'Partially Paid', 'Partial'])->sum('amount'),
                'overdue' => $payments->where('status', 'Overdue')->sum('amount'),
                'cancelled' => $payments->where('status', 'Cancelled')->sum('amount'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name' => 'required|string',
            'property_name' => 'required|string',
            'amount' => 'required|numeric',
            'mode' => 'nullable|string',
            'due_date' => 'nullable|date',
            'status' => 'nullable|string',
        ]);

        $data['payment_id'] = $this->nextId('PAY');
        $data['amount_label'] = $this->label($data['amount']);
        $data['txn_id'] = $request->txn_id ?: '—';
        if ($request->filled('paid_date')) {
            $data['paid_date'] = $request->paid_date;
        } elseif ($request->status === 'Paid') {
            $data['paid_date'] = now()->format('Y-m-d');
        }

        Payment::create($data);

        return back()->with('success', 'Payment recorded.');
    }

    public function update(Request $request, Payment $payment)
    {
        $request->validate([
            'status' => ['nullable', 'string'],
            'mode' => ['nullable', 'string'],
            'txn_id' => ['nullable', 'string'],
            'paid_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date'],
        ]);

        $payment->update(array_merge(
            $request->only(['status', 'mode', 'txn_id', 'paid_date', 'due_date']),
            ['txn_id' => $request->txn_id ?: '—']
        ));

        return back()->with('success', 'Payment updated.');
    }

    private function label($amount): string
    {
        if ($amount >= 10000000) {
            return '₹'.round($amount / 10000000, 2).' Cr';
        }
        if ($amount >= 100000) {
            return '₹'.round($amount / 100000).' L';
        }
        return '₹'.number_format($amount);
    }
}
