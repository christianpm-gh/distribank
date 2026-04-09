import api from './api'
import type { Transaction, TransactionDetail } from '@/types/api.types'

export async function getTransactions(accountId: number): Promise<Transaction[]> {
  const response = await api.get<Transaction[]>(`/accounts/${accountId}/transactions`)
  return response.data
}

export async function getTransactionDetail(uuid: string): Promise<TransactionDetail> {
  const response = await api.get<TransactionDetail>(`/transactions/${uuid}`)
  return response.data
}
