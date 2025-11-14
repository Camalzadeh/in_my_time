"use client"

import { useState } from "react"
import { ArrowRight, Calendar, Users, Zap, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Navigation */}
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

      {/* Hero Section */}
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

      {/* Features Section */}
      <section id="features" className="relative py-20 md:py-32 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Why teams love InMyTime</h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Everything you need to coordinate schedules effortlessly
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
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
            ].map((feature, i) => (
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

      {/* How It Works */}
      <section id="how-it-works" className="relative py-20 md:py-32 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">How it works</h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">Three simple steps to perfect scheduling</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
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
            ].map((step, i) => (
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

      {/* CTA Section */}
      <section className="relative py-20 md:py-32 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Ready to stop scheduling chaos?
          </h2>
          <p className="text-lg text-foreground/60 mb-8 max-w-2xl mx-auto">
            Create your first poll now and see how easy it is to find the perfect time for everyone.
          </p>
          <Link
            href="/create-poll"
            className="inline-flex bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold hover:bg-primary/90 transition-all transform hover:scale-105 gap-2 items-center"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
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
    </main>
  )
}
