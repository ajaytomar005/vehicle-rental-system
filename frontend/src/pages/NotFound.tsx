import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-6xl font-bold text-gradient"
      >
        404
      </motion.h1>
      <p className="text-white/50">This road doesn't lead anywhere.</p>
      <Link
        to="/"
        className="rounded-xl bg-gradient-to-r from-ember-500 to-ember-400 px-5 py-2.5 text-sm font-semibold text-ink-950"
      >
        Back home
      </Link>
    </div>
  )
}
