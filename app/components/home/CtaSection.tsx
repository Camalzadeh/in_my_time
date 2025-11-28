import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { UI_PATHS} from "@/lib/routes";


export default function CtaSection() {
    return (
        <section className="relative py-20 md:py-32 border-t border-border">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                    Ready to stop scheduling chaos?
                </h2>
                <p className="text-lg text-foreground/60 mb-8 max-w-2xl mx-auto">
                    Create your first poll now and see how easy it is to find the perfect time for everyone.
                </p>
                <Link
                    href={UI_PATHS.CREATE_POLL}
                    className="inline-flex bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold hover:bg-primary/90 transition-all transform hover:scale-105 gap-2 items-center"
                >
                    Get Started Now
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </section>
    );
}