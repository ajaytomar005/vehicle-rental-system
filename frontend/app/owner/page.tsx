'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Plus, Power, PowerOff } from 'lucide-react'
import { api, apiErrorMessage } from '../../lib/api'
import type { Booking, Page, Vehicle, VehicleType, FuelType, Transmission } from '../../types'
import StatusPill from '../../components/StatusPill'
import Loader from '../../components/Loader'
import ProtectedRoute from '../../components/ProtectedRoute'

const emptyForm = {
  vehicleType: 'CAR' as VehicleType,
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  registrationNo: '',
  seats: 5,
  fuelType: 'PETROL' as FuelType,
  transmission: 'MANUAL' as Transmission,
  city: '',
  address: '',
  description: '',
  hourlyRate: '',
  dailyRate: '',
  weeklyRate: '',
  securityDeposit: '',
  imageUrl: '',
}

function OwnerDashboardContent() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    const [v, b] = await Promise.all([
      api.get<Page<Vehicle>>('/vehicles/mine', { params: { size: 50 } }),
      api.get<Page<Booking>>('/bookings/owner', { params: { size: 20 } }),
    ])
    setVehicles(v.data.content)
    setBookings(b.data.content)
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  function field<K extends keyof typeof form>(key: K) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    }
  }

  async function submitVehicle(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/vehicles', {
        vehicleType: form.vehicleType,
        brand: form.brand,
        model: form.model,
        year: Number(form.year),
        registrationNo: form.registrationNo,
        seats: form.vehicleType === 'CAR' ? Number(form.seats) : null,
        fuelType: form.fuelType,
        transmission: form.transmission,
        city: form.city,
        address: form.address || null,
        description: form.description || null,
        pricing: {
          hourlyRate: Number(form.hourlyRate),
          dailyRate: Number(form.dailyRate),
          weeklyRate: Number(form.weeklyRate),
          securityDeposit: Number(form.securityDeposit),
        },
        imageUrls: form.imageUrl ? [form.imageUrl] : [],
      })
      toast.success('Vehicle submitted for admin approval.')
      setForm(emptyForm)
      setShowForm(false)
      await load()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleActive(v: Vehicle) {
    try {
      await api.post(`/vehicles/${v.id}/${v.status === 'ACTIVE' ? 'deactivate' : 'activate'}`)
      await load()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  async function markPickedUp(b: Booking) {
    try {
      await api.post(`/bookings/${b.id}/pickup`)
      toast.success('Marked as picked up.')
      await load()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  async function markReturned(b: Booking) {
    try {
      await api.post(`/bookings/${b.id}/return`)
      toast.success('Marked as returned.')
      await load()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  if (loading) return <Loader label="Loading your dashboard" />

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Owner dashboard</h1>
        <button onClick={() => setShowForm((s) => !s)} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-ember-500 to-ember-400 px-4 py-2.5 text-sm font-semibold text-ink-950">
          <Plus size={15} /> List a vehicle
        </button>
      </div>

      {showForm && (
        <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={submitVehicle} className="glass mt-6 overflow-hidden rounded-2xl p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <select {...field('vehicleType')} className="rounded-xl bg-white/5 px-3 py-2.5 text-sm">
              <option value="CAR" className="bg-ink-900">Car</option>
              <option value="BIKE" className="bg-ink-900">Bike</option>
              <option value="SCOOTER" className="bg-ink-900">Scooter</option>
            </select>
            <input required placeholder="Brand" {...field('brand')} className="rounded-xl bg-white/5 px-3 py-2.5 text-sm" />
            <input required placeholder="Model" {...field('model')} className="rounded-xl bg-white/5 px-3 py-2.5 text-sm" />
            <input required type="number" placeholder="Year" {...field('year')} className="rounded-xl bg-white/5 px-3 py-2.5 text-sm" />
            <input required placeholder="Registration no." {...field('registrationNo')} className="rounded-xl bg-white/5 px-3 py-2.5 text-sm" />
            {form.vehicleType === 'CAR' && (
              <input required type="number" placeholder="Seats" {...field('seats')} className="rounded-xl bg-white/5 px-3 py-2.5 text-sm" />
            )}
            <select {...field('fuelType')} className="rounded-xl bg-white/5 px-3 py-2.5 text-sm">
              {['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG'].map((f) => (
                <option key={f} value={f} className="bg-ink-900">{f}</option>
              ))}
            </select>
            <select {...field('transmission')} className="rounded-xl bg-white/5 px-3 py-2.5 text-sm">
              <option value="MANUAL" className="bg-ink-900">Manual</option>
              <option value="AUTOMATIC" className="bg-ink-900">Automatic</option>
            </select>
            <input required placeholder="City" {...field('city')} className="rounded-xl bg-white/5 px-3 py-2.5 text-sm" />
            <input placeholder="Address (optional)" {...field('address')} className="rounded-xl bg-white/5 px-3 py-2.5 text-sm" />
          </div>
          <textarea placeholder="Description (optional)" {...field('description')} className="mt-3 w-full rounded-xl bg-white/5 px-3 py-2.5 text-sm" rows={2} />
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <input required type="number" placeholder="₹/hour" {...field('hourlyRate')} className="rounded-xl bg-white/5 px-3 py-2.5 text-sm" />
            <input required type="number" placeholder="₹/day" {...field('dailyRate')} className="rounded-xl bg-white/5 px-3 py-2.5 text-sm" />
            <input required type="number" placeholder="₹/week" {...field('weeklyRate')} className="rounded-xl bg-white/5 px-3 py-2.5 text-sm" />
            <input required type="number" placeholder="Deposit ₹" {...field('securityDeposit')} className="rounded-xl bg-white/5 px-3 py-2.5 text-sm" />
          </div>
          <input placeholder="Photo URL (optional)" {...field('imageUrl')} className="mt-3 w-full rounded-xl bg-white/5 px-3 py-2.5 text-sm" />
          <button disabled={submitting} className="mt-4 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium hover:bg-white/15 disabled:opacity-50">
            {submitting ? 'Submitting…' : 'Submit for approval'}
          </button>
        </motion.form>
      )}

      <h2 className="mt-10 text-lg font-semibold">Your vehicles</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((v) => (
          <div key={v.id} className="rounded-2xl border border-white/8 bg-ink-800/40 p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{v.brand} {v.model}</p>
              <StatusPill status={v.status} />
            </div>
            <p className="mt-1 text-xs text-white/40">{v.city} · {v.registrationNo}</p>
            {(v.status === 'ACTIVE' || v.status === 'INACTIVE') && (
              <button onClick={() => toggleActive(v)} className="mt-3 flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium hover:bg-white/10">
                {v.status === 'ACTIVE' ? <PowerOff size={12} /> : <Power size={12} />}
                {v.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
              </button>
            )}
          </div>
        ))}
        {vehicles.length === 0 && <p className="text-sm text-white/40">No vehicles listed yet.</p>}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Bookings on your vehicles</h2>
      <div className="mt-4 space-y-3">
        {bookings.map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-ink-800/40 p-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{b.vehicleName}</p>
                <StatusPill status={b.status} />
              </div>
              <p className="mt-1 text-xs text-white/40">{b.customerName} · Ref {b.bookingReference}</p>
            </div>
            <div className="flex gap-2">
              {b.status === 'CONFIRMED' && (
                <button onClick={() => markPickedUp(b)} className="rounded-lg bg-teal-500/15 px-3 py-1.5 text-xs font-medium text-teal-300">
                  Mark picked up
                </button>
              )}
              {b.status === 'ACTIVE' && (
                <button onClick={() => markReturned(b)} className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300">
                  Mark returned
                </button>
              )}
            </div>
          </div>
        ))}
        {bookings.length === 0 && <p className="text-sm text-white/40">No bookings yet.</p>}
      </div>
    </div>
  )
}

export default function OwnerDashboardPage() {
  return (
    <ProtectedRoute roles={['OWNER', 'ADMIN']}>
      <OwnerDashboardContent />
    </ProtectedRoute>
  )
}
