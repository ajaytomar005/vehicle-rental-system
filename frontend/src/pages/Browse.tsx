import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Filter, SearchX } from 'lucide-react'
import { api } from '../lib/api'
import type { Page, Vehicle } from '../types'
import VehicleCard from '../components/VehicleCard'
import Loader from '../components/Loader'

export default function Browse() {
  const [params, setParams] = useSearchParams()
  const [data, setData] = useState<Page<Vehicle> | null>(null)
  const [loading, setLoading] = useState(true)

  const city = params.get('city') ?? ''
  const type = params.get('type') ?? ''
  const maxDailyRate = params.get('maxDailyRate') ?? ''
  const q = params.get('q') ?? ''

  useEffect(() => {
    setLoading(true)
    const query: Record<string, string> = { size: '12' }
    if (city) query.city = city
    if (type) query.type = type
    if (maxDailyRate) query.maxDailyRate = maxDailyRate
    if (q) query.q = q

    api
      .get<Page<Vehicle>>('/vehicles', { params: query })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [city, type, maxDailyRate, q])

  function update(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:px-8">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold tracking-tight"
      >
        Browse vehicles
      </motion.h1>

      <div className="glass mt-6 flex flex-wrap items-center gap-3 rounded-2xl p-4">
        <Filter size={16} className="text-white/40" />
        <input
          value={q}
          onChange={(e) => update('q', e.target.value)}
          placeholder="Search brand or model"
          className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none"
        />
        <input
          value={city}
          onChange={(e) => update('city', e.target.value)}
          placeholder="City"
          className="w-32 rounded-lg bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none"
        />
        <select
          value={type}
          onChange={(e) => update('type', e.target.value)}
          className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white/80 focus:outline-none"
        >
          <option value="" className="bg-ink-900">All types</option>
          <option value="CAR" className="bg-ink-900">Car</option>
          <option value="BIKE" className="bg-ink-900">Bike</option>
          <option value="SCOOTER" className="bg-ink-900">Scooter</option>
        </select>
        <input
          value={maxDailyRate}
          onChange={(e) => update('maxDailyRate', e.target.value)}
          placeholder="Max ₹/day"
          type="number"
          className="w-28 rounded-lg bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none"
        />
      </div>

      {loading ? (
        <Loader label="Finding vehicles" />
      ) : data && data.content.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.content.map((v, i) => (
            <VehicleCard key={v.id} vehicle={v} index={i} />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-3 text-white/40">
          <SearchX size={32} />
          <p>No vehicles match your filters yet.</p>
        </div>
      )}
    </div>
  )
}
