import Link from 'next/link'
import { Car, Mail, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-ink-900/60">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-ember-500 to-ember-400 text-ink-950">
                <Car size={16} strokeWidth={2.5} />
              </span>
              <span className="text-base font-semibold">
                Zoom<span className="text-gradient">Wheels</span>
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-white/50">
              Cars, bikes and scooters, ready when you are. Search, book and go —
              by the hour, day or week.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white/80">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/50">
              <li><Link href="/browse" className="hover:text-white">Browse vehicles</Link></li>
              <li><Link href="/register" className="hover:text-white">List your vehicle</Link></li>
              <li><Link href="/bookings" className="hover:text-white">My bookings</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white/80">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/50">
              <li>How it works</li>
              <li>Trust &amp; safety</li>
              <li>Support</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white/80">Stay in touch</h4>
            <div className="mt-3 flex gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/60">
                <Mail size={15} />
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/60">
                <MessageCircle size={15} />
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-white/40 md:flex-row">
          <span>© {new Date().getFullYear()} ZoomWheels. All rights reserved.</span>
          <span>Built for learning and personal use.</span>
        </div>
      </div>
    </footer>
  )
}
