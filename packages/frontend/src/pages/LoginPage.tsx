import { useState } from 'react'
import { z } from 'zod/v4'
import { useLogin } from '@/hooks/useAuth'
import distribankLogoBrand from '@/assets/distribank-logo-brand.svg'

const loginSchema = z.object({
  email: z.email('Ingresa un email válido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const loginMutation = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = loginSchema.safeParse({ email, password })

    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as 'email' | 'password'
        fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    loginMutation.mutate({ email, password })
  }

  const isDisabled = !email || !password || loginMutation.isPending

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img
            src={distribankLogoBrand}
            alt="DistriBank"
            className="mx-auto w-full max-w-[320px] drop-shadow-[0_0_16px_rgba(26,86,219,0.4)]"
          />
          <p className="mt-2 text-sm text-text-secondary">Ingresa a tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="natalia.ruiz@distribank.mx"
              disabled={loginMutation.isPending}
              className="w-full rounded-md border border-surface-elevated bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
            />
            {errors.email && <p className="mt-1 text-xs text-status-error">{errors.email}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loginMutation.isPending}
              className="w-full rounded-md border border-surface-elevated bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
            />
            {errors.password && <p className="mt-1 text-xs text-status-error">{errors.password}</p>}
          </div>

          {loginMutation.isError && (
            <p className="text-sm text-status-error">Credenciales inválidas</p>
          )}

          <button
            type="submit"
            disabled={isDisabled}
            className="w-full rounded-md bg-brand-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary/80 disabled:opacity-50"
          >
            {loginMutation.isPending ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
