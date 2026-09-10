'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Banknote, Car, IdCard, ShieldCheck, Users } from 'lucide-react'
import { api, apiErrorMessage } from '../../lib/api'
import type { DashboardStats, License, Page, Vehicle } from '../../types'
import Loader from '../../components/Loader'
import ProtectedRoute from '../../components/ProtectedRoute'

const statCards = (s: DashboardStats) => [
  { label: 'Total users', value: s.totalUsers, icon: Users },
  { label: 'Active vehicles', value: `${s.activeVehicles} / ${s.totalVehicles}`, icon: Car },
  { label: 'Completed bookings', value: `${s.completedBookings} / ${s.totalBookings}`, icon: ShieldCheck },
  { label: 'Gross booking value', value: `₹${s.grossBookingValue.toLocaleString('en-IN')}`, icon: Banknote },
]

function AdminDashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const [s, v, l] = await Promise.all([
      api.get<DashboardStats>('/admin/stats'),
      api.get<Page<Vehicle>>('/admin/vehicles/pending', { params: { size: 20 } }),
      api.get<Page<License>>('/admin/licenses/pending', { params: { size: 20 } }),
    ])
    setStats(s.data)
    setVehicles(v.data.content)
    setLicenses(l.data.content)
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  async function approveVehicle(id: number) {
    try {
      await api.post(`/admin/vehicles/${id}/approve`)
      toast.success('Vehicle approved.')
      await load()
    } catch (e) {
      toast.error(apiErrorMessage(e))
    }
  }

  async function rejectVehicle(id: number) {
    const reason = window.prompt('Reason for rejection?')
    if (!reason) return
    try {
      await api.post(`/admin/vehicles/${id}/reject`, { reason })
      toast.success('Vehicle rejected.')
      await load()
    } catch (e) {
      toast.error(apiErrorMessage(e))
    }
  }

  async function decideLicense(id: number, approve: boolean) {
    const reason = approve ? undefined : window.prompt('Reason for rejection?') ?? undefined
    try {
      await api.post(`/admin/licenses/${id}/decide`, { approve, reason })
      toast.success(approve ? 'Licence approved.' : 'Licence rejected.')
      await load()
    } catch (e) {
      toast.error(apiErrorMessage(e))
    }
  }

  if (loading) return <Loader label="Loading admin dashboard" />
  if (!stats) return null

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Admin dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards(stats).map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="rounded-2xl border border-white/8 bg-ink-800/40 p-5">
            <card.icon size={18} className="text-ember-400" />
            <p className="mt-3 text-2xl font-bold">{card.value}</p>
            <p className="mt-1 text-xs text-white/50">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <h2 className="mt-10 flex items-center gap-2 text-lg font-semibold">
        <Car size={18} /> Vehicles awaiting approval
      </h2>
      <div className="mt-4 space-y-3">
        {vehicles.map((v) => (
          <div key={v.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-ink-800/40 p-4">
            <div>
              <p className="font-medium">{v.brand} {v.model} · {v.registrationNo}</p>
              <p className="mt-0.5 text-xs text-white/40">by {v.ownerName} in {v.city}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => approveVehicle(v.id)} className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300">
                Approve
              </button>
              <button onClick={() => rejectVehicle(v.id)} className="rounded-lg bg-rose-500/15 px-3 py-1.5 text-xs font-medium text-rose-300">
                Reject
              </button>
            </div>
          </div>
        ))}
        {vehicles.length === 0 && <p className="text-sm text-white/40">No pending vehicles.</p>}
      </div>

      <h2 className="mt-10 flex items-center gap-2 text-lg font-semibold">
        <IdCard size={18} /> Licences awaiting review
      </h2>
      <div className="mt-4 space-y-3">
        {licenses.map((l) => (
          <div key={l.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-ink-800/40 p-4">
            <div>
              <p className="font-medium">{l.userName}</p>
              <p className="mt-0.5 text-xs text-white/40">Licence {l.licenseNumber} · expires {l.expiryDate}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => decideLicense(l.id, true)} className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300">
                Approve
              </button>
              <button onClick={() => decideLicense(l.id, false)} className="rounded-lg bg-rose-500/15 px-3 py-1.5 text-xs font-medium text-rose-300">
                Reject
              </button>
            </div>
          </div>
        ))}
        {licenses.length === 0 && <p className="text-sm text-white/40">No pending licences.</p>}
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute roles={['ADMIN']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}
