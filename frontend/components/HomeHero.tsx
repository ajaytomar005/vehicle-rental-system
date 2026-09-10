'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Bike, Car, MapPin, Sparkles, Zap } from 'lucide-react'

export default function HomeHero() {
  const [city, setCity] = useState('')
  const [type, setType] = useState('')
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (type) params.set('type', type)
    router.push(`/browse?${params.toString()}`)
  }

  return (
    <section className="relative overflow-hidden">
      <div className="mesh-glow pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto max-w-7xl px-6 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70"
            >
              <Sparkles size={13} className="text-ember-400" /> Cars &amp; two-wheelers, one app
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl"
            >
              Rent the ride
              <br />
              that fits <span className="text-gradient">your plan.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 max-w-md text-base text-white/60"
            >
              A weekend road trip in a car, or a quick scooter run across town —
              search, book and pick up in minutes.
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              onSubmit={handleSearch}
              className="glass mt-8 flex flex-col gap-3 rounded-2xl p-3 sm:flex-row"
            >
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5">
                <MapPin size={16} className="text-white/40" />
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Which city?"
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="rounded-xl bg-white/5 px-3 py-2.5 text-sm text-white/80 focus:outline-none"
              >
                <option value="" className="bg-ink-900">Any vehicle</option>
                <option value="CAR" className="bg-ink-900">Car</option>
                <option value="BIKE" className="bg-ink-900">Bike</option>
                <option value="SCOOTER" className="bg-ink-900">Scooter</option>
              </select>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-ember-500 to-ember-400 px-6 py-2.5 text-sm font-semibold text-ink-950 transition hover:shadow-lg hover:shadow-ember-500/30"
              >
                Search
              </button>
            </motion.form>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="glass relative overflow-hidden rounded-3xl p-8">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-ember-500/20 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-teal-500/20 blur-2xl" />
              <div className="relative grid grid-cols-2 gap-4">
                <motion.div whileHover={{ y: -6 }} className="col-span-2 flex items-center gap-4 rounded-2xl bg-ink-800/80 p-5">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-ember-500/15 text-ember-300">
                    <Car size={22} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">Hyundai Creta</p>
                    <p className="text-xs text-white/40">Automatic · 5 seats · Pune</p>
                  </div>
                  <span className="ml-auto text-sm font-bold text-teal-300">₹2,200/day</span>
                </motion.div>
                <motion.div whileHover={{ y: -6 }} className="flex items-center gap-3 rounded-2xl bg-ink-800/80 p-4">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500/15 text-teal-300">
                    <Bike size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-white">RE Classic</p>
                    <p className="text-[10px] text-white/40">₹900/day</p>
                  </div>
                </motion.div>
                <motion.div whileHover={{ y: -6 }} className="flex items-center gap-3 rounded-2xl bg-ink-800/80 p-4">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
                    <Zap size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-white">Honda Activa</p>
                    <p className="text-[10px] text-white/40">₹400/day</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
