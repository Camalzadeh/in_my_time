'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Calendar, Menu, Search, X } from 'lucide-react';

import { UI_PATHS } from '@/lib/routes';
import HeaderSearch from '@/app/components/search/HeaderSearch';
import ThemeToggle from '@/app/components/ThemeToggle';

const LINKS = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How it works' },
];

export default function Header() {
    // Only one panel is open at a time; on a phone both would fill the screen.
    const [panel, setPanel] = useState<'search' | 'menu' | null>(null);
    const closeRef = useRef<HTMLButtonElement>(null);

    // The panels used to have no way out but the close button — no Escape, and
    // nothing moved focus into or out of them.
    useEffect(() => {
        if (!panel) return;

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setPanel(null);
        };

        document.addEventListener('keydown', onKey);
        closeRef.current?.focus();

        return () => document.removeEventListener('keydown', onKey);
    }, [panel]);

    return (
        <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-4">
                    <Link
                        href="/"
                        className="flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                            <Calendar className="h-5 w-5 text-primary-foreground" aria-hidden />
                        </span>
                        <span className="text-lg font-bold text-foreground">InMyTime</span>
                    </Link>

                    <div className="hidden items-center gap-6 md:flex">
                        {LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="rounded px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden w-64 lg:block">
                            <HeaderSearch />
                        </div>

                        <button
                            type="button"
                            onClick={() => setPanel('search')}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <Search className="h-4 w-4" aria-hidden />
                            <span className="sr-only">Open a poll by ID</span>
                        </button>

                        <ThemeToggle />

                        <Link
                            href={UI_PATHS.CREATE_POLL}
                            className="hidden h-9 shrink-0 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                            Create poll
                        </Link>

                        {/* The section links were simply unreachable below md. */}
                        <button
                            type="button"
                            onClick={() => setPanel('menu')}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <Menu className="h-4 w-4" aria-hidden />
                            <span className="sr-only">Open menu</span>
                        </button>
                    </div>
                </div>
            </div>

            {panel && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={panel === 'search' ? 'Open a poll by ID' : 'Menu'}
                    className="fixed inset-0 z-[60] bg-background p-4"
                >
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-foreground">
                            {panel === 'search' ? 'Open a poll' : 'Menu'}
                        </span>
                        <button
                            ref={closeRef}
                            type="button"
                            onClick={() => setPanel(null)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <X className="h-5 w-5" aria-hidden />
                            <span className="sr-only">Close</span>
                        </button>
                    </div>

                    <div className="mx-auto mt-6 max-w-md">
                        {panel === 'search' ? (
                            <>
                                <HeaderSearch autoFocus onDone={() => setPanel(null)} />
                                <p className="mt-3 text-sm text-muted-foreground">
                                    Paste the ID from a poll link — the part after{' '}
                                    <code className="rounded bg-muted px-1 py-0.5 text-xs">/polls/</code>.
                                </p>
                            </>
                        ) : (
                            <div className="flex flex-col gap-1">
                                {LINKS.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setPanel(null)}
                                        className="rounded-xl px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        {link.label}
                                    </a>
                                ))}

                                <Link
                                    href={UI_PATHS.CREATE_POLL}
                                    onClick={() => setPanel(null)}
                                    className="mt-3 inline-flex h-12 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                >
                                    Create poll
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
