<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpireUnitHoldsCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_expired_holds_are_released(): void
    {
        $project = Project::create(['name'=>'P','slug'=>'p','status'=>'active']);
        $unit = Unit::create(['project_id'=>$project->id,'unit_no'=>'U1','status'=>'hold','hold_expires_at'=>now()->subHour()]);
        $this->artisan('qrex:expire-unit-holds')->assertExitCode(0);
        $this->assertSame('available', $unit->fresh()->status);
        $this->assertNull($unit->fresh()->hold_expires_at);
    }
}
