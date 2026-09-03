import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';
import Providers from './providers';

// `next/font` generates its own family name, so the CSS has to point at the
// variable it hands back. The old code assigned both fonts to unused variables
// and never applied a className — the browser fell back to its default the
// whole time.
const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://inmytime.me';

export const metadata: Metadata = {
    // Without this, every relative OG image URL resolves against localhost.
    metadataBase: new URL(SITE_URL),
    title: {
        default: 'InMyTime — find a time that works for everyone',
        template: '%s · InMyTime',
    },
    description:
        'Easily discover the best common time for meetings and events. No signup needed—instant scheduling polls. Find a convenient time using our date and time selector.',
    keywords: [
        'InMyTime', 'In my time', 'In-My-Time',

        'time scheduling', 'schedule meeting', 'find common time', 'availability poll', 'doodle alternative',
        'date selector', 'time slot finder', 'meeting planner', 'group scheduling', 'best time to meet',
        'online scheduling tool', 'calendar coordination', 'event time selector', 'when to meet',

        'vaxt cədvəli', 'görüş cədvəli', 'ümumi vaxt tap', 'vaxt planlaması', 'görüş vaxtı',
        'tarix seçimi', 'zaman seçimi', 'görüş təyin etmək', 'ən yaxşı vaxtı tapmaq', 'qrup görüşü',

        'zaman planlama', 'toplantı takvimi', 'ortak zaman bulma', 'uygunluk anketi', 'zaman çizelgeleme',
        'tarih seçici', 'saat dilimi bulucu', 'randevu ayarlama', 'etkinlik zamanı seçme', 'grup toplantısı',

        'планирование времени', 'назначение встреч', 'найти общее время', 'опрос доступности',
        'выбор даты', 'подбор времени', 'планировщик встреч', 'координация расписания', 'когда встретиться',

        'planification du temps', 'calendrier de réunion', 'trouver un temps commun', 'sondage de disponibilité',
        'sélecteur de date', 'trouver le créneau horaire', 'planificateur de réunion', 'coordination d\'agenda', 'meilleur moment pour se réunir',
    ],
    icons: {
        icon: [{ url: '/logo.png', type: 'image/png' }],
        apple: '/apple-icon.png',
    },
    openGraph: {
        type: 'website',
        siteName: 'InMyTime',
        url: SITE_URL,
    },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        // next-themes writes the class before paint; without this React warns
        // that the server markup and the client's do not agree.
        <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
            <body className="font-sans antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
