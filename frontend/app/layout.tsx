import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import FeedbackButton from '@/components/feedback/FeedbackButton'
import { Toaster } from '@/components/ui/sonner'
import { GlobalLoader } from '@/components/ui/GlobalLoader'
import { AuthLoader } from '@/components/ui/AuthLoader'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'ApplyFlow — Apply Smarter. Get Hired Faster.',
  description: 'Automate job applications, autofill forms, and track your progress with ApplyFlow. The smartest way to land your dream job.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <AuthLoader />
            <GlobalLoader />
            <div className="opacity-100 transition-opacity duration-200">
              {children}
            </div>
            <FeedbackButton />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
