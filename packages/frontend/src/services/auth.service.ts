import api from './api'
import type { AuthResponse, LoginRequest } from '@/types/api.types'

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', data)
  return response.data
}
