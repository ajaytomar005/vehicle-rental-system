import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { CheckCircle2, MapPin } from 'lucide-react'
import { api, apiErrorMessage } from '../lib/api'
import type { Booking } from '../types'
import Loader from '../components/Loader'
import StatusPill from '../components/StatusPill'

export default function BookingDetail() {
  const { id } = useParams()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  async function load() {
    try {
      const res = await api.get<Booking>(`/bookings/${id}`)
      setBooking(res.data)
    } catch {
      toast.error('Could not load this booking.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function simulatePayment() {
    if (!booking) return
    setPaying(true)
    try {
      const init = await api.post('/payments/initiate', { bookingId: booking.id })
      // In production this hands off to the gateway's checkout UI. Here we simulate
      // the gateway calling our webhook once the "payment" succeeds.
      await api.post('/payments/webhook', {
        gatewayOrderId: init.data.gatewayOrderId,
        gatewayPaymentId: 'sim_' + Date.now(),
        status: 'SUCCESS',
      })
      toast.success('Payment successful! Booking confirmed.')
      await load()
    } catch (e) {
      toast.error(apiErrorMessage(e))
    } finally {
      setPaying(false)
    }
  }

  async function cancelBooking() {
    if (!booking) return
    try {
      await api.post(`/bookings/${booking.id}/cancel`, { reason: 'Changed my mind' })
      toast.success('Booking cancelled.')
      await load()
    } catch (e) {
      toast.error(apiErrorMessage(e))
    }
  }

  if (loading) return <Loader label="Loading booking" />
  if (!booking) return null

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40">Booking reference</p>
            <p className="font-mono text-lg font-semibold">{booking.bookingReference}</p>
          </div>
          <StatusPill status={booking.status} />
        </div>

        <div className="mt-6 flex items-center gap-4 border-t border-white/8 pt-6">
          <img
            src={booking.vehicleImageUrl ?? 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=200'}
            className="h-16 w-20 rounded-xl object-cover"
            alt=""
          />
          <div>
            <p className="font-semibold">{booking.vehicleName}</p>
            <p className="flex items-center gap-1 text-xs text-white/40">
              <MapPin size={12} /> {booking.city}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-white/40">Pickup</p>
            <p className="mt-1 text-white/80">{new Date(booking.startAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-white/40">Return</p>
            <p className="mt-1 text-white/80">{new Date(booking.endAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-white/5 p-4 text-sm">
          <div className="flex justify-between text-white/60">
            <span>Rental ({booking.units} {booking.rateType.toLowerCase()})</span>
            <span>₹{booking.rentalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="mt-1 flex justify-between text-white/60">
            <span>Security deposit</span>
            <span>₹{booking.depositAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-white/10 pt-2 font-semibold">
            <span>Total</span>
            <span>₹{booking.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {booking.status === 'PENDING_PAYMENT' && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={simulatePayment}
              disabled={paying}
              className="flex-1 rounded-xl bg-gradient-to-r from-ember-500 to-ember-400 py-3 text-sm font-semibold text-ink-950 disabled:opacity-50"
            >
              {paying ? 'Processing…' : 'Pay now'}
            </button>
            <button
              onClick={cancelBooking}
              className="rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-white/70 hover:border-white/30"
            >
              Cancel
            </button>
          </div>
        )}

        {booking.status === 'CONFIRMED' && (
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-300">
            <CheckCircle2 size={18} /> Payment received. Show this reference at pickup.
          </div>
        )}
      </motion.div>
    </div>
  )
}
