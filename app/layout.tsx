import type React from "react"
import type {Metadata} from "next"
import "./globals.css"
import { Geist, Geist_Mono } from "next/font/google"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })


export const metadata: Metadata = {
    title: "InMyTime - Find Common Availability",
    description:
        "Easily discover the best common time for meetings and events. No signup needed—instant scheduling polls.",
    icons: {
        icon: [
            {
                url: "/icon-light-32x32.png",
                media: "(prefers-color-scheme: light)",
            },

            {
                url: "/icon-dark-32x32.png",
                media: "(prefers-color-scheme: dark)",
            },
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