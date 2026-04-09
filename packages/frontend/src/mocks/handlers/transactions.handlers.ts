import { http, HttpResponse, delay } from 'msw'
import {
  checkingTransactions,
  creditTransactions,
  transactionDetails,
} from '../data/natalia'

export const transactionsHandlers = [
  http.get('/api/accounts/:id/transactions', async ({ params }) => {
    await delay(300)
    const accountId = Number(params.id)

    if (accountId === 27) {
      return HttpResponse.json(checkingTransactions)
    }
    if (accountId === 43) {
      return HttpResponse.json(creditTransactions)
    }

    return HttpResponse.json([])
  }),

  http.get('/api/transactions/:uuid', async ({ params }) => {
    await delay(300)
    const uuid = params.uuid as string
    const detail = transactionDetails[uuid]

    if (!detail) {
      return HttpResponse.json({ message: 'Transacción no encontrada' }, { status: 404 })
    }

    return HttpResponse.json(detail)
  }),
]
