import { http, HttpResponse, delay } from 'msw'
import { cards } from '../data/natalia'

export const cardsHandlers = [
  http.get('/api/customers/:id/cards', async () => {
    await delay(300)
    return HttpResponse.json(cards)
  }),

  http.patch('/api/cards/:id/toggle', async ({ params, request }) => {
    await delay(600)
    const cardId = Number(params.id)
    const body = (await request.json()) as { new_status: 'ACTIVE' | 'BLOCKED' }
    const card = cards.find((c) => c.id === cardId)

    if (!card) {
      return HttpResponse.json({ message: 'Tarjeta no encontrada' }, { status: 404 })
    }

    const validTransition =
      (body.new_status === 'BLOCKED' && card.status === 'ACTIVE') ||
      (body.new_status === 'ACTIVE' && card.status === 'BLOCKED')

    if (!validTransition) {
      return HttpResponse.json(
        { message: 'No fue posible actualizar el estado de la tarjeta. Intenta de nuevo.' },
        { status: 409 },
      )
    }

    card.status = body.new_status
    return HttpResponse.json(card)
  }),
]
