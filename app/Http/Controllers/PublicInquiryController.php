<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PublicInquiryController extends Controller
{
    public function contact(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'phone' => 'required|string',
            'email' => 'nullable|email',
            'message' => 'nullable|string',
        ]);

        $lead = Lead::create([
            'lead_id' => $this->nextId('L'),
            'name' => $data['name'],
            'phone' => $data['phone'],
            'email' => $data['email'] ?? null,
            'source' => 'Website',
            'status' => 'New',
            'requirements' => $data['message'] ?? null,
            'score' => 0,
        ]);

        LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => 'Note',
            'title' => 'Website enquiry submitted',
            'description' => $data['message'] ?? null,
            'user_id' => Auth::id(),
        ]);

        return back()->with('success', 'Thank you! Your enquiry has been received. We will contact you shortly.');
    }

    public function propertyInquiry(Request $request, Property $property)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'phone' => 'required|string',
            'email' => 'nullable|email',
            'message' => 'nullable|string',
        ]);

        Lead::create([
            'lead_id' => $this->nextId('L'),
            'name' => $data['name'],
            'phone' => $data['phone'],
            'email' => $data['email'] ?? null,
            'source' => 'Website',
            'status' => 'New',
            'interested_property_id' => $property->id,
            'requirements' => $data['message'] ?? null,
            'score' => 0,
        ]);

        return back()->with('success', 'Thank you! Your enquiry has been recorded. Our agent will reach out to schedule a site visit.');
    }
}
