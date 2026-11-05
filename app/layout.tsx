import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Perks | Digital Wallet & Cashback',
  description: 'A vibrant digital wallet and cashback marketplace demo for partner presentations.',
  applicationName: 'Perks Wallet Demo',
  icons: { icon: '/icon.svg' },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#3457E8',
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
