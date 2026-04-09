import { http, HttpResponse, delay } from 'msw'
import type { TransferRequest } from '@/types/api.types'

export const transferHandlers = [
  http.post('/api/transfers', async ({ request }) => {
    await delay(1000)
    const body = (await request.json()) as TransferRequest

    if (body.from_account_id === body.to_account_number as unknown as number) {
      return HttpResponse.json(
        { message: 'La cuenta origen y destino no pueden ser la misma' },
        { status: 400 },
      )
    }

    return HttpResponse.json({
      transaction_uuid: body.transaction_uuid,
      status: 'COMPLETED',
      initiated_at: new Date().toISOString(),
    })
  }),
]
