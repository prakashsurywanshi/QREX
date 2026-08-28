<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

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

        return response()->json([
            'notifications' => $notifications,
            'unread' => Notification::where('user_id', $userId)->where('is_read', false)->count(),
        ]);
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

    public function read(Request $request, Notification $notification)
    {
        abort_if($notification->user_id !== auth()->id(), 403, 'Unauthorized.');

        $notification->update(['is_read' => true]);

        return back();
    }

    public function readAll()
    {
        Notification::where('user_id', auth()->id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return back()->with('success', 'All notifications marked as read.');
    }
}
