<?php

namespace App\Http\Controllers;

use App\Services\IdGenerator;

abstract class Controller
{
    protected function nextId(string $prefix, string $context = '', int $pad = 3): string
    {
        return app(IdGenerator::class)->next($prefix, $context, $pad);
    }
}
