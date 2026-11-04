<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\TenantBranding;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TenantController extends Controller
{
    public function index()
    {
        $tenants = Tenant::with('branding')->latest()->paginate(15);
        return Inertia::render('admin/Tenants/Index', ['tenants' => $tenants]);
    }

    public function create()
    {
        return Inertia::render('admin/Tenants/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'domain' => 'nullable|string',
            'subdomain' => 'nullable|string',
            'status' => 'required|in:active,suspended,trial',
        ]);

        $tenant = Tenant::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) . '-' . Str::random(6),
            'domain' => $validated['domain'] ?? null,
            'subdomain' => $validated['subdomain'] ?? null,
            'status' => $validated['status'],
        ]);

        TenantBranding::create(['tenant_id' => $tenant->id, 'app_name' => $tenant->name]);

        return redirect()->route('admin.tenants.show', $tenant)->with('success', 'Tenant created');
    }

    public function show(Tenant $tenant)
    {
        $tenant->load(['branding', 'users']);
        return Inertia::render('admin/Tenants/Show', ['tenant' => $tenant]);
    }
}
