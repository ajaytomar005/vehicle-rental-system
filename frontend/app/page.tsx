import Link from 'next/link'
import HomeHero from '../components/HomeHero'
import Perks from '../components/Perks'
import StatsStrip from '../components/StatsStrip'
import HowItWorks from '../components/HowItWorks'
import VehicleCard from '../components/VehicleCard'
import { serverFetch } from '../lib/server-api'
import type { Page, Vehicle } from '../types'

// Rendered on the server so the featured vehicles are in the initial HTML —
// real content for search engines and social previews, not a client fetch.
export default async function Home() {
  const featured = await serverFetch<Page<Vehicle>>('/vehicles?size=6').catch(
    () => null,
  )

  return (
    <div>
      <HomeHero />
      <Perks />
      <StatsStrip />
      <HowItWorks />

      {featured && featured.content.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Ready to ride</h2>
              <p className="mt-1 text-sm text-white/50">Popular vehicles available right now</p>
            </div>
            <Link href="/browse" className="text-sm font-medium text-ember-300 hover:text-ember-200">
              See all →
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.content.map((v, i) => (
              <VehicleCard key={v.id} vehicle={v} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
