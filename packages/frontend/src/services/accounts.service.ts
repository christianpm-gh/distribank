import api from './api'
import type { CustomerProfile } from '@/types/api.types'

export async function getProfile(customerId: number): Promise<CustomerProfile> {
  const response = await api.get<CustomerProfile>(`/customers/${customerId}/profile`)
  return response.data
}
