'use client';
import { getQueryClient } from '@/app/get-query-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
    // const [queryClient] = useState(() => new QueryClient({
    //     defaultOptions: {
    //         queries: {
    //             staleTime: 5 * 60 * 1000, // 5 minutes
    //             refetchOnWindowFocus: true,     // default: true
    //             refetchOnReconnect: true,       // default: true
    //             refetchOnMount: true,           // revalidate on remount
    //         },
    //     },
    // }));
    const queryClient = getQueryClient();

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
