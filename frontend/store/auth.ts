'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  token: string | null
  user: User | null
  hydrated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  setUser: (user: User) => void
  setHydrated: () => void
}

// localStorage doesn't exist during Next's server render, so the store starts
// empty on the server and rehydrates client-side; `hydrated` lets components
// avoid flashing a "logged out" state before that finishes.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setUser: (user) => set({ user }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'vr-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
)
