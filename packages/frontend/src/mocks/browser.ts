import { setupWorker } from 'msw/browser'
import { authHandlers } from './handlers/auth.handlers'
import { accountsHandlers } from './handlers/accounts.handlers'
import { cardsHandlers } from './handlers/cards.handlers'
import { transactionsHandlers } from './handlers/transactions.handlers'
import { transferHandlers } from './handlers/transfer.handlers'

export const worker = setupWorker(
  ...authHandlers,
  ...accountsHandlers,
  ...cardsHandlers,
  ...transactionsHandlers,
  ...transferHandlers,
)
