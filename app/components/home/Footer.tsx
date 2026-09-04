import Image from 'next/image';
import Link from 'next/link';

import { UI_PATHS } from '@/lib/routes';

export default function Footer() {
    // Was hardcoded to 2025 and already wrong.
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-card/30 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-5 text-center md:flex-row md:justify-between md:text-left">
                    <Link
                        href="/"
                        className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <Image
                            src="/branding.png"
                            alt="InMyTime"
                            width={600}
                            height={200}
                            className="h-5 w-auto"
                        />
                    </Link>

                    <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                        <Link
                            href={UI_PATHS.CREATE_POLL}
                            className="rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            Create a poll
                        </Link>
                        <Link
                            href="/#how-it-works"
                            className="rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            How it works
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
