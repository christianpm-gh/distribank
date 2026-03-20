import { useQuery } from '@tanstack/react-query'
import { getTransactions, getTransactionDetail } from '@/services/transactions.service'

export function useTransactions(accountId: number) {
  return useQuery({
    queryKey: ['transactions', accountId],
    queryFn: () => getTransactions(accountId),
    enabled: !!accountId,
  })
}

export function useTransactionDetail(uuid: string) {
  return useQuery({
    queryKey: ['transaction', uuid],
    queryFn: () => getTransactionDetail(uuid),
    enabled: !!uuid,
  })
}
