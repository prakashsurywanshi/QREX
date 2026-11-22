<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Booking;
use App\Models\Payment;

class ReportExportController extends ApiController
{
    public function payments()
    {
        return ApiResponse::success(Payment::latest()->limit(5000)->get());
    }

    public function bookings()
    {
        return ApiResponse::success(Booking::latest()->limit(5000)->get());
    }
}
