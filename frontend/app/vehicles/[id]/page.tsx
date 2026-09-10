import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Fuel, Gauge, MapPin, ShieldCheck, Star, Users } from 'lucide-react'
import { serverFetch } from '../../../lib/server-api'
import type { Vehicle } from '../../../types'
import StatusPill from '../../../components/StatusPill'
import BookingWidget from './BookingWidget'

interface Props {
  params: Promise<{ id: string }>
}

async function loadVehicle(id: string) {
  try {
    return await serverFetch<Vehicle>(`/vehicles/${id}`, 15)
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const vehicle = await loadVehicle(id)
  if (!vehicle) return { title: 'Vehicle not found — ZoomWheels' }
  return {
    title: `${vehicle.brand} ${vehicle.model} in ${vehicle.city} — ZoomWheels`,
    description: vehicle.description ?? `Rent a ${vehicle.brand} ${vehicle.model} in ${vehicle.city}.`,
  }
}

export default async function VehicleDetailPage({ params }: Props) {
  const { id } = await params
  const [vehicle, rating] = await Promise.all([
    loadVehicle(id),
    serverFetch<{ averageRating: number; reviewCount: number }>(
      `/reviews/vehicle/${id}/summary`,
      15,
    ).catch(() => null),
  ])

  if (!vehicle) notFound()

  const image =
    vehicle.images.find((i) => i.primary)?.url ??
    vehicle.images[0]?.url ??
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200'

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl">
            <Image src={image} alt={`${vehicle.brand} ${vehicle.model}`} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" priority />
          </div>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {vehicle.brand} {vehicle.model}
                </h1>
                <StatusPill status={vehicle.vehicleType} />
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
                <MapPin size={14} /> {vehicle.city} · {vehicle.year}
              </p>
            </div>
            {rating && rating.reviewCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5">
                <Star size={14} className="fill-ember-400 text-ember-400" />
                <span className="text-sm font-semibold">{rating.averageRating}</span>
                <span className="text-xs text-white/40">({rating.reviewCount})</span>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/8 bg-ink-800/40 p-4 text-center">
              <Fuel size={16} className="mx-auto text-white/40" />
              <p className="mt-1.5 text-xs text-white/50">{vehicle.fuelType.toLowerCase()}</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-ink-800/40 p-4 text-center">
              <Users size={16} className="mx-auto text-white/40" />
              <p className="mt-1.5 text-xs text-white/50">{vehicle.seats ?? '—'} seats</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-ink-800/40 p-4 text-center">
              <Gauge size={16} className="mx-auto text-white/40" />
              <p className="mt-1.5 text-xs text-white/50">{vehicle.transmission?.toLowerCase() ?? 'n/a'}</p>
            </div>
          </div>

          {vehicle.description && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold">About this vehicle</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/60">{vehicle.description}</p>
            </div>
          )}

          <div className="mt-8 flex items-center gap-2 rounded-xl border border-teal-500/20 bg-teal-500/5 p-4 text-sm text-teal-200">
            <ShieldCheck size={18} className="shrink-0" />
            Hosted by {vehicle.ownerName}. A refundable security deposit is held for every
            booking and returned after a safe return.
          </div>
        </div>

        <BookingWidget vehicle={vehicle} />
      </div>
    </div>
  )
}
