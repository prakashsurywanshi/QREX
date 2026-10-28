<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\MediaFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends ApiController
{
    public function index()
    {
        return ApiResponse::success([
            'mediaFiles' => MediaFile::latest()->get(),
            'folders' => ['Properties', 'Customers', 'Deals', 'Legal', 'Marketing', 'Website', 'General'],
            'storage' => [
                'used' => $this->totalSize(),
                'entries' => MediaFile::count(),
            ],
        ]);
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
                return ApiResponse::error('File type is not allowed.', 422);
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
            return ApiResponse::error('A valid file is required.', 422);
        }

        $data['uploaded_by'] = $request->user()?->name ?? 'System';

        $mediaFile = MediaFile::create($data);

        return ApiResponse::success($mediaFile, 'File uploaded.', 201);
    }

    public function destroy(MediaFile $mediaFile)
    {
        $path = $this->storagePathFromUrl($mediaFile->url);
        if ($path && str_starts_with($path, 'media/') && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        $mediaFile->delete();

        return ApiResponse::success(null, 'File deleted.');
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
}