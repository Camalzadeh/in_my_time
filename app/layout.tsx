import type React from "react"
import type {Metadata} from "next"
import "./globals.css"
import { Geist, Geist_Mono } from "next/font/google"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })


export const metadata: Metadata = {
    title: "InMyTime",
    description:
        "Easily discover the best common time for meetings and events. No signup needed—instant scheduling polls. Find a convenient time using our date and time selector.",

    keywords: [
        "InMyTime", "In my time", "In-My-Time",

        "time scheduling", "schedule meeting", "find common time", "availability poll", "doodle alternative",
        "date selector", "time slot finder", "meeting planner", "group scheduling", "best time to meet",
        "online scheduling tool", "calendar coordination", "event time selector", "when to meet",

        "vaxt cədvəli", "görüş cədvəli", "ümumi vaxt tap", "vaxt planlaması", "görüş vaxtı",
        "tarix seçimi", "zaman seçimi", "görüş təyin etmək", "ən yaxşı vaxtı tapmaq", "qrup görüşü",

        "zaman planlama", "toplantı takvimi", "ortak zaman bulma", "uygunluk anketi", "zaman çizelgeleme",
        "tarih seçici", "saat dilimi bulucu", "randevu ayarlama", "etkinlik zamanı seçme", "grup toplantısı",

        "планирование времени", "назначение встреч", "найти общее время", "опрос доступности",
        "выбор даты", "подбор времени", "планировщик встреч", "координация расписания", "когда встретиться",

        "planification du temps", "calendrier de réunion", "trouver un temps commun", "sondage de disponibilité",
        "sélecteur de date", "trouver le créneau horaire", "planificateur de réunion", "coordination d'agenda", "meilleur moment pour se réunir",

    ].join(', '),
    icons: {
        icon: [
            {
                url: "/logo.png",
                type: "image/png",
            },
        ],
        apple: "/apple-icon.png",
    },
}

export default function RootLayout({children,}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
        <body className={`font-sans antialiased`}>
        {children}
        </body>
        </html>
    )
}