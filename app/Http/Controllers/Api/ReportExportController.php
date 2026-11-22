<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;

class ReportExportController extends ApiController
{
    public function payments(Request $request)
    {
        $perPage = min(max((int) $request->integer('per_page', 100), 1), 500);
        $query = Payment::query()->latest();
        if ($request->filled('status')) $query->where('status', $request->string('status'));
        return ApiResponse::success($query->paginate($perPage));
    }

    public function bookings(Request $request)
    {
        $perPage = min(max((int) $request->integer('per_page', 100), 1), 500);
        $query = Booking::query()->latest();
        if ($request->filled('status')) $query->where('status', $request->string('status'));
        return ApiResponse::success($query->paginate($perPage));
    }
}
