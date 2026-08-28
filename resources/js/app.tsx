import '../css/app.css';

import type React from 'react';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import type { PageProps } from '@/types';

createInertiaApp({
    title: (title) => (title ? `${title} | QREX` : 'QREX'),
    resolve: ((name: string) =>
        resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx'))) as unknown as (name: string) => React.ComponentType<PageProps> | { default: React.ComponentType<PageProps> },
    setup({ el, App, props }) {
        createRoot(el as unknown as HTMLElement).render(<App {...props} />);
    },
    progress: {
        color: '#c9963a',
    },
});
