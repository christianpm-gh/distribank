import type {
  Customer,
  Account,
  Card,
  Transaction,
  TransactionDetail,
  TransactionLogEvent,
} from '@/types/api.types'

export const customer: Customer = {
  id: 27,
  name: 'Natalia Ruiz Castillo',
  email: 'natalia.ruiz@distribank.mx',
}

export const accounts: Account[] = [
  {
    id: 27,
    account_number: 'DISTCHK0000000027',
    account_type: 'CHECKING',
    balance: 56000,
    overdraft_limit: 1500,
    status: 'ACTIVE',
    week_transactions: 8,
    created_at: '2024-01-08T00:00:00Z',
  },
  {
    id: 43,
    account_number: 'DISTCRD0000000013',
    account_type: 'CREDIT',
    balance: -12000,
    credit_limit: 20000,
    available_credit: 8000,
    status: 'ACTIVE',
    week_transactions: 4,
    created_at: '2024-03-15T00:00:00Z',
    last_limit_increase_at: '2025-02-10T00:00:00Z',
  },
]

export const cards: Card[] = [
  {
    id: 1,
    card_number: '4000000000000010',
    card_type: 'DEBIT',
    expiration_date: '2028-09',
    status: 'ACTIVE',
    daily_limit: 15000,
    account_id: 27,
    account_number: 'DISTCHK0000000027',
    account_type: 'CHECKING',
  },
  {
    id: 2,
    card_number: '4000000000000011',
    card_type: 'DEBIT',
    expiration_date: '2027-03',
    status: 'ACTIVE',
    daily_limit: 5000,
    account_id: 27,
    account_number: 'DISTCHK0000000027',
    account_type: 'CHECKING',
  },
  {
    id: 3,
    card_number: '4000000000000017',
    card_type: 'CREDIT',
    expiration_date: '2028-09',
    status: 'ACTIVE',
    daily_limit: 20000,
    account_id: 43,
    account_number: 'DISTCRD0000000013',
    account_type: 'CREDIT',
  },
  {
    id: 4,
    card_number: '4000000000000018',
    card_type: 'CREDIT',
    expiration_date: '2027-09',
    status: 'BLOCKED',
    daily_limit: 10000,
    account_id: 43,
    account_number: 'DISTCRD0000000013',
    account_type: 'CREDIT',
  },
]

// Transactions for checking account (id=27)
export const checkingTransactions: Transaction[] = [
  {
    id: 4,
    transaction_uuid: '00000000-0000-4000-8000-000000000004',
    from_account_id: 27,
    to_account_id: 18,
    amount: 12000,
    transaction_type: 'TRANSFER',
    status: 'COMPLETED',
    initiated_at: '2025-06-04T09:00:00Z',
    completed_at: '2025-06-04T09:00:04Z',
    rol_cuenta: 'ORIGEN',
    counterpart_account: 'DISTCHK0000000018',
  },
  {
    id: 9,
    transaction_uuid: '00000000-0000-4000-8000-000000000009',
    from_account_id: 27,
    to_account_id: 30,
    amount: 5500,
    transaction_type: 'TRANSFER',
    status: 'COMPLETED',
    initiated_at: '2025-06-05T14:30:00Z',
    completed_at: '2025-06-05T14:30:03Z',
    rol_cuenta: 'ORIGEN',
    counterpart_account: 'DISTCHK0000000030',
  },
  {
    id: 11,
    transaction_uuid: '00000000-0000-4000-8000-000000000011',
    from_account_id: 43,
    to_account_id: 27,
    amount: 4500,
    transaction_type: 'PURCHASE',
    status: 'COMPLETED',
    initiated_at: '2025-06-06T11:15:00Z',
    completed_at: '2025-06-06T11:15:02Z',
    rol_cuenta: 'DESTINO',
    counterpart_account: 'DISTCRD0000000013',
  },
  {
    id: 15,
    transaction_uuid: '00000000-0000-4000-8000-000000000015',
    from_account_id: 27,
    to_account_id: 35,
    amount: 8000,
    transaction_type: 'TRANSFER',
    status: 'PENDING',
    initiated_at: '2025-06-07T10:00:00Z',
    rol_cuenta: 'ORIGEN',
    counterpart_account: 'DISTCHK0000000035',
  },
  {
    id: 20,
    transaction_uuid: '00000000-0000-4000-8000-000000000020',
    from_account_id: 27,
    to_account_id: 40,
    amount: 3200,
    transaction_type: 'TRANSFER',
    status: 'FAILED',
    initiated_at: '2025-06-08T08:45:00Z',
    rol_cuenta: 'ORIGEN',
    counterpart_account: 'DISTCHK0000000040',
  },
  {
    id: 25,
    transaction_uuid: '00000000-0000-4000-8000-000000000025',
    from_account_id: 27,
    to_account_id: 22,
    amount: 6700,
    transaction_type: 'TRANSFER',
    status: 'ROLLED_BACK',
    initiated_at: '2025-06-09T16:20:00Z',
    rol_cuenta: 'ORIGEN',
    counterpart_account: 'DISTCHK0000000022',
  },
]

// Transactions for credit account (id=43)
export const creditTransactions: Transaction[] = [
  {
    id: 11,
    transaction_uuid: '00000000-0000-4000-8000-000000000011',
    from_account_id: 43,
    to_account_id: 27,
    amount: 4500,
    transaction_type: 'PURCHASE',
    status: 'COMPLETED',
    description: 'Coppel Satélite',
    initiated_at: '2025-06-06T11:15:00Z',
    completed_at: '2025-06-06T11:15:02Z',
    card_id: 3,
    rol_cuenta: 'ORIGEN',
    counterpart_account: 'DISTCHK0000000027',
  },
]

// Log events for PENDING transaction (T15)
const logEventsT15: TransactionLogEvent[] = [
  { id: 1, event_type: 'INITIATED', occurred_at: '2025-06-07T10:00:00Z', node_id: 'nodo-a' },
  { id: 2, event_type: 'DEBIT_APPLIED', occurred_at: '2025-06-07T10:00:01Z', node_id: 'nodo-a' },
]

// Log events for FAILED transaction (T20)
const logEventsT20: TransactionLogEvent[] = [
  { id: 3, event_type: 'INITIATED', occurred_at: '2025-06-08T08:45:00Z', node_id: 'nodo-a' },
  { id: 4, event_type: 'DEBIT_APPLIED', occurred_at: '2025-06-08T08:45:01Z', node_id: 'nodo-a' },
  { id: 5, event_type: 'FAILED', occurred_at: '2025-06-08T08:45:03Z', node_id: 'nodo-b' },
]

// Log events for ROLLED_BACK transaction (T25)
const logEventsT25: TransactionLogEvent[] = [
  { id: 6, event_type: 'INITIATED', occurred_at: '2025-06-09T16:20:00Z', node_id: 'nodo-a' },
  { id: 7, event_type: 'DEBIT_APPLIED', occurred_at: '2025-06-09T16:20:01Z', node_id: 'nodo-a' },
  { id: 8, event_type: 'FAILED', occurred_at: '2025-06-09T16:20:03Z', node_id: 'nodo-b' },
  { id: 9, event_type: 'COMPENSATED', occurred_at: '2025-06-09T16:20:05Z', node_id: 'nodo-a' },
]

// Log events for COMPLETED transaction (T4)
const logEventsT4: TransactionLogEvent[] = [
  { id: 10, event_type: 'INITIATED', occurred_at: '2025-06-04T09:00:00Z', node_id: 'nodo-a' },
  { id: 11, event_type: 'DEBIT_APPLIED', occurred_at: '2025-06-04T09:00:01Z', node_id: 'nodo-a' },
  { id: 12, event_type: 'CREDIT_APPLIED', occurred_at: '2025-06-04T09:00:03Z', node_id: 'nodo-b' },
  { id: 13, event_type: 'COMPLETED', occurred_at: '2025-06-04T09:00:04Z', node_id: 'nodo-a' },
]

export const transactionDetails: Record<string, TransactionDetail> = {
  '00000000-0000-4000-8000-000000000004': {
    transaction: checkingTransactions[0],
    from_account: { account_number: 'DISTCHK0000000027', account_type: 'CHECKING' },
    to_account: { account_number: 'DISTCHK0000000018', account_type: 'CHECKING' },
    log_events: logEventsT4,
  },
  '00000000-0000-4000-8000-000000000009': {
    transaction: checkingTransactions[1],
    from_account: { account_number: 'DISTCHK0000000027', account_type: 'CHECKING' },
    to_account: { account_number: 'DISTCHK0000000030', account_type: 'CHECKING' },
    log_events: [],
  },
  '00000000-0000-4000-8000-000000000011': {
    transaction: creditTransactions[0],
    from_account: { account_number: 'DISTCRD0000000013', account_type: 'CREDIT' },
    to_account: { account_number: 'DISTCHK0000000027', account_type: 'CHECKING' },
    card: { card_number: '4000000000000017' },
    log_events: [],
  },
  '00000000-0000-4000-8000-000000000015': {
    transaction: checkingTransactions[3],
    from_account: { account_number: 'DISTCHK0000000027', account_type: 'CHECKING' },
    to_account: { account_number: 'DISTCHK0000000035', account_type: 'CHECKING' },
    log_events: logEventsT15,
  },
  '00000000-0000-4000-8000-000000000020': {
    transaction: checkingTransactions[4],
    from_account: { account_number: 'DISTCHK0000000027', account_type: 'CHECKING' },
    to_account: { account_number: 'DISTCHK0000000040', account_type: 'CHECKING' },
    log_events: logEventsT20,
  },
  '00000000-0000-4000-8000-000000000025': {
    transaction: checkingTransactions[5],
    from_account: { account_number: 'DISTCHK0000000027', account_type: 'CHECKING' },
    to_account: { account_number: 'DISTCHK0000000022', account_type: 'CHECKING' },
    log_events: logEventsT25,
  },
}
