<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectApiController extends ApiController
{
    public function index(Request $request)
    {
        $projects = Project::with(['towers'])
            ->when($request->search, fn($q,$s)=>$q->where('name','like',"%$s%"))
            ->latest()->paginate(20);
        return ApiResponse::success($projects);
    }

    public function show(Project $project)
    {
        $project->load(['towers.units']);
        return ApiResponse::success($project);
    }
}
