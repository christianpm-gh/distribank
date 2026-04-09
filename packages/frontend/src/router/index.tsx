import { createBrowserRouter } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import AppShell from '@/components/layout/AppShell'
import LoginPage from '@/pages/LoginPage'
import HomePage from '@/pages/HomePage'
import AccountDebitPage from '@/pages/AccountDebitPage'
import AccountCreditPage from '@/pages/AccountCreditPage'
import TransactionHistoryPage from '@/pages/TransactionHistoryPage'
import TransactionDetailPage from '@/pages/TransactionDetailPage'
import CardsPage from '@/pages/CardsPage'
import CardDetailPage from '@/pages/CardDetailPage'
import TransferPage from '@/pages/TransferPage'
import TransferConfirmPage from '@/pages/TransferConfirmPage'
import TransferResultPage from '@/pages/TransferResultPage'
import AllTransactionsPage from '@/pages/AllTransactionsPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/accounts/debit', element: <AccountDebitPage /> },
          { path: '/accounts/credit', element: <AccountCreditPage /> },
          { path: '/accounts/:accountId/transactions', element: <TransactionHistoryPage /> },
          { path: '/transactions', element: <AllTransactionsPage /> },
          { path: '/transactions/:uuid', element: <TransactionDetailPage /> },
          { path: '/cards', element: <CardsPage /> },
          { path: '/cards/:cardId', element: <CardDetailPage /> },
          { path: '/transfer', element: <TransferPage /> },
          { path: '/transfer/confirm', element: <TransferConfirmPage /> },
          { path: '/transfer/result', element: <TransferResultPage /> },
        ],
      },
    ],
  },
])
