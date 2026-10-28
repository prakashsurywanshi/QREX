<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends ApiController
{
    public function index()
    {
        $payments = Payment::latest()->get()->map(fn ($p) => $this->paymentBrief($p));

        return ApiResponse::success([
            'payments' => $payments->all(),
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

        $payment = Payment::create($data);

        return ApiResponse::success($this->paymentBrief($payment), 'Payment recorded.', 201);
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

        return ApiResponse::success($this->paymentBrief($payment), 'Payment updated.');
    }

    public function destroy(Payment $payment)
    {
        $payment->delete();

        return ApiResponse::success(null, 'Payment deleted.');
    }

    protected function paymentBrief($p): array
    {
        return [
            'id' => $p->id,
            'payment_id' => $p->payment_id,
            'customer_name' => $p->customer_name,
            'property_name' => $p->property_name,
            'amount' => (float) $p->amount,
            'amount_label' => $p->amount_label ?: $this->label($p->amount),
            'mode' => $p->mode,
            'txn_id' => $p->txn_id,
            'status' => $p->status,
            'paid_date' => $p->paid_date,
            'due_date' => $p->due_date,
            'created_at' => $p->created_at?->toISOString(),
        ];
    }
}