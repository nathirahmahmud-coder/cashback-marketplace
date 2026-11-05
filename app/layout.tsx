import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cashback Marketplace',
  description: 'Explore participating merchants, compare cashback rates and review eligible purchases.',
  applicationName: 'Cashback Marketplace',
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
