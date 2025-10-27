import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SQL Analytics - Prompt to Query',
  description: 'Natural language to SQL query generator with analytics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}