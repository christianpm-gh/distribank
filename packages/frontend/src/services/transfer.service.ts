import api from './api'
import type { TransferRequest, TransferResponse } from '@/types/api.types'

export async function createTransfer(data: TransferRequest): Promise<TransferResponse> {
  const response = await api.post<TransferResponse>('/transfers', data)
  return response.data
}
