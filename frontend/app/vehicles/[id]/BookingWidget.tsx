'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { CalendarClock } from 'lucide-react'
import { api, apiErrorMessage } from '../../../lib/api'
import { useAuthStore } from '../../../store/auth'
import type { QuoteResponse, Vehicle } from '../../../types'

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function BookingWidget({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter()
  const { user, hydrated } = useAuthStore()

  const now = new Date()
  const defaultStart = new Date(now.getTime() + 2 * 60 * 60 * 1000)
  const defaultEnd = new Date(defaultStart.getTime() + 24 * 60 * 60 * 1000)

  const [startAt, setStartAt] = useState(toLocalInputValue(defaultStart))
  const [endAt, setEndAt] = useState(toLocalInputValue(defaultEnd))
  const [quote, setQuote] = useState<QuoteResponse | null>(null)
  const [quoting, setQuoting] = useState(false)
  const [booking, setBooking] = useState(false)

  async function fetchQuote() {
    setQuoting(true)
    setQuote(null)
    try {
      const res = await api.post<QuoteResponse>('/bookings/quote', {
        vehicleId: vehicle.id,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
      })
      setQuote(res.data)
    } catch (e) {
      toast.error(apiErrorMessage(e))
    } finally {
      setQuoting(false)
    }
  }

  async function handleBook() {
    if (!user) {
      router.push('/login')
      return
    }
    setBooking(true)
    try {
      const res = await api.post('/bookings', {
        vehicleId: vehicle.id,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
      })
      toast.success('Booking created! Redirecting to payment…')
      router.push(`/bookings/${res.data.id}`)
    } catch (e) {
      toast.error(apiErrorMessage(e))
    } finally {
      setBooking(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass h-fit rounded-3xl p-6"
    >
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">₹{vehicle.pricing?.dailyRate.toLocaleString('en-IN')}</span>
        <span className="text-sm text-white/40">/ day</span>
      </div>
      <p className="mt-1 text-xs text-white/40">
        ₹{vehicle.pricing?.hourlyRate}/hr · ₹{vehicle.pricing?.weeklyRate.toLocaleString('en-IN')}/week
        · ₹{vehicle.pricing?.securityDeposit.toLocaleString('en-IN')} deposit
      </p>

      <div className="mt-5 space-y-3">
        <label className="block text-xs font-medium text-white/50">
          Pickup
          <div className="mt-1 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5">
            <CalendarClock size={15} className="text-white/40" />
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full bg-transparent text-sm text-white focus:outline-none [color-scheme:dark]"
            />
          </div>
        </label>
        <label className="block text-xs font-medium text-white/50">
          Return
          <div className="mt-1 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5">
            <CalendarClock size={15} className="text-white/40" />
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="w-full bg-transparent text-sm text-white focus:outline-none [color-scheme:dark]"
            />
          </div>
        </label>
      </div>

      <button
        onClick={fetchQuote}
        disabled={quoting}
        className="mt-4 w-full rounded-xl border border-white/15 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/30 disabled:opacity-50"
      >
        {quoting ? 'Checking…' : 'Check price & availability'}
      </button>

      {quote && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 overflow-hidden rounded-xl bg-white/5 p-4 text-sm"
        >
          {quote.available ? (
            <>
              <div className="flex justify-between text-white/60">
                <span>Rental ({quote.units} {quote.rateType.toLowerCase()})</span>
                <span>₹{quote.rentalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="mt-1 flex justify-between text-white/60">
                <span>Security deposit</span>
                <span>₹{quote.depositAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-white/10 pt-2 font-semibold text-white">
                <span>Total due</span>
                <span>₹{quote.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </>
          ) : (
            <p className="text-rose-300">Not available for these dates — try a different window.</p>
          )}
        </motion.div>
      )}

      <button
        onClick={handleBook}
        disabled={booking || !vehicle.pricing}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-ember-500 to-ember-400 py-3 text-sm font-semibold text-ink-950 shadow-lg shadow-ember-500/20 transition hover:shadow-ember-500/40 disabled:opacity-50"
      >
        {booking ? 'Booking…' : !hydrated ? '…' : user ? 'Reserve now' : 'Log in to book'}
      </button>
      {hydrated && user && user.kycStatus !== 'VERIFIED' && (
        <p className="mt-2 text-center text-xs text-amber-300">
          Your driving licence must be verified before you can book.
        </p>
      )}
    </motion.div>
  )
}
