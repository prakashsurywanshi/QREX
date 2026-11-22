<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsApiController extends ApiController
{
    private const ALLOWED_KEYS = [
        'project_name','agency_name','tagline','contact_email','contact_phone','address','currency','timezone','date_format',
        'primary_color','accent_color','social_facebook','social_instagram','social_linkedin','social_twitter','office_hours',
        'footer_about','seo_title','seo_description','analytics_code','enable_contact_form','maintenance_mode','two_factor',
        'lead_auto_assign','visit_reminders','payment_alerts','low_inventory_alert',
    ];

    public function index()
    {
        $settings = Setting::pluck('value', 'key');
        return ApiResponse::success($settings);
    }

    public function update(Request $request)
    {
        $data = $request->only(self::ALLOWED_KEYS);
        foreach ($data as $key => $value) {
            if ($value === null) continue;
            Setting::updateOrCreate(['key' => $key], ['value' => is_array($value) ? json_encode($value) : $value]);
        }
        return ApiResponse::success(null, 'Settings updated');
    }
}
