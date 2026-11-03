<?php

return [
    'mode' => env('QREX_MODE', 'license'),
    'multi_tenant' => env('QREX_MULTI_TENANT', false),
    'white_label' => env('QREX_WHITE_LABEL', true),
    'api_version' => 'v1',
    
    'whatsapp' => [
        'provider' => env('WHATSAPP_PROVIDER', 'meta_cloud'),
        'enabled' => env('WHATSAPP_ENABLED', false),
    ],
    
    'maps' => [
        'default_provider' => env('MAPS_PROVIDER', 'google'),
    ],
    
    'notifications' => [
        'fcm_enabled' => env('FCM_ENABLED', false),
    ],
];
