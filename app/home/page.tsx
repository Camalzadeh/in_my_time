import { redirect } from 'next/navigation';

// /home used to render a second copy of the landing page. Two URLs serving
// identical content splits any inbound links and gives search engines a
// duplicate to pick between, so it redirects to the canonical one.
export default function HomePage() {
    redirect('/');
}
