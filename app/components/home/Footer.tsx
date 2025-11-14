import { Calendar } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-border bg-card/30 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="font-semibold text-foreground">InMyTime</span>
                    </div>
                    <p className="text-sm text-foreground/60">© 2025 InMyTime. Making scheduling simple for everyone.</p>
                </div>
            </div>
        </footer>
    );
}