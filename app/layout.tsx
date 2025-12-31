import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Amazon Image Fetcher API',
  description: 'Use this API to fetch product images from Amazon URLs programmatically.',
  generator: '',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
