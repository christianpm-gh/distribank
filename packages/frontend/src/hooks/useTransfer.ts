import { useMutation } from '@tanstack/react-query'
import { createTransfer } from '@/services/transfer.service'
import type { TransferRequest } from '@/types/api.types'

export function useTransfer() {
  return useMutation({
    mutationFn: (data: TransferRequest) => createTransfer(data),
  })
}
