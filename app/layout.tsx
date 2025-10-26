import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Birthday Wishing App',
  description: 'Company birthday management and automated wishes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
