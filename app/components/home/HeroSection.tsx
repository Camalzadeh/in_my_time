import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden py-20 md:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight text-balance">
                                Find the{" "}
                                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  perfect time
                </span>{" "}
                                together
                            </h1>
                            <p className="text-lg text-foreground/60 leading-relaxed max-w-lg">
                                Stop playing scheduling ping-pong. Easily discover common availability for your team, meetings, and
                                events in seconds.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link
                                href="/create-poll"
                                className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:bg-primary/90 transition-all transform hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto"
                            >
                                Create Your First Poll
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <a
                                href="#how-it-works"
                                className="border border-border bg-background/50 backdrop-blur text-foreground px-8 py-3 rounded-full font-medium hover:bg-background transition-all flex items-center justify-center gap-2"
                            >
                                Learn More
                            </a>
                        </div>
                        <div className="flex items-center gap-8 pt-8 text-sm text-foreground/60">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-accent" />
                                <span>No signup needed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-accent" />
                                <span>Instant results</span>
                            </div>
                        </div>
                    </div>
                    <div className="relative hidden md:block">
                        <div className="absolute inset-0 bg-gradient-to-t from-accent/20 to-transparent rounded-2xl blur-3xl" />
                        <div className="relative bg-card border border-border rounded-2xl p-8 shadow-xl">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-foreground">Available Times</h3>
                                    <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">5 votes</span>
                                </div>
                                <div className="space-y-3">
                                    {["Mon 2:00 PM", "Tue 10:00 AM", "Wed 3:00 PM", "Thu 1:00 PM"].map((time, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all"
                                                    style={{ width: `${80 - i * 15}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-foreground/70 w-20">{time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}