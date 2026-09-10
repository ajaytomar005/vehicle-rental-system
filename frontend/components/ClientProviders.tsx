'use client'

import type { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import Navbar from './Navbar'
import Footer from './Footer'

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <div className="grain flex min-h-screen flex-col">
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#161d27', color: '#f2f5f8', border: '1px solid rgba(255,255,255,0.08)' },
        }}
      />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
