import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cashback Marketplace | Partner Demo',
  description: 'A white-label cashback shopping marketplace prototype for digital wallet and fintech partner presentations.',
  applicationName: 'White-Label Cashback Marketplace',
  icons: { icon: '/icon.svg' },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#FAF8F7',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-MY">
      <body className="antialiased">{children}</body>
    </html>
  )
}
