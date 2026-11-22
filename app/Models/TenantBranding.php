<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantBranding extends Model
{
    use HasFactory, BelongsToTenant;

    protected $table = 'tenant_branding';

    protected $fillable = [
        'tenant_id', 'app_name', 'logo_light', 'logo_dark', 'favicon',
        'primary_color', 'secondary_color', 'accent_color', 'font_family',
        'custom_css', 'login_background', 'sidebar_style', 'hide_powered_by',
        'custom_footer', 'meta',
    ];

    protected $casts = [
        'hide_powered_by' => 'boolean',
        'meta' => 'array',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
