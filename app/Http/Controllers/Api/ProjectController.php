<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectController extends ApiController
{
    public function index(Request $request)
    {
        $projects = Project::with(['towers', 'units'])
            ->withCount(['units', 'units as available_units_count' => fn($q)=>$q->where('status','available')])
            ->latest()->paginate(15);
        return ApiResponse::success($projects);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string',
            'address' => 'nullable|string',
            'developer' => 'nullable|string',
            'rera_no' => 'nullable|string',
            'launch_date' => 'nullable|date',
            'possession_date' => 'nullable|date',
            'description' => 'nullable|string',
            'status' => 'nullable|in:upcoming,ongoing,completed',
            'featured' => 'nullable|boolean',
            'is_published' => 'nullable|boolean',
        ]);

        $project = Project::create([...$validated, 'created_by' => Auth::id()]);
        return ApiResponse::success($project, 'Project created successfully', 201);
    }

    public function show(Project $project)
    {
        $project->load(['towers.units']);
        return ApiResponse::success($project);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'location' => 'nullable|string',
            'status' => 'nullable|in:upcoming,ongoing,completed',
            'featured' => 'nullable|boolean',
            'is_published' => 'nullable|boolean',
        ]);
        $project->update($validated);
        return ApiResponse::success($project, 'Project updated successfully');
    }

    public function destroy(Project $project)
    {
        $project->delete();
        return ApiResponse::success(null, 'Project deleted successfully');
    }
}
