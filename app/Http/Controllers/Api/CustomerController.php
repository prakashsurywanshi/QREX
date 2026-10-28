<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends ApiController
{
    public function index(Request $request)
    {
        $query = Customer::query()->with('agent');

        if ($request->filled('search')) {
            $query->where(fn ($q) => $q
                ->where('name', 'like', '%'.$request->search.'%')
                ->orWhere('email', 'like', '%'.$request->search.'%')
                ->orWhere('phone', 'like', '%'.$request->search.'%'));
        }

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        $perPage = max(1, (int) $request->integer('per_page', 10));
        $customers = $query->latest()->paginate($perPage);

        return ApiResponse::success([
            'data' => collect($customers->items())->map(fn ($c) => $this->customerBrief($c))->all(),
            'meta' => [
                'current_page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'per_page' => $customers->perPage(),
                'total' => $customers->total(),
            ],
            'filters' => $request->only(['search', 'status']),
            'statuses' => ['Prospect', 'Active', 'Buyer', 'Investor', 'Past Customer'],
        ]);
    }

    public function show(Customer $customer)
    {
        $customer->load('agent');

        return ApiResponse::success([
            'customer' => $this->customerBrief($customer),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'phone' => 'required|string',
            'email' => 'nullable|email',
            'type' => 'nullable|string',
            'status' => 'nullable|string',
            'city' => 'nullable|string',
            'agent_id' => 'nullable|integer',
        ]);

        $data['customer_id'] = $this->nextId('C');

        $customer = Customer::create($data);

        return ApiResponse::success($this->customerBrief($customer->load('agent')), 'Customer created.', 201);
    }

    public function update(Request $request, Customer $customer)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'phone' => 'required|string',
            'email' => 'nullable|email',
            'type' => 'nullable|string',
            'status' => 'nullable|string',
            'city' => 'nullable|string',
            'agent_id' => 'nullable|integer',
            'requirements' => 'nullable|string',
        ]);

        $customer->update($data);

        return ApiResponse::success($this->customerBrief($customer->load('agent')), 'Customer updated.');
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();

        return ApiResponse::success(null, 'Customer deleted.');
    }

    protected function customerBrief($c): array
    {
        return [
            'id' => $c->id,
            'customer_id' => $c->customer_id,
            'name' => $c->name,
            'phone' => $c->phone,
            'email' => $c->email,
            'type' => $c->type,
            'status' => $c->status,
            'city' => $c->city,
            'requirements' => $c->requirements,
            'properties' => $c->properties,
            'total_value' => $c->total_value,
            'agent_id' => $c->agent_id,
            'agent_name' => $c->agent?->name,
            'created_at' => $c->created_at?->toISOString(),
        ];
    }
}