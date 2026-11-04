<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Tower;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProjectWebController extends Controller
{
    public function index()
    {
        $projects = Project::withCount(['units'])->latest()->paginate(15);
        return Inertia::render('admin/Projects/Index', ['projects' => $projects]);
    }

    public function create()
    {
        return Inertia::render('admin/Projects/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string',
            'developer' => 'nullable|string',
            'rera_no' => 'nullable|string',
            'status' => 'required|in:upcoming,ongoing,completed',
            'description' => 'nullable|string',
        ]);

        $project = Project::create([
            ...$validated,
            'slug' => Str::slug($validated['name']) . '-' . Str::random(6),
            'created_by' => Auth::id(),
            'is_published' => true,
        ]);

        return redirect()->route('admin.projects.show', $project)->with('success', 'Project created');
    }

    public function show(Project $project)
    {
        $project->load(['towers.units']);
        return Inertia::render('admin/Projects/Show', ['project' => $project]);
    }
}
