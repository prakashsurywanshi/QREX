<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
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

        $perPage = 10;
        $customers = $query->latest()->paginate($perPage)->withQueryString();

        return Inertia::render('admin/Customers', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'status']),
            'statuses' => ['All', 'Prospect', 'Active', 'Buyer', 'Investor', 'Past Customer'],
        ]);
    }

    public function show(Customer $customer)
    {
        $customer->load('agent');

        return Inertia::render('admin/CustomerDetail', [
            'customer' => $customer,
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

        Customer::create($data);

        return back()->with('success', 'Customer created.');
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

        return back()->with('success', 'Customer updated.');
    }
}
