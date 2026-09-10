'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    const duration = 900
    const start = performance.now()
    let frame: number
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(to * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, to])

  return (
    <span ref={ref}>
      {value.toLocaleString('en-IN')}
      {suffix}
    </span>
  )
}

const stats = [
  { label: 'Vehicles listed', value: 1200, suffix: '+' },
  { label: 'Cities covered', value: 18 },
  { label: 'Rides completed', value: 9400, suffix: '+' },
  { label: 'Average rating', value: 4.8, suffix: '/5' },
]

export default function StatsStrip() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-4 md:px-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="rounded-2xl border border-white/8 bg-ink-800/30 p-5 text-center"
          >
            <p className="text-2xl font-bold text-white md:text-3xl">
              {s.value % 1 === 0 ? <CountUp to={s.value} suffix={s.suffix} /> : `${s.value}${s.suffix ?? ''}`}
            </p>
            <p className="mt-1 text-xs text-white/50">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
