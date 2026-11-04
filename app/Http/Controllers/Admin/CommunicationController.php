<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Communication;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommunicationController extends Controller
{
    public function index(Request $request)
    {
        $communications = Communication::with(['user'])
            ->latest()
            ->paginate(20);

        return Inertia::render('admin/Communications/Index', [
            'communications' => $communications,
        ]);
    }
}
