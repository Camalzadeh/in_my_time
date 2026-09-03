import LandingPageWrapper from '@/app/components/home/LandingPageWrapper';

// A server component: the landing page is static marketing copy, and marking it
// "use client" shipped the whole thing to the browser as JavaScript for no
// reason. The two pieces that need interactivity — the header search and the
// feature tabs — carry their own "use client".
export default function Home() {
    return <LandingPageWrapper />;
}
