'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, Sparkles, Zap } from 'lucide-react'

const perks = [
  {
    icon: ShieldCheck,
    title: 'Verified riders only',
    body: 'Every customer completes a driving licence check before their first booking.',
  },
  {
    icon: Zap,
    title: 'No double-booking, ever',
    body: 'Availability is locked at the database level the moment you pay.',
  },
  {
    icon: Sparkles,
    title: 'Fair, transparent pricing',
    body: 'Hourly, daily or weekly — you always see the total before you confirm.',
  },
]

export default function Perks() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-4 md:px-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {perks.map((perk, i) => (
          <motion.div
            key={perk.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="rounded-2xl border border-white/8 bg-ink-800/40 p-5"
          >
            <perk.icon className="text-ember-400" size={20} />
            <h3 className="mt-3 text-sm font-semibold text-white">{perk.title}</h3>
            <p className="mt-1.5 text-sm text-white/50">{perk.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
