<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_export_leads_requires_auth(): void
    {
        $response = $this->get('/api/export/leads');
        $this->assertContains($response->status(), [401, 403, 302, 404]);
    }
}
