import { http, HttpResponse, delay } from 'msw'
import { customer, accounts } from '../data/natalia'

export const accountsHandlers = [
  http.get('/api/customers/:id/profile', async ({ params }) => {
    await delay(300)
    const id = Number(params.id)

    if (id !== customer.id) {
      return HttpResponse.json({ message: 'Cliente no encontrado' }, { status: 404 })
    }

    return HttpResponse.json({ customer, accounts })
  }),
]
