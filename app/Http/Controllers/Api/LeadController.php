<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Campaign;
use App\Models\Deal;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\LeadHandover;
use App\Models\Notification;
use App\Models\Property;
use App\Models\SiteVisit;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Validation\Rule;
use App\Events\LeadCreated;

class LeadController extends ApiController
{
    protected array $validSources = ['Website', 'Facebook', 'Instagram', 'Google', 'Referral', 'Walk-in', 'Phone', 'WhatsApp', 'Campaign'];

    protected array $validStatuses = ['New', 'Contacted', 'Qualified', 'Site Visit Scheduled', 'Site Visit Completed', 'Negotiation', 'Converted', 'Lost'];

    protected array $agentRoles = ['sales-executive', 'senior-agent'];

    protected function applyAgentScope($query): void
    {
        $user = Auth::user();

        if ($user->isSuperAdmin() || $user->hasRole('admin')) {
            return;
        }

        if ($user->hasAnyRole($this->agentRoles)) {
            $query->where(fn ($q) => $q
                ->where('assigned_agent_id', $user->id)
                ->orWhere('owner_id', $user->id));
        }
    }

    protected function authorizeLeadAccess(Lead $lead): void
    {
        $user = Auth::user();

        if ($user->isSuperAdmin() || $user->hasRole('admin')) {
            return;
        }

        if ($user->hasAnyRole($this->agentRoles)) {
            abort_unless(
                $lead->assigned_agent_id === $user->id || $lead->owner_id === $user->id,
                403,
                'You do not have access to this lead.'
            );
        }
    }

    public function index(Request $request)
    {
        $query = Lead::query()->with(['assignedAgent', 'interestedProperty', 'creator', 'campaign']);

        $this->applyAgentScope($query);

        if ($request->filled('search')) {
            $query->where(fn ($q) => $q
                ->where('name', 'like', '%'.$request->search.'%')
                ->orWhere('phone', 'like', '%'.$request->search.'%')
                ->orWhere('email', 'like', '%'.$request->search.'%'));
        }

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        if ($request->filled('source') && $request->source !== 'All') {
            $query->where('source', $request->source);
        }

        if ($request->filled('campaign') && $request->campaign !== 'All') {
            $query->where('campaign_id', $request->campaign);
        }

        $perPage = max(1, (int) $request->integer('per_page', 10));
        $leads = $query->latest()->paginate($perPage);

        return ApiResponse::success([
            'data' => collect($leads->items())->map(fn ($l) => $this->leadBrief($l))->all(),
            'meta' => [
                'current_page' => $leads->currentPage(),
                'last_page' => $leads->lastPage(),
                'per_page' => $leads->perPage(),
                'total' => $leads->total(),
            ],
            'filters' => $request->only(['search', 'status', 'source', 'campaign']),
            'statuses' => $this->validStatuses,
            'sources' => $this->validSources,
            'campaigns' => Campaign::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function show(Lead $lead)
    {
        $this->authorizeLeadAccess($lead);

        $lead->load(['assignedAgent', 'interestedProperty', 'creator', 'campaign', 'owner', 'handovers.fromUser', 'handovers.toUser', 'activities.user']);

        return ApiResponse::success([
            'lead' => $this->leadFull($lead),
            'activities' => $lead->activities()->latest()->get()->map(fn ($a) => [
                'id' => $a->id,
                'type' => $a->type,
                'title' => $a->title,
                'description' => $a->description,
                'duration' => $a->duration,
                'outcome' => $a->outcome,
                'contact_number' => $a->contact_number,
                'email_subject' => $a->email_subject,
                'next_followup' => $a->next_followup,
                'location' => $a->location,
                'user_name' => $a->user?->name ?? 'System',
                'created_at' => $a->created_at->diffForHumans(),
            ]),
            'handovers' => $lead->handovers()->latest()->get()->map(fn ($h) => [
                'id' => $h->id,
                'from_name' => $h->fromUser?->name ?? 'System',
                'to_name' => $h->toUser?->name ?? 'Unassigned',
                'reason' => $h->reason,
                'notes' => $h->notes,
                'created_at' => $h->created_at->diffForHumans(),
            ]),
            'recommendations' => Property::where('is_website_visible', true)->with('images')->take(4)->get()
                ->map(fn ($p) => ['id' => $p->id, 'title' => $p->title, 'price_label' => $p->price_label, 'image' => $p->coverOrImage()]),
            'agents' => User::whereIn('role', ['Sales Executive', 'Senior Agent'])->get(['id', 'name']),
            'owners' => User::whereIn('role', ['Super Admin', 'Admin', 'Sales Executive', 'Senior Agent'])->get(['id', 'name']),
            'campaigns' => Campaign::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'phone' => 'required|string',
            'email' => 'nullable|email',
            'source' => 'required|string',
            'status' => 'required|string',
            'budget' => 'nullable|string',
            'preferred_location' => 'nullable|string',
            'interested_property_id' => 'nullable|integer',
            'assigned_agent_id' => 'nullable|integer',
            'owner_id' => 'nullable|integer',
            'campaign_id' => 'nullable|integer',
            'score' => 'nullable|integer',
            'next_followup' => 'nullable|string',
        ]);

        $data['lead_id'] = $this->nextId('L');
        $data['created_by'] = Auth::id();
        $data['owner_id'] = $data['owner_id'] ?? $data['assigned_agent_id'] ?? null;
        if (empty($data['score'])) {
            $data['score'] = 0;
        }

        $lead = Lead::create($data);
        $this->syncFollowupTask($lead, $data['next_followup'] ?? null, true);

        $lead->load('assignedAgent');
        Event::dispatch(new LeadCreated($lead));
        return ApiResponse::success($this->leadFull($lead), 'Lead created successfully.', 201);
    }

    public function update(Request $request, Lead $lead)
    {
        $this->authorizeLeadAccess($lead);

        $data = $request->validate([
            'name' => 'required|string',
            'phone' => 'required|string',
            'email' => 'nullable|email',
            'source' => 'required|string',
            'status' => 'required|string',
            'budget' => 'nullable|string',
            'preferred_location' => 'nullable|string',
            'interested_property_id' => 'nullable|integer',
            'assigned_agent_id' => 'nullable|integer',
            'owner_id' => 'nullable|integer',
            'campaign_id' => 'nullable|integer',
            'score' => 'nullable|integer',
            'next_followup' => 'nullable|string',
        ]);

        $data['owner_id'] = $data['owner_id'] ?? $data['assigned_agent_id'] ?? null;
        $nextFollowup = $data['next_followup'] ?? null;

        $lead->update($data);
        $this->syncFollowupTask($lead, $nextFollowup);

        return ApiResponse::success($this->leadFull($lead->load('assignedAgent')), 'Lead updated.');
    }

    public function destroy(Lead $lead)
    {
        $this->authorizeLeadAccess($lead);

        $lead->delete();

        return ApiResponse::success(null, 'Lead deleted.');
    }

    public function reassign(Request $request, Lead $lead)
    {
        $this->authorizeLeadAccess($lead);

        $request->validate([
            'assigned_agent_id' => ['nullable', 'integer'],
            'reason' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($request, $lead) {
            $previousAssignee = $lead->assigned_agent_id;
            $lead->update([
                'assigned_agent_id' => $request->assigned_agent_id,
                'owner_id' => $request->assigned_agent_id,
            ]);

            if ($previousAssignee !== $lead->assigned_agent_id) {
                LeadHandover::create([
                    'lead_id' => $lead->id,
                    'from_user_id' => $previousAssignee,
                    'to_user_id' => $lead->assigned_agent_id,
                    'reason' => $request->reason,
                    'notes' => $request->notes,
                ]);

                LeadActivity::create([
                    'lead_id' => $lead->id,
                    'type' => 'Reassignment',
                    'title' => 'Lead reassigned',
                    'description' => ($request->reason ?: 'Handed over to another agent'),
                    'user_id' => Auth::id(),
                ]);
            }
        });

        return ApiResponse::success(null, 'Lead reassigned successfully.');
    }

    public function addActivity(Request $request, Lead $lead)
    {
        $this->authorizeLeadAccess($lead);

        $data = $request->validate([
            'type' => 'required|string',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'duration' => 'nullable|string',
            'outcome' => 'nullable|string',
            'contact_number' => 'nullable|string',
            'email_subject' => 'nullable|string',
            'next_followup' => 'nullable|string',
            'location' => 'nullable|string',
        ]);

        LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => $data['type'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'duration' => $data['duration'] ?? null,
            'outcome' => $data['outcome'] ?? null,
            'contact_number' => $data['contact_number'] ?? null,
            'email_subject' => $data['email_subject'] ?? null,
            'next_followup' => $data['next_followup'] ?? null,
            'location' => $data['location'] ?? null,
            'user_id' => Auth::id(),
        ]);

        if (!empty($data['next_followup'])) {
            $lead->update(['next_followup' => $data['next_followup']]);
            $this->syncFollowupTask($lead, $data['next_followup']);
        }

        $lead->update(['last_contact' => now()]);

        return ApiResponse::success(null, 'Activity logged.');
    }

    public function changeStatus(Request $request, Lead $lead)
    {
        $this->authorizeLeadAccess($lead);

        $request->validate([
            'status' => ['required', 'string', Rule::in($this->validStatuses)],
        ]);

        DB::transaction(function () use ($request, $lead) {
            $lead->update(['status' => $request->status]);

            if ($request->status === 'Site Visit Scheduled' && $this->scheduleSiteVisit($lead)) {
                $this->notify([
                    'user_id' => $lead->assigned_agent_id,
                    'title' => 'Site visit scheduled',
                    'message' => 'A site visit has been scheduled for '.$lead->name,
                    'type' => 'site_visit.scheduled',
                    'related_id' => $lead->id,
                ]);
            }

            LeadActivity::create([
                'lead_id' => $lead->id,
                'type' => 'Status Change',
                'title' => 'Status changed to '.$request->status,
                'user_id' => Auth::id(),
            ]);
        });

        return ApiResponse::success(null, 'Status updated.');
    }

    public function convertToDeal(Request $request, Lead $lead)
    {
        $this->authorizeLeadAccess($lead);

        $request->validate([
            'deal_value' => ['required', 'numeric', 'min:0'],
            'property_id' => ['nullable', 'integer'],
            'stage' => ['nullable', 'string'],
        ]);

        $result = DB::transaction(function () use ($request, $lead) {
            $locked = Lead::whereKey($lead->id)->lockForUpdate()->firstOrFail();

            if (in_array($locked->status, ['Converted', 'Lost'])) {
                return ['error' => 'This lead cannot be converted in its current status.'];
            }

            $deal = Deal::create([
                'deal_id' => $this->nextId('DL'),
                'lead_id' => $locked->id,
                'customer_name' => $locked->name,
                'property_id' => $request->property_id ?: $locked->interested_property_id,
                'deal_value' => $request->deal_value,
                'value_label' => $this->label($request->deal_value),
                'stage' => $request->stage ?: 'Qualified',
                'stage_changed_at' => now(),
                'probability' => 30,
                'days_in_stage' => 0,
                'assigned_agent_id' => $locked->assigned_agent_id,
            ]);

            $locked->update(['status' => 'Converted']);

            LeadActivity::create([
                'lead_id' => $locked->id,
                'type' => 'Conversion',
                'title' => 'Converted to deal',
                'description' => 'Created deal '.$deal->deal_id.' worth '.$deal->value_label,
                'user_id' => Auth::id(),
            ]);

            $this->notify([
                'user_id' => $locked->assigned_agent_id,
                'title' => 'Lead converted to deal',
                'message' => $deal->deal_id.' created for '.$locked->name.' worth '.$deal->value_label,
                'type' => 'lead.converted',
                'related_id' => $locked->id,
            ]);

            return ['success' => $deal->deal_id];
        });

        if (isset($result['error'])) {
            return ApiResponse::error($result['error'], 422);
        }

        return ApiResponse::success(['deal_id' => $result['success']], 'Lead converted to deal successfully.');
    }

    public function importTemplate()
    {
        $headers = [
            'name', 'phone', 'email', 'source', 'status', 'budget', 'preferred_location',
            'requirements', 'score', 'next_followup',
        ];

        $callback = function () use ($headers) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $headers);
            fputcsv($handle, ['John Doe', '+919876543210', 'john@example.com', 'Website', 'New', '1.5 Cr', 'Andheri West', '2/3 BHK ready to move', '50', '']);
            fclose($handle);
        };

        return response()->streamDownload($callback, 'lead-import-template.csv', ['Content-Type' => 'text/csv']);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
            'campaign_id' => ['nullable', 'integer', 'exists:campaigns,id'],
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        $importCampaignId = $request->filled('campaign_id') ? (int) $request->campaign_id : null;

        if ($handle === false) {
            return ApiResponse::error('Unable to read the uploaded file.', 422);
        }

        $headerRow = null;
        $imported = 0;
        $skipped = 0;
        $errors = [];
        $rowIndex = 0;
        $seenPhones = [];

        try {
            DB::beginTransaction();

            while (($row = fgetcsv($handle)) !== false) {
                $rowIndex++;

                if ($row === [null] || !array_filter($row)) {
                    continue;
                }

                $row = array_map(fn ($v) => trim((string) $v), $row);
                $normalized = array_map(fn ($v) => strtolower(str_replace([' ', '-'], '_', $v)), $row);

                if ($headerRow === null) {
                    $map = $this->validHeaderMap($normalized);
                    $matches = array_intersect(array_values($map), $normalized);
                    $looksLikeHeader = sizeof($map) > 0 && count($matches) >= 3;
                    if ($looksLikeHeader || ($this->looksLikeHeaderRow($normalized) && $this->allTextTokens($normalized))) {
                        $headerRow = $this->buildHeaderMap($normalized);
                        continue;
                    }
                    $headerRow = $this->sequentialMap(count($row));
                }

                $data = $this->mapRow($row, $headerRow);
                $name = $data['name'] ?? '';
                $phone = $data['phone'] ?? '';

                if ($name === '' || $phone === '') {
                    $skipped++;
                    $errors[] = "Row {$rowIndex}: name and phone are required.";
                    continue;
                }

                if (isset($seenPhones[$phone])) {
                    $skipped++;
                    $errors[] = "Row {$rowIndex}: duplicate lead within file ({$name} / {$phone}).";
                    continue;
                }
                $seenPhones[$phone] = true;

                if ($this->duplicateExists($name, $phone)) {
                    $skipped++;
                    $errors[] = "Row {$rowIndex}: duplicate lead ({$name} / {$phone}).";
                    continue;
                }

                [$propertyId, $agentId] = $this->resolveReferences(
                    $data['interested_property'] ?? '',
                    $data['assigned_agent'] ?? ''
                );

                $lead = Lead::create([
                    'lead_id' => $this->nextId('L'),
                    'name' => $name,
                    'phone' => $phone,
                    'email' => $data['email'] ?? null,
                    'source' => $this->normalize($data['source'] ?? '', $this->validSources, 'Campaign'),
                    'status' => $this->normalize($data['status'] ?? '', $this->validStatuses, 'New'),
                    'budget' => $data['budget'] ?? null,
                    'preferred_location' => $data['preferred_location'] ?? null,
                    'requirements' => $data['requirements'] ?? null,
                    'interested_property_id' => $propertyId,
                    'assigned_agent_id' => $agentId,
                    'owner_id' => $agentId,
                    'campaign_id' => $importCampaignId,
                    'score' => min(max((int) ($data['score'] ?? 0), 0), 100),
                    'next_followup' => $data['next_followup'] ?? null,
                    'created_by' => Auth::id(),
                ]);

                $this->syncFollowupTask($lead, $data['next_followup'] ?? null, true);

                LeadActivity::create([
                    'lead_id' => $lead->id,
                    'type' => 'Lead Imported',
                    'title' => 'Lead imported from CSV',
                    'description' => 'Imported by '.Auth::user()->name,
                    'user_id' => Auth::id(),
                ]);

                $imported++;
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Lead import failed: '.$e->getMessage());

            return ApiResponse::error('Import failed. Please check the file format and try again.', 422);
        } finally {
            fclose($handle);
        }

        $message = "{$imported} lead(s) imported";
        if ($skipped > 0) {
            $message .= ", {$skipped} row(s) skipped";
        }

        return ApiResponse::success([
            'imported' => $imported,
            'skipped' => $skipped,
            'errors' => array_slice($errors, 0, 50),
        ], $message.'.');
    }

    protected function leadBrief($l): array
    {
        return [
            'id' => $l->id,
            'lead_id' => $l->lead_id,
            'name' => $l->name,
            'phone' => $l->phone,
            'email' => $l->email,
            'source' => $l->source,
            'status' => $l->status,
            'budget' => $l->budget,
            'score' => (int) $l->score,
            'preferred_location' => $l->preferred_location,
            'next_followup' => $l->next_followup,
            'property_title' => $l->interestedProperty?->title,
            'agent_name' => $l->assignedAgent?->name,
            'agent_id' => $l->assigned_agent_id,
            'campaign_name' => $l->campaign?->name,
            'created_by' => $l->creator?->name,
            'created_at' => $l->created_at?->toISOString(),
        ];
    }

    protected function leadFull($l): array
    {
        return [
            'id' => $l->id,
            'lead_id' => $l->lead_id,
            'name' => $l->name,
            'phone' => $l->phone,
            'email' => $l->email,
            'source' => $l->source,
            'status' => $l->status,
            'budget' => $l->budget,
            'score' => (int) $l->score,
            'preferred_location' => $l->preferred_location,
            'requirements' => $l->requirements,
            'next_followup' => $l->next_followup,
            'last_contact' => $l->last_contact,
            'interested_property' => $l->interestedProperty ? [
                'id' => $l->interestedProperty->id,
                'title' => $l->interestedProperty->title,
                'price_label' => $l->interestedProperty->price_label,
            ] : null,
            'interested_property_id' => $l->interested_property_id,
            'assigned_agent' => $l->assignedAgent ? ['id' => $l->assignedAgent->id, 'name' => $l->assignedAgent->name, 'initials' => $l->assignedAgent->initials] : null,
            'assigned_agent_id' => $l->assigned_agent_id,
            'owner' => $l->owner?->name,
            'owner_id' => $l->owner_id,
            'creator' => $l->creator?->name,
            'created_by' => $l->created_by,
            'campaign' => $l->campaign ? ['id' => $l->campaign->id, 'name' => $l->campaign->name] : null,
            'campaign_id' => $l->campaign_id,
            'created_at' => $l->created_at?->toISOString(),
            'updated_at' => $l->updated_at?->toISOString(),
        ];
    }

    protected function syncFollowupTask(Lead $lead, ?string $raw, bool $createIfMissing = false): void
    {
        $followup = trim((string) $raw);
        $existing = Task::where('lead_id', $lead->id)->where('type', 'Follow-up')->where('status', '!=', 'Completed')->latest()->first();

        if ($followup === '') {
            if ($existing) {
                $existing->update(['status' => 'Completed']);
            }

            return;
        }

        [$date, $time] = $this->parseFollowupDateTime($followup);

        if (!$existing) {
            if (!$createIfMissing) {
                return;
            }

            Task::create([
                'task_id' => $this->nextId('TSK'),
                'title' => 'Follow-up: '.$lead->name,
                'description' => 'Scheduled follow-up for lead '.$lead->name,
                'type' => 'Follow-up',
                'priority' => 'High',
                'status' => $date && now()->toDateString() > $date ? 'Overdue' : 'Pending',
                'due_date' => $date,
                'due_time' => $time,
                'related_to' => 'Lead',
                'related_id' => $lead->id,
                'lead_id' => $lead->id,
                'assigned_to_id' => $lead->assigned_agent_id,
                'created_by' => Auth::id(),
            ]);
        } else {
            $existing->update([
                'due_date' => $date,
                'due_time' => $time,
                'assigned_to_id' => $lead->assigned_agent_id,
                'status' => $date && now()->toDateString() > $date ? 'Overdue' : 'Pending',
                'title' => 'Follow-up: '.$lead->name,
            ]);
        }
    }

    protected function parseFollowupDateTime(string $raw): array
    {
        $date = null;
        $time = null;
        $knownFormats = [
            ['formats' => ['Y-m-d', 'Y/m/d', 'd-m-Y', 'd/m/Y'], 'time' => 0],
        ];

        $tokens = preg_split('/[\s,]+/', $raw, -1, PREG_SPLIT_NO_EMPTY) ?: [];

        foreach ($tokens as $i => $token) {
            foreach ($knownFormats[0]['formats'] as $format) {
                if ($date === null && @\DateTime::createFromFormat($format, $token)) {
                    $date = date('Y-m-d', strtotime($token));
                } elseif ($date === null && preg_match('/^\d{4}-\d{2}-\d{2}$/', $token)) {
                    $date = $token;
                }
            }
            if ($date !== null && $time === null && $i > 0) {
                if (preg_match('/^(1[0-2]|0?[1-9]):[0-5][0-9]\s?(AM|PM)$/i', $token)) {
                    $time = $token;
                } elseif (preg_match('/^(2[0-3]|[01]?[0-9]):[0-5][0-9]$/', $token)) {
                    $time = $token;
                }
            }
        }

        if ($date === null) {
            $date = now()->addDay()->toDateString();
        }

        return [$date, $time];
    }

    protected function isValidDate(?string $value): bool
    {
        if ($value === null || $value === '') {
            return false;
        }

        $dt = \DateTime::createFromFormat('Y-m-d', $value);

        return $dt !== false && $dt->format('Y-m-d') === $value;
    }

    protected function scheduleSiteVisit(Lead $lead): bool
    {
        if (SiteVisit::where('lead_id', $lead->id)->exists()) {
            return false;
        }

        $propertyName = $lead->interested_property?->title ?? $lead->preferred_location ?? '';
        $agentName = $lead->assigned_agent?->name ?? '';

        [$visitDate, $visitTime] = $this->parseFollowupDateTime((string) $lead->next_followup);

        $visitDate = $this->isValidDate($visitDate) ? $visitDate : null;

        SiteVisit::create([
            'lead_id' => $lead->id,
            'visit_id' => $this->nextId('SV'),
            'customer_name' => $lead->name,
            'property_name' => $propertyName,
            'agent_name' => $agentName,
            'visit_date' => $visitDate ?? now()->addDay()->toDateString(),
            'visit_time' => $visitTime ?? '10:00 AM',
            'status' => 'Scheduled',
        ]);

        return true;
    }

    protected function notify(array $data): void
    {
        if (empty($data['user_id'])) {
            return;
        }

        Notification::create($data);
    }

    protected function validHeaderMap(array $normalized): array
    {
        $aliases = [
            'name' => ['name', 'full_name', 'lead_name'],
            'phone' => ['phone', 'mobile', 'contact_number', 'phone_number'],
            'email' => ['email', 'email_address', 'mail'],
            'source' => ['source', 'lead_source'],
            'status' => ['status', 'lead_status'],
            'budget' => ['budget', 'budget_range'],
            'preferred_location' => ['preferred_location', 'location', 'city'],
            'interested_property' => ['interested_property', 'property'],
            'assigned_agent' => ['assigned_agent', 'agent', 'agent_name'],
            'score' => ['score', 'lead_score'],
            'requirements' => ['requirements', 'notes', 'requirement'],
            'next_followup' => ['next_followup', 'followup', 'next_follow_up'],
        ];

        $map = [];
        foreach ($aliases as $field => $candidates) {
            foreach ($candidates as $candidate) {
                if (in_array($candidate, $normalized, true)) {
                    $map[$field] = array_search($candidate, $normalized, true);
                    break;
                }
            }
        }

        return $map;
    }

    protected function buildHeaderMap(array $normalized): array
    {
        return $this->validHeaderMap($normalized);
    }

    protected function allKnownAliases(): array
    {
        return [
            'name', 'full_name', 'lead_name',
            'phone', 'mobile', 'contact_number', 'phone_number',
            'email', 'email_address', 'mail',
            'source', 'lead_source',
            'status', 'lead_status',
            'budget', 'budget_range',
            'preferred_location', 'location', 'city',
            'interested_property', 'property',
            'assigned_agent', 'agent', 'agent_name',
            'score', 'lead_score',
            'requirements', 'notes', 'requirement',
            'next_followup', 'followup', 'next_follow_up',
        ];
    }

    protected function looksLikeHeaderRow(array $normalized): bool
    {
        return count(array_intersect($normalized, $this->allKnownAliases())) > 0;
    }

    protected function allTextTokens(array $normalized): bool
    {
        foreach ($normalized as $value) {
            if ($value !== '' && (is_numeric($value) || preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) || preg_match('/^\d+[-\/]\d+[-\/]\d+$/', $value))) {
                return false;
            }
        }

        return true;
    }

    protected function sequentialMap(int $count): array
    {
        $order = ['name', 'phone', 'email', 'source', 'status', 'budget', 'preferred_location', 'requirements', 'score', 'next_followup'];

        $map = [];
        foreach (range(0, $count - 1) as $i) {
            $map[$order[$i] ?? "extra_{$i}"] = $i;
        }

        return $map;
    }

    protected function mapRow(array $row, array $headerMap): array
    {
        if (isset($headerMap['name']) || isset($headerMap['phone'])) {
            $assoc = [];
            foreach ($headerMap as $field => $index) {
                $assoc[$field] = $row[$index] ?? '';
            }

            return $assoc;
        }

        return $row;
    }

    protected function normalize(string $value, array $allowed, string $default): string
    {
        if ($value === '') {
            return $default;
        }

        foreach ($allowed as $candidate) {
            if (strcasecmp($candidate, $value) === 0) {
                return $candidate;
            }
        }

        return $default;
    }

    protected function duplicateExists(string $name, string $phone): bool
    {
        return Lead::where('phone', $phone)
            ->orWhere(function ($q) use ($name, $phone) {
                $q->where('name', $name)->where('phone', $phone);
            })
            ->exists();
    }

    protected function resolveReferences(string $property, string $agent): array
    {
        $propertyId = null;
        if ($property !== '') {
            $propertyId = (int) $property ?: Property::where('title', 'like', '%'.$property.'%')->first()?->id;
        }

        $agentId = null;
        if ($agent !== '') {
            $agentId = (int) $agent ?: User::where('name', $agent)->first()?->id;
        }

        return [$propertyId, $agentId];
    }
}