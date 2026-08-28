import { usePage as useInertiaPage } from '@inertiajs/react';
import type { PageProps } from '@/types';

export function usePage(): PageProps {
    return useInertiaPage().props as unknown as PageProps;
}
