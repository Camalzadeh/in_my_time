import Link from 'next/link';
import { Calendar } from 'lucide-react';

import { UI_PATHS } from '@/lib/routes';

export default function Footer() {
    // Was hardcoded to 2025 and already wrong.
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-card/30 py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    <Link
                        href="/"
                        className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent">
                            <Calendar className="h-3.5 w-3.5 text-primary-foreground" aria-hidden />
                        </span>
                        <span className="font-semibold text-foreground">InMyTime</span>
                    </Link>

                    <nav className="flex gap-6 text-sm">
                        <Link
                            href={UI_PATHS.CREATE_POLL}
                            className="rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            Create a poll
                        </Link>
                        <a
                            href="https://github.com/Camalzadeh/in_my_time"
                            target="_blank"
                            rel="noreferrer noopener"
                            className="rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            Source
                        </a>
                    </nav>

                    <p className="text-sm text-muted-foreground">© {year} InMyTime</p>
                </div>
            </div>
        </footer>
    );
}
