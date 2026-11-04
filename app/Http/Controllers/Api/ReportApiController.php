<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Lead;
use App\Models\Deal;
use App\Models\Booking;
use App\Models\Payment;
use Carbon\Carbon;

class ReportApiController extends ApiController
{
    public function index()
    {
        $data = [
            'leads_count' => Lead::count(),
            'deals_count' => Deal::count(),
            'bookings_count' => Booking::count(),
            'payments_total' => Payment::sum('amount'),
            'leads_by_status' => Lead::selectRaw('status, count(*) as count')->groupBy('status')->get(),
            'monthly_leads' => Lead::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, count(*) as count")
                ->where('created_at', '>=', Carbon::now()->subMonths(12))
                ->groupBy('month')->orderBy('month')->get(),
        ];
        return ApiResponse::success($data);
    }
}
