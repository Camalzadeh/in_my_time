'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';

// The dark palette has been sitting in globals.css since the start with no way
// to reach it. This cycles system → light → dark, so "follow my OS" stays
// available rather than being lost the moment someone touches the control.

const ORDER = ['system', 'light', 'dark'] as const;

const ICONS = {
    system: Monitor,
    light: Sun,
    dark: Moon,
} as const;

const LABELS = {
    system: 'Theme: match system',
    light: 'Theme: light',
    dark: 'Theme: dark',
} as const;

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // The server cannot know the stored preference, so render the button only
    // after mount rather than flashing the wrong icon.
    useEffect(() => setMounted(true), []);

    const current = (mounted && theme && theme in ICONS ? theme : 'system') as keyof typeof ICONS;
    const Icon = ICONS[current];

    return (
        <button
            type="button"
            onClick={() => setTheme(ORDER[(ORDER.indexOf(current) + 1) % ORDER.length])}
            aria-label={mounted ? LABELS[current] : 'Change theme'}
            title={mounted ? LABELS[current] : undefined}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
            {mounted ? <Icon className="h-4 w-4" aria-hidden /> : <span className="h-4 w-4" />}
        </button>
    );
}
