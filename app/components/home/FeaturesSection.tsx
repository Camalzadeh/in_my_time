import { Clock, Users, Zap } from 'lucide-react';

// No "use client" and no state: the highlight was driven by onMouseEnter into
// useState, which shipped the whole section to the browser to do what a
// `group-hover:` class does for free.

const features = [
    {
        icon: Zap,
        title: 'No sign-up',
        description:
            'Create a poll, send the link. Nobody needs an account — not you, not the people voting.',
    },
    {
        icon: Users,
        title: 'Everyone at once',
        description:
            'One column per day, one row per time. See who can make it without clicking through dates.',
    },
    {
        icon: Clock,
        title: 'Time zones handled',
        description:
            'Everyone reads the grid on their own clock. Pick what suits you; the person who made the poll sees it in theirs.',
    },
] as const;

export default function FeaturesSection() {
    return (
        <section id="features" className="border-t border-border py-14 md:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                        Built to answer one question
                    </h2>
                    <p className="mt-3 text-lg text-muted-foreground">
                        When can everybody actually meet?
                    </p>
                </div>

                <ul className="mt-14 grid gap-6 md:grid-cols-3">
                    {features.map((feature) => (
                        <li
                            key={feature.title}
                            className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
                        >
                            <span className="inline-flex rounded-xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                <feature.icon className="h-5 w-5" aria-hidden />
                            </span>

                            <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {feature.description}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
