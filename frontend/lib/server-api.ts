// For use in Server Components only. There is no browser and no JWT here, so
// this only ever calls the public, unauthenticated GET endpoints (vehicle
// search, vehicle detail, review summaries) directly against the backend.
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080'

export async function serverFetch<T>(path: string, revalidateSeconds = 30): Promise<T> {
  const res = await fetch(`${BACKEND_URL}/api${path}`, {
    next: { revalidate: revalidateSeconds },
  })
  if (!res.ok) {
    throw new Error(`Request to ${path} failed with ${res.status}`)
  }
  return res.json() as Promise<T>
}
