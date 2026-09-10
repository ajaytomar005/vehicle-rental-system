'use client'

import { motion } from 'framer-motion'

export default function Loader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-white/50">
      <motion.div
        className="h-9 w-9 rounded-full border-2 border-white/15 border-t-ember-400"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
      />
      <span className="text-sm">{label}…</span>
    </div>
  )
}
