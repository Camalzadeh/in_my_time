'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LayoutGrid, Menu, Plus, Search, X } from 'lucide-react';

import { UI_PATHS } from '@/lib/routes';
import { useHasPolls } from '@/lib/hooks/use-has-polls';
import HeaderSearch from '@/app/components/search/HeaderSearch';
import ThemeToggle from '@/app/components/ThemeToggle';

// One header for every page.
//
// It used to exist only on the landing page, so from a poll or the create form
// the only way anywhere was a bare "Home" link — no search, no way to start
// another poll, no theme control.
//
// The create button is visible at every width. It was hidden below 640px,
// which on a phone left the primary action of the whole site behind a hamburger.
//
// "My polls" appears once this browser has something to show there. Offering it
// to a first-time visitor would lead to a page listing nothing, and hiding it
// from everyone leaves the only index of your own polls unreachable unless you
// happen to type /home.

const SECTIONS = [
    { href: '/#features', label: 'Features' },
    { href: '/#how-it-works', label: 'How it works' },
];

export default function SiteHeader({ showSections = false }: { showSections?: boolean }) {
    const [panel, setPanel] = useState<'search' | 'menu' | null>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const hasPolls = useHasPolls();

    useEffect(() => {
        if (!panel) return;

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setPanel(null);
        };

        document.addEventListener('keydown', onKey);
        closeRef.current?.focus();

        // A full-screen panel behind which the page can still scroll feels broken.
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [panel]);

    // The menu holds whatever does not fit on a phone. With neither section
    // links nor a poll list there is nothing in it, so it is not rendered.
    const hasMenu = showSections || hasPolls;

    return (
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6 lg:px-8">
                <Link
                    href="/"
                    className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <Image
                        src="/branding.png"
                        alt="InMyTime"
                        width={600}
                        height={200}
                        priority
                        className="h-6 w-auto sm:h-7"
                    />
                </Link>

                <nav className="ml-4 hidden items-center gap-5 md:flex">
                    {showSections &&
                        SECTIONS.map((section) => (
                            <Link
                                key={section.href}
                                href={section.href}
                                className="rounded px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {section.label}
                            </Link>
                        ))}

                    {hasPolls && (
                        <Link
                            href={UI_PATHS.HOME}
                            className="inline-flex items-center gap-1.5 rounded px-1 py-0.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <LayoutGrid className="h-4 w-4" aria-hidden />
                            My polls
                        </Link>
                    )}
                </nav>

                <div className="ml-auto flex items-center gap-1 sm:gap-2">
                    <div className="hidden w-56 lg:block xl:w-64">
                        <HeaderSearch />
                    </div>

                    <IconButton
                        label="Open a poll by ID"
                        onClick={() => setPanel('search')}
                        className="lg:hidden"
                    >
                        <Search className="h-[18px] w-[18px]" aria-hidden />
                    </IconButton>

                    <ThemeToggle />

                    {/* Full label where there is room, icon plus a short one where there is not. */}
                    <Link
                        href={UI_PATHS.CREATE_POLL}
                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:px-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                        <Plus className="h-4 w-4 sm:hidden" aria-hidden />
                        <span className="hidden sm:inline">Create poll</span>
                        <span className="sm:hidden">New</span>
                    </Link>

                    {hasMenu && (
                        <IconButton
                            label="Open menu"
                            onClick={() => setPanel('menu')}
                            className="md:hidden"
                        >
                            <Menu className="h-[18px] w-[18px]" aria-hidden />
                        </IconButton>
                    )}
                </div>
            </div>

            {panel && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={panel === 'search' ? 'Open a poll by ID' : 'Menu'}
                    className="fixed inset-0 z-[60] overflow-y-auto bg-background p-4"
                >
                    <div className="mx-auto flex max-w-md items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-foreground">
                            {panel === 'search' ? 'Open a poll' : 'Menu'}
                        </span>
                        <IconButton label="Close" onClick={() => setPanel(null)} ref={closeRef}>
                            <X className="h-5 w-5" aria-hidden />
                        </IconButton>
                    </div>

                    <div className="mx-auto mt-6 max-w-md pb-8">
                        {panel === 'search' ? (
                            <>
                                <HeaderSearch autoFocus onDone={() => setPanel(null)} />
                                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                    Paste the ID from a poll link — the part after{' '}
                                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                                        /polls/
                                    </code>
                                    .
                                </p>
                            </>
                        ) : (
                            <nav className="flex flex-col gap-1">
                                {hasPolls && (
                                    <Link
                                        href={UI_PATHS.HOME}
                                        onClick={() => setPanel(null)}
                                        className="inline-flex items-center gap-2.5 rounded-xl px-4 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <LayoutGrid className="h-4 w-4" aria-hidden />
                                        My polls
                                    </Link>
                                )}

                                {showSections &&
                                    SECTIONS.map((section) => (
                                        <Link
                                            key={section.href}
                                            href={section.href}
                                            onClick={() => setPanel(null)}
                                            className="rounded-xl px-4 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            {section.label}
                                        </Link>
                                    ))}
                            </nav>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

// 36px square: comfortably above the 44px touch target once the surrounding
// gap is counted, and it keeps the bar from getting tall on a phone.
function IconButton({
    label,
    onClick,
    className = '',
    children,
    ref,
}: {
    label: string;
    onClick: () => void;
    className?: string;
    children: React.ReactNode;
    ref?: React.Ref<HTMLButtonElement>;
}) {
    return (
        <button
            ref={ref}
            type="button"
            onClick={onClick}
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
        >
            {children}
            <span className="sr-only">{label}</span>
        </button>
    );
}
