<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExportTest extends TestCase
{
    public function test_export_leads_requires_auth(): void
    {
        $response = $this->getJson('/api/export/leads');
        $this->assertContains($response->status(), [401, 403]);
    }
}
