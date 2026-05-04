import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Toaster } from '@/components/ui/sonner'
import { GlobalLoader } from '@/components/ui/GlobalLoader'
import { AuthLoader } from '@/components/ui/AuthLoader'
import { RouteProgress } from '@/components/ui/RouteProgress'
import { LanguageProvider } from '@/components/providers/LanguageProvider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'ApplyFlow — Apply Smarter. Get Hired Faster.',
  description: 'Automate job applications, autofill forms, and track your progress with ApplyFlow. The smartest way to land your dream job.',
  icons: {
    icon: '/logo 2.png',
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
          <LanguageProvider>
            <AuthProvider>
              <RouteProgress />
              <AuthLoader />
              <GlobalLoader />
              <div className="opacity-100 transition-opacity duration-200">
                {children}
              </div>
              <Toaster />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
