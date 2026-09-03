import { ArrowRight } from 'lucide-react';

const steps = [
    {
        title: 'Create',
        description: 'Pick the days and the hours you want to offer. Takes about a minute.',
    },
    {
        title: 'Share',
        description: 'Send the link. Everyone marks what suits them — no account needed.',
    },
    {
        title: 'Decide',
        description: 'The grid fills in as votes arrive. Close the poll on the time that wins.',
    },
] as const;

export default function HowItWorksSection() {
    return (
        <section id="how-it-works" className="border-t border-border bg-card/30 py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                        How it works
                    </h2>
                    <p className="mt-3 text-lg text-muted-foreground">Three steps, no accounts.</p>
                </div>

                <ol className="mt-14 grid gap-6 md:grid-cols-3">
                    {steps.map((step, index) => (
                        <li key={step.title} className="relative">
                            <div className="h-full rounded-2xl border border-border bg-card p-6">
                                <span
                                    className="text-sm font-bold tabular-nums text-primary"
                                    aria-hidden
                                >
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <h3 className="mt-2 text-xl font-bold text-foreground">{step.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {step.description}
                                </p>
                            </div>

                            {/* Derived from the list rather than a hardcoded `i < 2`. */}
                            {index < steps.length - 1 && (
                                <ArrowRight
                                    className="absolute -right-5 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-border md:block"
                                    aria-hidden
                                />
                            )}
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
