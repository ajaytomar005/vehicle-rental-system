import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { IdCard, ShieldCheck, ShieldAlert } from 'lucide-react'
import { api, apiErrorMessage } from '../lib/api'
import { useAuthStore } from '../store/auth'
import type { License } from '../types'
import StatusPill from '../components/StatusPill'

export default function Profile() {
  const { user, setUser } = useAuthStore()
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [saving, setSaving] = useState(false)

  const [license, setLicense] = useState<License | null>(null)
  const [licenseNumber, setLicenseNumber] = useState('')
  const [documentUrl, setDocumentUrl] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [submittingLicense, setSubmittingLicense] = useState(false)

  useEffect(() => {
    api
      .get<License>('/profile/license')
      .then((res) => setLicense(res.data))
      .catch(() => setLicense(null))
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put('/profile/me', { fullName, phone })
      setUser(res.data)
      toast.success('Profile updated.')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function submitLicense(e: React.FormEvent) {
    e.preventDefault()
    setSubmittingLicense(true)
    try {
      const res = await api.post<License>('/profile/license', {
        licenseNumber,
        documentUrl,
        expiryDate,
      })
      setLicense(res.data)
      toast.success('Licence submitted for review.')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    } finally {
      setSubmittingLicense(false)
    }
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 md:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Your profile</h1>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={saveProfile}
        className="glass mt-6 rounded-2xl p-6"
      >
        <h2 className="text-sm font-semibold text-white/70">Account details</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-xl bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none"
            placeholder="Full name"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-xl bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none"
            placeholder="Phone"
          />
        </div>
        <input
          disabled
          value={user.email}
          className="mt-3 w-full rounded-xl bg-white/5 px-3 py-2.5 text-sm text-white/40"
        />
        <button
          disabled={saving}
          className="mt-4 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/15 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </motion.form>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass mt-6 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white/70">
            <IdCard size={16} /> Driving licence (KYC)
          </h2>
          {user.kycStatus === 'VERIFIED' ? (
            <StatusPill status="VERIFIED" />
          ) : (
            <StatusPill status={user.kycStatus} />
          )}
        </div>

        {user.kycStatus === 'VERIFIED' ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-300">
            <ShieldCheck size={18} /> Your licence is verified. You're all set to book.
          </div>
        ) : (
          <>
            {license?.status === 'REJECTED' && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500/10 p-4 text-sm text-rose-300">
                <ShieldAlert size={18} /> {license.rejectionReason ?? 'Your submission was rejected.'}
              </div>
            )}
            {license?.status === 'PENDING' ? (
              <p className="mt-4 text-sm text-white/50">
                Your licence is under review. This usually takes less than a day.
              </p>
            ) : (
              <form onSubmit={submitLicense} className="mt-4 space-y-3">
                <input
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="Licence number"
                  className="w-full rounded-xl bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none"
                />
                <input
                  required
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="Document URL (upload elsewhere and paste the link)"
                  className="w-full rounded-xl bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none"
                />
                <input
                  required
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full rounded-xl bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none [color-scheme:dark]"
                />
                <button
                  disabled={submittingLicense}
                  className="rounded-xl bg-gradient-to-r from-ember-500 to-ember-400 px-5 py-2.5 text-sm font-semibold text-ink-950 disabled:opacity-50"
                >
                  {submittingLicense ? 'Submitting…' : 'Submit for verification'}
                </button>
              </form>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}
