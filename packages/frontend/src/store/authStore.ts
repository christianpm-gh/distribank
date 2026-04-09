import { create } from 'zustand'

type AuthState = {
  token: string | null
  customerId: number | null
  role: string | null
  login: (token: string, customerId: number, role: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: sessionStorage.getItem('token'),
  customerId: sessionStorage.getItem('customerId')
    ? Number(sessionStorage.getItem('customerId'))
    : null,
  role: sessionStorage.getItem('role'),

  login: (token, customerId, role) => {
    sessionStorage.setItem('token', token)
    sessionStorage.setItem('customerId', String(customerId))
    sessionStorage.setItem('role', role)
    set({ token, customerId, role })
  },

  logout: () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('customerId')
    sessionStorage.removeItem('role')
    set({ token: null, customerId: null, role: null })
  },
}))
