import { http, HttpResponse, delay } from 'msw'
import { customer } from '../data/natalia'

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    await delay(500)
    const body = (await request.json()) as { email: string; password: string }

    if (body.email === customer.email) {
      return HttpResponse.json({
        access_token: 'mock-jwt-token-distribank-27',
        customer_id: customer.id,
        role: 'customer',
        expires_in: 3600,
      })
    }

    return HttpResponse.json(
      { message: 'Credenciales inválidas' },
      { status: 401 },
    )
  }),
]
