<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\MediaFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MediaController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/MediaCenter', [
            'mediaFiles' => MediaFile::latest()->get(),
            'folders' => ['Properties', 'Customers', 'Deals', 'Legal', 'Marketing', 'Website', 'General'],
            'storage' => [
                'used' => $this->totalSize(),
                'entries' => MediaFile::count(),
            ],
        ]);
    }

    protected function totalSize(): float
    {
        $total = 0;
        foreach (MediaFile::pluck('size') as $size) {
            if (preg_match('/([\d.]+)\s*(KB|MB|GB)/i', (string) $size, $m)) {
                $total += match (strtoupper($m[2])) {
                    'KB' => (float) $m[1] / 1024,
                    'MB' => (float) $m[1],
                    'GB' => (float) $m[1] * 1024,
                    default => 0,
                };
            }
        }

        return round($total, 2);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'folder' => 'nullable|in:Properties,Customers,Deals,Legal,Marketing,Website,General',
            'property_name' => 'nullable|string',
            'size' => 'nullable|string',
            'file' => 'nullable|file|mimes:jpg,jpeg,png,webp,gif,pdf,doc,docx,xls,xlsx,mp4,mp3|max:51200',
        ]);

        $folder = $data['folder'] ?: 'General';

        if ($request->hasFile('file') && $request->file('file')->isValid()) {
            $file = $request->file('file');

            // Content sniffing: reject files whose declared MIME does not match a safe type.
            $safeMime = [
                'image/jpeg', 'image/png', 'image/webp', 'image/gif',
                'application/pdf', 'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'video/mp4', 'audio/mpeg',
            ];
            $mime = $file->getMimeType() ?? '';
            if (!in_array($mime, $safeMime, true)) {
                return back()->with('error', 'File type is not allowed.');
            }

            $path = $file->store('media/'.$folder, 'public');
            $data['url'] = Storage::disk('public')->url($path);
            $data['name'] = $data['name'] ?? $file->getClientOriginalName();
            $data['size'] = $this->humanSize($file->getSize());
            if (str_starts_with($mime, 'image/')) {
                $data['type'] = 'image';
            } elseif (str_starts_with($mime, 'video/')) {
                $data['type'] = 'video';
            } elseif ($mime === 'application/pdf') {
                $data['type'] = 'pdf';
            } else {
                $data['type'] = 'document';
            }
        } else {
            return back()->with('error', 'A valid file is required.');
        }

        $data['uploaded_by'] = $request->user()?->name ?? 'System';

        MediaFile::create($data);

        return back()->with('success', 'File uploaded.');
    }

    public function destroy(MediaFile $mediaFile)
    {
        // Only delete files that live under the media/ folder to prevent arbitrary deletion.
        $path = $this->storagePathFromUrl($mediaFile->url);
        if ($path && str_starts_with($path, 'media/') && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        $mediaFile->delete();

        return back()->with('success', 'File deleted.');
    }

    protected function storagePathFromUrl(?string $url): ?string
    {
        if (!$url) {
            return null;
        }
        $base = rtrim(Storage::disk('public')->url('/'), '/');
        if (str_starts_with($url, $base.'/')) {
            return ltrim(substr($url, strlen($base)), '/');
        }
        if (preg_match('#^/storage/(.+)$#', $url, $m)) {
            return $m[1];
        }
        return null;
    }

    protected function humanSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        $size = (float) $bytes;
        while ($size >= 1024 && $i < count($units) - 1) {
            $size /= 1024;
            $i++;
        }
        return round($size, $i > 1 ? 2 : 0).' '.$units[$i];
    }
}
