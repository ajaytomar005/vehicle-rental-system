import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Car, Menu, X, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react'
import { useAuthStore } from '../store/auth'

const navLinks = [
  { to: '/browse', label: 'Browse' },
  { to: '/bookings', label: 'My Bookings' },
]

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
  }

  const dashboardPath =
    user?.role === 'ADMIN' ? '/admin' : user?.role === 'OWNER' ? '/owner' : null

  return (
    <header className="sticky top-0 z-50">
      <div className="glass border-b border-white/5">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 md:px-8">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.span
              whileHover={{ rotate: -8, scale: 1.08 }}
              className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-ember-500 to-ember-400 text-ink-950"
            >
              <Car size={18} strokeWidth={2.5} />
            </motion.span>
            <span className="text-lg font-semibold tracking-tight">
              Zoom<span className="text-gradient">Wheels</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative text-sm font-medium text-white/70 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            {dashboardPath && (
              <Link
                to={dashboardPath}
                className="flex items-center gap-1.5 text-sm font-medium text-white/70 transition hover:text-white"
              >
                <LayoutDashboard size={15} /> Dashboard
              </Link>
            )}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-full border border-white/10 py-1.5 pl-1.5 pr-4 text-sm font-medium text-white/80 transition hover:border-white/30 hover:text-white"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-teal-500/20 text-teal-300">
                    <UserIcon size={13} />
                  </span>
                  {user.fullName.split(' ')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="grid h-9 w-9 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
                  aria-label="Log out"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-white/70 transition hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-gradient-to-r from-ember-500 to-ember-400 px-5 py-2 text-sm font-semibold text-ink-950 shadow-lg shadow-ember-500/20 transition hover:shadow-ember-500/40"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          <button
            className="grid h-9 w-9 place-items-center rounded-lg text-white/80 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass overflow-hidden border-b border-white/5 md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
              {dashboardPath && (
                <Link
                  to={dashboardPath}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5"
                >
                  Dashboard
                </Link>
              )}
              <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/80 hover:bg-white/5"
                  >
                    Log out
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setOpen(false)}
                      className="rounded-lg bg-gradient-to-r from-ember-500 to-ember-400 px-3 py-2.5 text-center text-sm font-semibold text-ink-950"
                    >
                      Get started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
