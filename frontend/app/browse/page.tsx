import { Suspense } from 'react'
import BrowseContent from './BrowseContent'
import Loader from '../../components/Loader'

export const metadata = { title: 'Browse vehicles — ZoomWheels' }

export default function BrowsePage() {
  return (
    <Suspense fallback={<Loader label="Loading" />}>
      <BrowseContent />
    </Suspense>
  )
}
