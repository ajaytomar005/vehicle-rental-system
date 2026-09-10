'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { CalendarX2 } from 'lucide-react'
import { api } from '../../lib/api'
import type { Booking, Page } from '../../types'
import Loader from '../../components/Loader'
import StatusPill from '../../components/StatusPill'
import ProtectedRoute from '../../components/ProtectedRoute'

function BookingsList() {
  const [data, setData] = useState<Page<Booking> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Page<Booking>>('/bookings/me', { params: { size: 20 } }).then((res) => setData(res.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader label="Loading your bookings" />

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-8">
      <h1 className="text-3xl font-bold tracking-tight">My bookings</h1>

      {!data || data.content.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-white/40">
          <CalendarX2 size={32} />
          <p>No bookings yet.</p>
          <Link href="/browse" className="text-sm font-medium text-ember-300 hover:text-ember-200">
            Browse vehicles →
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {data.content.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link href={`/bookings/${b.id}`} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-ink-800/40 p-4 transition hover:border-white/20">
                <div className="relative h-16 w-20 overflow-hidden rounded-xl">
                  <Image
                    src={b.vehicleImageUrl ?? 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=200'}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{b.vehicleName}</p>
                    <StatusPill status={b.status} />
                  </div>
                  <p className="mt-1 text-xs text-white/40">
                    {new Date(b.startAt).toLocaleString()} → {new Date(b.endAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-white/40">Ref {b.bookingReference}</p>
                </div>
                <p className="text-lg font-bold text-white">₹{b.totalAmount.toLocaleString('en-IN')}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function BookingsPage() {
  return (
    <ProtectedRoute>
      <BookingsList />
    </ProtectedRoute>
  )
}
