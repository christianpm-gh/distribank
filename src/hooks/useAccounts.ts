import { useQuery } from '@tanstack/react-query'
import { getProfile } from '@/services/accounts.service'
import { useAuthStore } from '@/store/authStore'

export function useProfile() {
  const customerId = useAuthStore((s) => s.customerId)

  return useQuery({
    queryKey: ['profile', customerId],
    queryFn: () => getProfile(customerId!),
    enabled: !!customerId,
  })
}
