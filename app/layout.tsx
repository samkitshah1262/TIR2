import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Real-time Speech Translator',
    description: 'A real-time speech translation tool for multilingual communication',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <main className="min-h-screen bg-gray-50">
                    {children}
                </main>
            </body>
        </html>
    )
} 