<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Booking;
use App\Models\Deal;
use App\Models\Lead;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class ReportApiController extends ApiController
{
    public function index()
    {
        $leadQuery = Lead::query()->visibleTo(Auth::user());
        $data = [
            'leads_count' => (clone $leadQuery)->count(),
            'deals_count' => Deal::count(),
            'bookings_count' => Booking::count(),
            'payments_total' => Payment::sum('amount'),
            'leads_by_status' => (clone $leadQuery)->selectRaw('status, count(*) as count')->groupBy('status')->get(),
            'monthly_leads' => (clone $leadQuery)->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, count(*) as count")
                ->where('created_at', '>=', Carbon::now()->subMonths(12))
                ->groupBy('month')->orderBy('month')->get(),
        ];
        return ApiResponse::success($data);
    }
}
