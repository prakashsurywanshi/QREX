<?php

namespace App\Providers;

use App\Models\Booking;
use App\Models\Commission;
use App\Models\Deal;
use App\Models\Installment;
use App\Models\Lead;
use App\Models\Payment;
use App\Models\PaymentPlan;
use App\Models\Project;
use App\Models\Unit;
use App\Policies\CommissionPolicy;
use App\Policies\OwnedResourcePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Commission::class => CommissionPolicy::class,
        Lead::class => OwnedResourcePolicy::class,
        Deal::class => OwnedResourcePolicy::class,
        Booking::class => OwnedResourcePolicy::class,
        Payment::class => OwnedResourcePolicy::class,
        PaymentPlan::class => OwnedResourcePolicy::class,
        Installment::class => OwnedResourcePolicy::class,
        Project::class => OwnedResourcePolicy::class,
        Unit::class => OwnedResourcePolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
        Gate::before(function ($user, $ability) {
            return $user->isSuperAdmin() ? true : null;
        });
    }
}
