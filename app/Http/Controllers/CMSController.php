<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CMSController extends Controller
{
    protected function sectionDefaults(): array
    {
        return [
            ['id' => 'hero', 'label' => 'Hero Section', 'visible' => true, 'icon' => '🏠'],
            ['id' => 'search', 'label' => 'Property Search Bar', 'visible' => true, 'icon' => '🔍'],
            ['id' => 'featured', 'label' => 'Featured Properties Slider', 'visible' => true, 'icon' => '⭐'],
            ['id' => 'stats', 'label' => 'Statistics & Numbers', 'visible' => true, 'icon' => '📊'],
            ['id' => 'categories', 'label' => 'Property Categories', 'visible' => true, 'icon' => '🏘️'],
            ['id' => 'about', 'label' => 'About Agency', 'visible' => true, 'icon' => '🏢'],
            ['id' => 'agents', 'label' => 'Our Agents', 'visible' => true, 'icon' => '👥'],
            ['id' => 'testimonials', 'label' => 'Testimonials', 'visible' => false, 'icon' => '💬'],
            ['id' => 'cta', 'label' => 'Call to Action', 'visible' => true, 'icon' => '📞'],
            ['id' => 'contact', 'label' => 'Contact Form', 'visible' => true, 'icon' => '✉️'],
        ];
    }

    public function index()
    {
        $saved = json_decode(Setting::allAsArray()['cms_sections'] ?? '[]', true) ?: [];
        $sections = array_map(function ($s) use ($saved) {
            if (array_key_exists($s['id'], $saved)) {
                $s['visible'] = (bool) $saved[$s['id']];
            }

            return $s;
        }, $this->sectionDefaults());

        $featuredIds = json_decode(Setting::allAsArray()['featured_properties'] ?? 'null', true);

        return Inertia::render('admin/CMS', [
            'featuredProperties' => $featuredIds
                ? Property::whereIn('id', $featuredIds)->get()
                : Property::where('featured', true)->get(),
            'allProperties' => Property::take(10)->get(['id', 'title', 'image', 'price_label', 'status']),
            'agents' => User::whereIn('role', ['Sales Executive', 'Senior Agent'])->get(['id', 'name', 'role', 'branch']),
            'sections' => $sections,
            'featuredIds' => $featuredIds ?? Property::where('featured', true)->pluck('id')->all(),
        ]);
    }

    public function updateSection(Request $request, string $section)
    {
        $saved = json_decode(Setting::allAsArray()['cms_sections'] ?? '[]', true) ?: [];
        $saved[$section] = (bool) $request->input('visible', false);
        Setting::set('cms_sections', json_encode($saved), 'cms');

        return back()->with('success', 'Section updated.');
    }

    public function updateFeatured(Request $request)
    {
        $request->validate([
            'ids' => ['nullable', 'array'],
            'ids.*' => ['integer'],
        ]);

        Setting::set('featured_properties', json_encode($request->input('ids', [])), 'cms');

        return back()->with('success', 'Featured properties updated.');
    }
}
