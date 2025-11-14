import Link from "next/link";
import { Calendar } from "lucide-react";

export default function Header() {
    return (
        <nav className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold text-foreground">InMyTime</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                            Features
                        </a>
                        <a href="#how-it-works" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                            How it Works
                        </a>
                    </div>
                    <Link
                        href="/create-poll"
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        Create Poll
                    </Link>
                </div>
            </div>
        </nav>
    );
}