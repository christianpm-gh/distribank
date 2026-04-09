import api from './api'
import type { Card } from '@/types/api.types'

export async function getCards(customerId: number): Promise<Card[]> {
  const response = await api.get<Card[]>(`/customers/${customerId}/cards`)
  return response.data
}

export async function toggleCardStatus(
  cardId: number,
  newStatus: 'ACTIVE' | 'BLOCKED',
): Promise<Card> {
  const response = await api.patch<Card>(`/cards/${cardId}/toggle`, {
    new_status: newStatus,
  })
  return response.data
}
