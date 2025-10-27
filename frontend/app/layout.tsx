import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DataSense AI - Transform Data with Natural Language',
  description: 'AI-powered data analytics platform that converts natural language queries into SQL and delivers instant insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{__html: `
          @supports not (backdrop-filter: blur(10px)) {
            .backdrop-blur-xl { background: rgba(255, 255, 255, 0.95) !important; }
            .backdrop-blur-sm { background: rgba(255, 255, 255, 0.98) !important; }
          }
        `}} />
      </head>
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  )
}