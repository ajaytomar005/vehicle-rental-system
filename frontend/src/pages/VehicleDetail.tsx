import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { CalendarClock, Fuel, Gauge, MapPin, ShieldCheck, Star, Users } from 'lucide-react'
import { api, apiErrorMessage } from '../lib/api'
import { useAuthStore } from '../store/auth'
import type { QuoteResponse, Vehicle } from '../types'
import Loader from '../components/Loader'
import StatusPill from '../components/StatusPill'

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function VehicleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [rating, setRating] = useState<{ averageRating: number; reviewCount: number } | null>(null)
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const defaultStart = new Date(now.getTime() + 2 * 60 * 60 * 1000)
  const defaultEnd = new Date(defaultStart.getTime() + 24 * 60 * 60 * 1000)

  const [startAt, setStartAt] = useState(toLocalInputValue(defaultStart))
  const [endAt, setEndAt] = useState(toLocalInputValue(defaultEnd))
  const [quote, setQuote] = useState<QuoteResponse | null>(null)
  const [quoting, setQuoting] = useState(false)
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get<Vehicle>(`/vehicles/${id}`),
      api.get(`/reviews/vehicle/${id}/summary`).catch(() => ({ data: null })),
    ])
      .then(([v, r]) => {
        setVehicle(v.data)
        setRating(r.data)
      })
      .catch(() => toast.error('Could not load this vehicle.'))
      .finally(() => setLoading(false))
  }, [id])

  async function fetchQuote() {
    if (!vehicle) return
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
      navigate('/login', { state: { from: `/vehicles/${id}` } })
      return
    }
    if (!vehicle) return
    setBooking(true)
    try {
      const res = await api.post('/bookings', {
        vehicleId: vehicle.id,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
      })
      toast.success('Booking created! Redirecting to payment…')
      navigate(`/bookings/${res.data.id}`)
    } catch (e) {
      toast.error(apiErrorMessage(e))
    } finally {
      setBooking(false)
    }
  }

  if (loading) return <Loader label="Loading vehicle" />
  if (!vehicle) return null

  const image =
    vehicle.images.find((i) => i.primary)?.url ??
    vehicle.images[0]?.url ??
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200'

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="aspect-[16/10] overflow-hidden rounded-3xl"
          >
            <img src={image} alt={vehicle.brand} className="h-full w-full object-cover" />
          </motion.div>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {vehicle.brand} {vehicle.model}
                </h1>
                <StatusPill status={vehicle.vehicleType} />
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
                <MapPin size={14} /> {vehicle.city} · {vehicle.year}
              </p>
            </div>
            {rating && rating.reviewCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5">
                <Star size={14} className="fill-ember-400 text-ember-400" />
                <span className="text-sm font-semibold">{rating.averageRating}</span>
                <span className="text-xs text-white/40">({rating.reviewCount})</span>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/8 bg-ink-800/40 p-4 text-center">
              <Fuel size={16} className="mx-auto text-white/40" />
              <p className="mt-1.5 text-xs text-white/50">{vehicle.fuelType.toLowerCase()}</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-ink-800/40 p-4 text-center">
              <Users size={16} className="mx-auto text-white/40" />
              <p className="mt-1.5 text-xs text-white/50">{vehicle.seats ?? '—'} seats</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-ink-800/40 p-4 text-center">
              <Gauge size={16} className="mx-auto text-white/40" />
              <p className="mt-1.5 text-xs text-white/50">
                {vehicle.transmission?.toLowerCase() ?? 'n/a'}
              </p>
            </div>
          </div>

          {vehicle.description && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold">About this vehicle</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/60">
                {vehicle.description}
              </p>
            </div>
          )}

          <div className="mt-8 flex items-center gap-2 rounded-xl border border-teal-500/20 bg-teal-500/5 p-4 text-sm text-teal-200">
            <ShieldCheck size={18} className="shrink-0" />
            Hosted by {vehicle.ownerName}. A refundable security deposit is held for every
            booking and returned after a safe return.
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass h-fit rounded-3xl p-6"
        >
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">
              ₹{vehicle.pricing?.dailyRate.toLocaleString('en-IN')}
            </span>
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
                <p className="text-rose-300">
                  Not available for these dates — try a different window.
                </p>
              )}
            </motion.div>
          )}

          <button
            onClick={handleBook}
            disabled={booking || !vehicle.pricing}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-ember-500 to-ember-400 py-3 text-sm font-semibold text-ink-950 shadow-lg shadow-ember-500/20 transition hover:shadow-ember-500/40 disabled:opacity-50"
          >
            {booking ? 'Booking…' : user ? 'Reserve now' : 'Log in to book'}
          </button>
          {user?.kycStatus !== 'VERIFIED' && user && (
            <p className="mt-2 text-center text-xs text-amber-300">
              Your driving licence must be verified before you can book.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
