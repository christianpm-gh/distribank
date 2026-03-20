// Auth
export type LoginRequest = {
  email: string
  password: string
}

export type AuthResponse = {
  access_token: string
  customer_id: number
  role: string
  expires_in: number
}

// Customer
export type Customer = {
  id: number
  name: string
  email: string
}

// Account
export type AccountType = 'CHECKING' | 'CREDIT'
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'FROZEN' | 'CLOSED'

export type Account = {
  id: number
  account_number: string
  account_type: AccountType
  balance: number
  credit_limit?: number
  available_credit?: number
  overdraft_limit?: number
  status: AccountStatus
  week_transactions: number
  created_at: string
  last_limit_increase_at?: string
}

// Card
export type CardType = 'DEBIT' | 'CREDIT'
export type CardStatus = 'ACTIVE' | 'BLOCKED' | 'EXPIRED' | 'CANCELLED'

export type Card = {
  id: number
  card_number: string
  card_type: CardType
  expiration_date: string
  status: CardStatus
  daily_limit: number
  account_id: number
  account_number: string
  account_type: AccountType
}

// Transaction
export type TransactionType = 'TRANSFER' | 'PURCHASE' | 'DEPOSIT'
export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'ROLLED_BACK'
export type TransactionRole = 'ORIGEN' | 'DESTINO'

export type Transaction = {
  id: number
  transaction_uuid: string
  from_account_id: number
  to_account_id: number
  amount: number
  transaction_type: TransactionType
  status: TransactionStatus
  description?: string
  card_id?: number
  initiated_at: string
  completed_at?: string
  rol_cuenta: TransactionRole
  counterpart_account: string
}

// Transaction Log Event
export type LogEventType =
  | 'INITIATED'
  | 'DEBIT_APPLIED'
  | 'CREDIT_APPLIED'
  | 'COMPLETED'
  | 'COMPENSATED'
  | 'FAILED'

export type TransactionLogEvent = {
  id: number
  event_type: LogEventType
  occurred_at: string
  node_id: string
}

export type TransactionDetail = {
  transaction: Transaction
  from_account: { account_number: string; account_type: AccountType }
  to_account: { account_number: string; account_type: AccountType }
  card?: { card_number: string }
  log_events: TransactionLogEvent[]
}

// Transfer
export type TransferRequest = {
  transaction_uuid: string
  from_account_id: number
  to_account_number: string
  amount: number
  description?: string
}

export type TransferResponse = {
  transaction_uuid: string
  status: TransactionStatus
  initiated_at: string
}

// Financial Profile
export type CustomerProfile = {
  customer: Customer
  accounts: Account[]
}

// Card toggle
export type CardToggleRequest = {
  card_id: number
  new_status: 'ACTIVE' | 'BLOCKED'
}
