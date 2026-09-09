import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Car, Lock, Mail } from 'lucide-react'
import { api, apiErrorMessage } from '../lib/api'
import { useAuthStore } from '../store/auth'
import type { AuthResponse } from '../types'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post<AuthResponse>('/auth/login', { email, password })
      login(res.data.accessToken, res.data.user)
      toast.success(`Welcome back, ${res.data.user.fullName.split(' ')[0]}!`)
      const from = (location.state as { from?: string })?.from ?? '/'
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass rounded-3xl p-8"
      >
        <div className="flex justify-center">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-ember-500 to-ember-400 text-ink-950">
            <Car size={20} />
          </span>
        </div>
        <h1 className="mt-4 text-center text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-center text-sm text-white/50">Log in to book your next ride</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5">
            <Mail size={16} className="text-white/40" />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5">
            <Lock size={16} className="text-white/40" />
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-ember-500 to-ember-400 py-3 text-sm font-semibold text-ink-950 shadow-lg shadow-ember-500/20 transition hover:shadow-ember-500/40 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/40">
          Demo accounts: <code className="text-white/60">customer@rental.local</code> /{' '}
          <code className="text-white/60">owner@rental.local</code> /{' '}
          <code className="text-white/60">admin@rental.local</code>, password{' '}
          <code className="text-white/60">Password123!</code>
        </p>

        <p className="mt-4 text-center text-sm text-white/50">
          New here?{' '}
          <Link to="/register" className="font-medium text-ember-300 hover:text-ember-200">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
