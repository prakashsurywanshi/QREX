<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Payment;
use App\Models\Booking;

class ReportExportController extends ApiController
{
    public function payments()
    {
        $payments = Payment::with(['booking'])->latest()->get();
        return ApiResponse::success($payments);
    }

    public function bookings()
    {
        $bookings = Booking::with(['customer', 'unit'])->latest()->get();
        return ApiResponse::success($bookings);
    }
}
