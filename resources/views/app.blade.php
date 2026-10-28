<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
        <title inertia>QREX</title>
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%230D1B3E'/%3E%3Ctext x='50' y='68' font-size='55' text-anchor='middle' fill='%23C9963A' font-family='Arial'%3E%26%26%3C/text%3E%3C/svg%3E">
        @isset($seo)
            <meta name="description" content="{{ $seo['description'] }}">
            <meta property="og:type" content="website">
            <meta property="og:site_name" content="{{ config('app.name') }}">
            <meta property="og:title" content="{{ $seo['title'] }}">
            <meta property="og:description" content="{{ $seo['description'] }}">
            <meta property="og:url" content="{{ $seo['url'] }}">
            @if($seo['image'] ?? null)
                <meta property="og:image" content="{{ $seo['image'] }}">
                <meta property="og:image:alt" content="{{ $seo['title'] }}">
            @endif
            <meta name="twitter:card" content="{{ ($seo['image'] ?? null) ? 'summary_large_image' : 'summary' }}">
            <meta name="twitter:title" content="{{ $seo['title'] }}">
            <meta name="twitter:description" content="{{ $seo['description'] }}">
            @if($seo['image'] ?? null)
                <meta name="twitter:image" content="{{ $seo['image'] }}">
            @endif
        @endisset
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="antialiased">
        @inertia
        <script>
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                    navigator.serviceWorker.getRegistrations().then(function (registrations) {
                        registrations.forEach(function (registration) {
                            registration.unregister();
                            if (registration.active && registration.active.state === 'activated') {
                                registration.active.postMessage({ type: 'SKIP_WAITING' });
                            }
                        });
                    });
                });
            }
        </script>
    </body>
</html>
