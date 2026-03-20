import { useMutation } from '@tanstack/react-query'
import { login } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import type { LoginRequest } from '@/types/api.types'

export function useLogin() {
  const storeLogin = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (response) => {
      storeLogin(response.access_token, response.customer_id, response.role)
      navigate('/')
    },
  })
}
