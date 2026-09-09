import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Fuel, Gauge, MapPin, Users } from 'lucide-react'
import type { Vehicle } from '../types'

const typeLabel: Record<Vehicle['vehicleType'], string> = {
  CAR: 'Car',
  BIKE: 'Bike',
  SCOOTER: 'Scooter',
}

const typeColor: Record<Vehicle['vehicleType'], string> = {
  CAR: 'bg-teal-500/15 text-teal-300',
  BIKE: 'bg-ember-500/15 text-ember-300',
  SCOOTER: 'bg-violet-500/15 text-violet-300',
}

export default function VehicleCard({ vehicle, index = 0 }: { vehicle: Vehicle; index?: number }) {
  const image =
    vehicle.images.find((i) => i.primary)?.url ??
    vehicle.images[0]?.url ??
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index, 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/vehicles/${vehicle.id}`}
        className="group block overflow-hidden rounded-2xl border border-white/8 bg-ink-800/60 transition hover:border-white/20"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <motion.img
            src={image}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${typeColor[vehicle.vehicleType]}`}
          >
            {typeLabel[vehicle.vehicleType]}
          </span>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white/95">
              {vehicle.brand} {vehicle.model}
            </h3>
            <span className="whitespace-nowrap text-xs text-white/40">{vehicle.year}</span>
          </div>

          <div className="mt-2 flex items-center gap-1 text-xs text-white/50">
            <MapPin size={12} /> {vehicle.city}
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <Fuel size={12} /> {vehicle.fuelType.toLowerCase()}
            </span>
            {vehicle.seats && (
              <span className="flex items-center gap-1">
                <Users size={12} /> {vehicle.seats}
              </span>
            )}
            {vehicle.transmission && (
              <span className="flex items-center gap-1">
                <Gauge size={12} /> {vehicle.transmission.toLowerCase()}
              </span>
            )}
          </div>

          {vehicle.pricing && (
            <div className="mt-4 flex items-end justify-between border-t border-white/8 pt-3">
              <div>
                <span className="text-lg font-bold text-white">
                  ₹{vehicle.pricing.dailyRate.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-white/40"> / day</span>
              </div>
              <span className="text-xs font-medium text-ember-300 transition group-hover:translate-x-0.5">
                View details →
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
