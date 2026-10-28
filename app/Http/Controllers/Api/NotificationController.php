<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends ApiController
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $notifications = Notification::query()
            ->where('user_id', $userId)
            ->latest()
            ->limit(15)
            ->get()
            ->map(fn ($n) => [
                'id' => $n->id,
                'title' => $n->title,
                'message' => $n->message,
                'type' => $n->type,
                'related_id' => $n->related_id,
                'url' => $this->resolveUrl($n->type, $n->related_id),
                'is_read' => (bool) $n->is_read,
                'created_at' => $n->created_at?->diffForHumans(),
            ]);

        return ApiResponse::success([
            'notifications' => $notifications,
            'unread' => Notification::where('user_id', $userId)->where('is_read', false)->count(),
        ]);
    }

    public function read(Request $request, Notification $notification)
    {
        abort_if($notification->user_id !== $request->user()->id, 403, 'Unauthorized.');

        $notification->update(['is_read' => true]);

        return ApiResponse::success(null, 'Notification marked as read.');
    }

    public function readAll(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return ApiResponse::success(null, 'All notifications marked as read.');
    }

    protected function resolveUrl(?string $type, ?int $relatedId): ?string
    {
        return match ($type) {
            'followup',
            'site_visit.scheduled',
            'lead.converted' => $relatedId ? "/admin/leads/{$relatedId}" : '/admin/leads',
            'deal.created' => '/admin/pipeline',
            'booking.created' => $relatedId ? "/admin/bookings/{$relatedId}" : '/admin/bookings',
            'payment.received' => '/admin/payments',
            default => null,
        };
    }
}