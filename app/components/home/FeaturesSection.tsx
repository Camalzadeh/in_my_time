"use client"

import { useState } from "react";
import { Users, Zap, Clock } from "lucide-react";

const features = [
    {
        icon: Zap,
        title: "Lightning Fast",
        description:
            "Create a poll and share instantly. No account, no hassle—just pure scheduling efficiency.",
    },
    {
        icon: Users,
        title: "Built for Teams",
        description: "Perfect for meetings, team events, or casual hangouts. See who can make it at a glance.",
    },
    {
        icon: Clock,
        title: "Smart Time Detection",
        description: "Automatic highlighting of the most popular time slots so decisions are effortless.",
    },
];

export default function FeaturesSection() {
    const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

    return (
        <section id="features" className="relative py-20 md:py-32 border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground">Why teams love InMyTime</h2>
                    <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
                        Everything you need to coordinate schedules effortlessly
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            onMouseEnter={() => setHoveredFeature(i)}
                            onMouseLeave={() => setHoveredFeature(null)}
                            className={`group relative p-8 rounded-xl border transition-all duration-300 cursor-pointer ${
                                hoveredFeature === i
                                    ? "border-primary bg-card shadow-lg shadow-primary/10 scale-105"
                                    : "border-border bg-card/50"
                            }`}
                        >
                            <div
                                className={`inline-flex p-3 rounded-lg mb-4 transition-all ${
                                    hoveredFeature === i ? "bg-primary text-primary-foreground" : "bg-accent/10 text-accent"
                                }`}
                            >
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                            <p className="text-foreground/60">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}