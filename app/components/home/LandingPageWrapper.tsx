import Header from "./Header";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import HowItWorksSection from "./HowItWorksSection";
import CtaSection from "./CtaSection";
import Footer from "./Footer";

export default function LandingPageWrapper() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
            <Header />
            <HeroSection />
            <FeaturesSection />
            <HowItWorksSection />
            <CtaSection />
            <Footer />
        </main>
    );
}