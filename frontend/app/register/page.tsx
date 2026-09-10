'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Car, Mail, Phone, User as UserIcon, Lock } from 'lucide-react'
import { api, apiErrorMessage } from '../../lib/api'
import { useAuthStore } from '../../store/auth'
import type { AuthResponse, Role } from '../../types'

export default function RegisterPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('CUSTOMER')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post<AuthResponse>('/auth/register', { fullName, email, phone, password, role })
      login(res.data.accessToken, res.data.user)
      toast.success('Account created! Welcome to ZoomWheels.')
      router.push('/')
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
        <h1 className="mt-4 text-center text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-center text-sm text-white/50">Rent a vehicle, or list your own</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5">
            <UserIcon size={16} className="text-white/40" />
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none" />
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5">
            <Mail size={16} className="text-white/40" />
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none" />
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5">
            <Phone size={16} className="text-white/40" />
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none" />
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5">
            <Lock size={16} className="text-white/40" />
            <input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 8 characters)" className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none" />
          </div>

          <div className="flex gap-2">
            {(['CUSTOMER', 'OWNER'] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${
                  role === r ? 'bg-ember-500/20 text-ember-300 ring-1 ring-ember-500/40' : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {r === 'CUSTOMER' ? 'I want to rent' : 'I want to list vehicles'}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-ember-500 to-ember-400 py-3 text-sm font-semibold text-ink-950 shadow-lg shadow-ember-500/20 transition hover:shadow-ember-500/40 disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-ember-300 hover:text-ember-200">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
