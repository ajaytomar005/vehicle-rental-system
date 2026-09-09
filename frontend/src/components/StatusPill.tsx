import type { BookingStatus, VehicleStatus, KycStatus } from '../types'

const styles: Record<string, string> = {
  PENDING_PAYMENT: 'bg-amber-500/15 text-amber-300',
  CONFIRMED: 'bg-teal-500/15 text-teal-300',
  ACTIVE: 'bg-ember-500/15 text-ember-300',
  COMPLETED: 'bg-emerald-500/15 text-emerald-300',
  CANCELLED: 'bg-white/10 text-white/50',
  EXPIRED: 'bg-white/10 text-white/50',
  PENDING_APPROVAL: 'bg-amber-500/15 text-amber-300',
  INACTIVE: 'bg-white/10 text-white/50',
  REJECTED: 'bg-rose-500/15 text-rose-300',
  NOT_SUBMITTED: 'bg-white/10 text-white/50',
  PENDING: 'bg-amber-500/15 text-amber-300',
  VERIFIED: 'bg-emerald-500/15 text-emerald-300',
  APPROVED: 'bg-emerald-500/15 text-emerald-300',
}

export default function StatusPill({
  status,
}: {
  status: BookingStatus | VehicleStatus | KycStatus | string
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] ?? 'bg-white/10 text-white/60'
      }`}
    >
      {status.replaceAll('_', ' ').toLowerCase()}
    </span>
  )
}
