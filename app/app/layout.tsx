
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'
import { MobileNav } from '@/components/layout/mobile-nav'
import { MobileOnlyGuard } from '@/components/layout/mobile-only-guard'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Mood Buddy - Mental Health Support for Teens',
  description: 'A safe space for teenagers to track their mental health, take assessments, and get support.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mood Buddy',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
  viewportFit: 'cover'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mood Buddy" />
        <meta name="application-name" content="Mood Buddy" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={`${inter.className} touch-manipulation overscroll-none`} suppressHydrationWarning>
        <Providers>
          <MobileOnlyGuard>
            <div className="min-h-screen pb-16 md:pb-0">
              {children}
            </div>
            <MobileNav />
            <Toaster />
          </MobileOnlyGuard>
        </Providers>
      </body>
    </html>
  )
}
