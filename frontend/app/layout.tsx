import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import ClientProviders from '../components/ClientProviders'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ZoomWheels — Rent cars, bikes & scooters',
  description:
    'Rent cars, bikes and scooters by the hour, day or week. Search, book and go.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
