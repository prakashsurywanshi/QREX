<?php

namespace App\Http\Controllers;

use App\Services\IdGenerator;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

abstract class Controller
{
    use AuthorizesRequests;

    protected function nextId(string $prefix, string $context = '', int $pad = 3): string
    {
        return app(IdGenerator::class)->next($prefix, $context, $pad);
    }
}
