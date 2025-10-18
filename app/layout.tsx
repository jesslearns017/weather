import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import RegisterSW from '@/components/RegisterSW'
import { LanguageProvider } from '@/context/LanguageContext'
import { FavoritesProvider } from '@/context/FavoritesContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Weather Dashboard',
  description: 'A modern weather dashboard showing current conditions and 5-day forecast',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a2a6b" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script dangerouslySetInnerHTML={{
          __html: `
            // Prevent fbq errors from browser extensions
            window.fbq = window.fbq || function() {};
          `
        }} />
      </head>
      <body className={inter.className}>
        <LanguageProvider>
          <FavoritesProvider>
            <RegisterSW />
            {children}
          </FavoritesProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
