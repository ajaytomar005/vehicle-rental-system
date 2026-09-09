export type Role = 'CUSTOMER' | 'OWNER' | 'ADMIN'
export type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
export type VehicleType = 'CAR' | 'BIKE' | 'SCOOTER'
export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'CNG'
export type Transmission = 'MANUAL' | 'AUTOMATIC'
export type VehicleStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'INACTIVE' | 'REJECTED'
export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'

export interface User {
  id: number
  fullName: string
  email: string
  phone: string
  role: Role
  kycStatus: KycStatus
  enabled: boolean
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  expiresInSeconds: number
  user: User
}

export interface Pricing {
  hourlyRate: number
  dailyRate: number
  weeklyRate: number
  securityDeposit: number
}

export interface VehicleImage {
  url: string
  primary: boolean
}

export interface Vehicle {
  id: number
  ownerId: number
  ownerName: string
  vehicleType: VehicleType
  brand: string
  model: string
  year: number
  registrationNo: string
  seats: number | null
  fuelType: FuelType
  transmission: Transmission | null
  city: string
  address: string | null
  description: string | null
  status: VehicleStatus
  images: VehicleImage[]
  pricing: Pricing | null
  createdAt: string
}

export interface Page<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface Booking {
  id: number
  bookingReference: string
  vehicleId: number
  vehicleName: string
  vehicleImageUrl: string | null
  city: string
  customerId: number
  customerName: string
  startAt: string
  endAt: string
  rateType: 'HOURLY' | 'DAILY' | 'WEEKLY'
  units: number
  rentalAmount: number
  depositAmount: number
  totalAmount: number
  status: BookingStatus
  cancelledReason: string | null
  pickedUpAt: string | null
  returnedAt: string | null
  createdAt: string
}

export interface QuoteResponse {
  vehicleId: number
  startAt: string
  endAt: string
  rateType: string
  units: number
  totalHours: number
  rentalAmount: number
  depositAmount: number
  totalAmount: number
  available: boolean
}

export interface License {
  id: number
  userId: number
  userName: string
  licenseNumber: string
  documentUrl: string
  expiryDate: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason: string | null
  reviewedAt: string | null
  createdAt: string
}

export interface DashboardStats {
  totalUsers: number
  totalVehicles: number
  activeVehicles: number
  pendingVehicleApprovals: number
  pendingLicenseReviews: number
  totalBookings: number
  completedBookings: number
  grossBookingValue: number
}
