'use client'

import { motion } from 'framer-motion'
import { CalendarCheck, MapPinned, KeyRound } from 'lucide-react'

const steps = [
  {
    icon: MapPinned,
    title: 'Search your city',
    body: 'Filter by vehicle type, dates and budget to see what is free right now.',
  },
  {
    icon: CalendarCheck,
    title: 'Book in seconds',
    body: 'Pick your window, see the total upfront, and pay rental plus deposit together.',
  },
  {
    icon: KeyRound,
    title: 'Pick up and go',
    body: 'Show your booking reference at pickup. Deposit is refunded on a safe return.',
  },
]

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">How it works</h2>
        <p className="mt-2 text-sm text-white/50">Three steps between you and the open road</p>
      </div>

      <div className="relative mt-10 grid gap-6 sm:grid-cols-3">
        <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent sm:block" />
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.1 }}
            className="relative rounded-2xl border border-white/8 bg-ink-800/40 p-6 text-center"
          >
            <span className="relative z-10 mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-ember-500/20 to-teal-500/10 text-ember-300 ring-1 ring-white/10">
              <step.icon size={22} />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-white">
              <span className="text-ember-400">{i + 1}.</span> {step.title}
            </h3>
            <p className="mt-2 text-sm text-white/50">{step.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
