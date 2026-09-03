'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

// `next-themes` was already a dependency and globals.css already carried a full
// dark palette, but nothing ever mounted the provider — so the dark tokens were
// dead weight and the site was light-only.

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Toaster position="bottom-center" richColors closeButton />
        </ThemeProvider>
    );
}
