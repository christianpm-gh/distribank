import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCards, toggleCardStatus } from '@/services/cards.service'
import { useAuthStore } from '@/store/authStore'

export function useCards() {
  const customerId = useAuthStore((s) => s.customerId)

  return useQuery({
    queryKey: ['cards', customerId],
    queryFn: () => getCards(customerId!),
    enabled: !!customerId,
  })
}

export function useToggleCard() {
  const queryClient = useQueryClient()
  const customerId = useAuthStore((s) => s.customerId)

  return useMutation({
    mutationFn: ({ cardId, newStatus }: { cardId: number; newStatus: 'ACTIVE' | 'BLOCKED' }) =>
      toggleCardStatus(cardId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', customerId] })
    },
  })
}
