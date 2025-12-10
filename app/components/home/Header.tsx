"use client";
import { useState } from "react";
import Link from "next/link";
import { Calendar, Search, X } from "lucide-react";
import { UI_PATHS } from "@/lib/routes";
import HeaderSearch from "@/app/components/search/HeaderSearch";

export default function Header() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <div
                            className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-primary-foreground"/>
                        </div>
                        <span className="text-xl font-bold text-foreground">InMyTime</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 ml-8">
                        <a href="#features"
                           className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                            Features
                        </a>
                        <a href="#how-it-works"
                           className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                            How it Works
                        </a>
                    </div>


                    <div className="flex items-center gap-4 sm:gap-8">
                        <div className="hidden lg:block">
                            <HeaderSearch/>
                        </div>

                        <Link
                            href={UI_PATHS.CREATE_POLL}
                            className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
                        >
                            Create Poll
                        </Link>

                        <button
                            className="lg:hidden p-2 text-foreground/60 hover:text-foreground transition-colors"
                            onClick={() => setIsSearchOpen(true)}
                        >
                            <Search className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            </div>

            {isSearchOpen && (
                <div className="fixed inset-0 top-0 z-[60] bg-background lg:hidden p-4">
                    <div className="flex items-center justify-between h-16 max-w-7xl mx-auto">
                        <HeaderSearch />

                        <button
                            className="p-2 ml-4 text-foreground/60 hover:text-foreground transition-colors shrink-0"
                            onClick={() => setIsSearchOpen(false)}
                        >
                            <X className="w-6 h-6"/>
                        </button>
                    </div>
                    <div className="pt-4 text-sm text-foreground/70">
                        Enter the poll ID into the search field and press <strong>Enter</strong>.
                    </div>
                </div>
            )}
        </nav>
    );
}