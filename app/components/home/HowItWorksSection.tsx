import { ArrowRight } from "lucide-react";

const steps = [
    {
        number: "01",
        title: "Create",
        description: "Choose your event and propose multiple date/time options",
    },
    {
        number: "02",
        title: "Share",
        description: "Send the unique link to your team or friends instantly",
    },
    {
        number: "03",
        title: "Decide",
        description: "See results in real-time and book the best time for everyone",
    },
];

export default function HowItWorksSection() {
    return (
        <section id="how-it-works" className="relative py-20 md:py-32 bg-card/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground">How it works</h2>
                    <p className="text-lg text-foreground/60 max-w-2xl mx-auto">Three simple steps to perfect scheduling</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step, i) => (
                        <div key={i} className="relative">
                            <div className="absolute -top-8 left-0 text-6xl font-bold text-primary/10">{step.number}</div>
                            <div className="relative pt-8">
                                <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-8 h-full">
                                    <h3 className="text-2xl font-bold text-foreground mb-3">{step.title}</h3>
                                    <p className="text-foreground/70">{step.description}</p>
                                </div>
                                {i < 2 && (
                                    <div className="hidden md:flex absolute -right-4 top-1/2 transform -translate-y-1/2">
                                        <ArrowRight className="w-8 h-8 text-primary/40" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}