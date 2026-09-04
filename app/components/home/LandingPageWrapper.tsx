import SiteHeader from '@/app/components/SiteHeader';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import HowItWorksSection from './HowItWorksSection';
import CtaSection from './CtaSection';
import Footer from './Footer';

export default function LandingPageWrapper() {
    return (
        <>
            <SiteHeader showSections />
            <main
                id="main"
                className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5"
            >
                <HeroSection />
                <FeaturesSection />
                <HowItWorksSection />
                <CtaSection />
            </main>
            <Footer />
        </>
    );
}
