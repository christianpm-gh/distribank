import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Natalia Ruiz Castillo (customer_id=27, Nodo A)...');

  const passwordHash = await bcrypt.hash('Distribank2025!', 10);

  // Customer
  await prisma.customers.upsert({
    where: { id: 27 },
    update: {},
    create: {
      id: 27,
      name: 'Natalia Ruiz Castillo',
      curp: 'RUCN900515MDFZTS01',
      email: 'natalia.ruiz@distribank.mx',
      password: passwordHash,
    },
  });

  // Checking account
  await prisma.accounts.upsert({
    where: { id: 27 },
    update: {},
    create: {
      id: 27,
      account_number: 'DISTCHK0000000027',
      account_type: 'CHECKING',
      balance: 56000,
      overdraft_limit: 1500,
      status: 'ACTIVE',
      week_transactions: 8,
      created_at: new Date('2024-01-08'),
    },
  });

  // Credit account
  await prisma.accounts.upsert({
    where: { id: 43 },
    update: {},
    create: {
      id: 43,
      account_number: 'DISTCRD0000000013',
      account_type: 'CREDIT',
      balance: 12000,
      credit_limit: 20000,
      available_credit: 8000,
      status: 'ACTIVE',
      week_transactions: 4,
      created_at: new Date('2024-03-15'),
      last_limit_increase_at: new Date('2025-02-10'),
    },
  });

  // Customer accounts bridge
  await prisma.customer_accounts.upsert({
    where: { customer_id: 27 },
    update: {},
    create: {
      customer_id: 27,
      checking_account_id: 27,
      credit_account_id: 43,
    },
  });

  // Cards
  const cards = [
    { id: 1, account_id: 27, card_number: '4000000000000010', card_type: 'DEBIT', cvv: '123', expiration_date: new Date('2028-09-01'), status: 'ACTIVE', daily_limit: 15000 },
    { id: 2, account_id: 27, card_number: '4000000000000011', card_type: 'DEBIT', cvv: '456', expiration_date: new Date('2027-03-01'), status: 'ACTIVE', daily_limit: 5000 },
    { id: 3, account_id: 43, card_number: '4000000000000017', card_type: 'CREDIT', cvv: '789', expiration_date: new Date('2028-09-01'), status: 'ACTIVE', daily_limit: 20000 },
    { id: 4, account_id: 43, card_number: '4000000000000018', card_type: 'CREDIT', cvv: '012', expiration_date: new Date('2027-09-01'), status: 'BLOCKED', daily_limit: 10000 },
  ];

  for (const card of cards) {
    await prisma.cards.upsert({
      where: { id: card.id },
      update: {},
      create: card,
    });
  }

  // Destination accounts (for intra-node transactions)
  const destAccounts = [
    { id: 18, account_number: 'DISTCHK0000000018', account_type: 'CHECKING', balance: 30000, overdraft_limit: 1000, status: 'ACTIVE' },
    { id: 30, account_number: 'DISTCHK0000000030', account_type: 'CHECKING', balance: 15000, overdraft_limit: 500, status: 'ACTIVE' },
    { id: 35, account_number: 'DISTCHK0000000035', account_type: 'CHECKING', balance: 20000, overdraft_limit: 1000, status: 'ACTIVE' },
    { id: 40, account_number: 'DISTCHK0000000040', account_type: 'CHECKING', balance: 10000, overdraft_limit: 500, status: 'ACTIVE' },
    { id: 22, account_number: 'DISTCHK0000000022', account_type: 'CHECKING', balance: 25000, overdraft_limit: 1000, status: 'ACTIVE' },
  ];

  for (const acc of destAccounts) {
    await prisma.accounts.upsert({
      where: { id: acc.id },
      update: {},
      create: { ...acc, week_transactions: 0 },
    });
  }

  // Transactions
  const txns = [
    { id: 4, transaction_uuid: '00000000-0000-4000-8000-000000000004', from_account_id: 27, to_account_id: 18, amount: 12000, transaction_type: 'TRANSFER', status: 'COMPLETED', initiated_at: new Date('2025-06-04T09:00:00Z'), completed_at: new Date('2025-06-04T09:00:04Z') },
    { id: 9, transaction_uuid: '00000000-0000-4000-8000-000000000009', from_account_id: 27, to_account_id: 30, amount: 5500, transaction_type: 'TRANSFER', status: 'COMPLETED', initiated_at: new Date('2025-06-05T14:30:00Z'), completed_at: new Date('2025-06-05T14:30:03Z') },
    { id: 11, transaction_uuid: '00000000-0000-4000-8000-000000000011', from_account_id: 43, to_account_id: 27, card_id: 3, amount: 4500, transaction_type: 'PURCHASE', status: 'COMPLETED', initiated_at: new Date('2025-06-06T11:15:00Z'), completed_at: new Date('2025-06-06T11:15:02Z') },
    { id: 15, transaction_uuid: '00000000-0000-4000-8000-000000000015', from_account_id: 27, to_account_id: 35, amount: 8000, transaction_type: 'TRANSFER', status: 'PENDING', initiated_at: new Date('2025-06-07T10:00:00Z') },
    { id: 20, transaction_uuid: '00000000-0000-4000-8000-000000000020', from_account_id: 27, to_account_id: 40, amount: 3200, transaction_type: 'TRANSFER', status: 'FAILED', initiated_at: new Date('2025-06-08T08:45:00Z') },
    { id: 25, transaction_uuid: '00000000-0000-4000-8000-000000000025', from_account_id: 27, to_account_id: 22, amount: 6700, transaction_type: 'TRANSFER', status: 'ROLLED_BACK', initiated_at: new Date('2025-06-09T16:20:00Z') },
  ];

  for (const tx of txns) {
    await prisma.transactions.upsert({
      where: { id: tx.id },
      update: {},
      create: tx,
    });
  }

  // Transaction log events
  const logs = [
    // T4 COMPLETED
    { transaction_id: 4, event_type: 'INITIATED', created_at: new Date('2025-06-04T09:00:00Z'), details: { node_id: 'nodo-a' } },
    { transaction_id: 4, event_type: 'DEBIT_APPLIED', created_at: new Date('2025-06-04T09:00:01Z'), details: { node_id: 'nodo-a' } },
    { transaction_id: 4, event_type: 'CREDIT_APPLIED', created_at: new Date('2025-06-04T09:00:03Z'), details: { node_id: 'nodo-b' } },
    { transaction_id: 4, event_type: 'COMPLETED', created_at: new Date('2025-06-04T09:00:04Z'), details: { node_id: 'nodo-a' } },
    // T15 PENDING
    { transaction_id: 15, event_type: 'INITIATED', created_at: new Date('2025-06-07T10:00:00Z'), details: { node_id: 'nodo-a' } },
    { transaction_id: 15, event_type: 'DEBIT_APPLIED', created_at: new Date('2025-06-07T10:00:01Z'), details: { node_id: 'nodo-a' } },
    // T20 FAILED
    { transaction_id: 20, event_type: 'INITIATED', created_at: new Date('2025-06-08T08:45:00Z'), details: { node_id: 'nodo-a' } },
    { transaction_id: 20, event_type: 'DEBIT_APPLIED', created_at: new Date('2025-06-08T08:45:01Z'), details: { node_id: 'nodo-a' } },
    { transaction_id: 20, event_type: 'FAILED', created_at: new Date('2025-06-08T08:45:03Z'), details: { node_id: 'nodo-b' } },
    // T25 ROLLED_BACK
    { transaction_id: 25, event_type: 'INITIATED', created_at: new Date('2025-06-09T16:20:00Z'), details: { node_id: 'nodo-a' } },
    { transaction_id: 25, event_type: 'DEBIT_APPLIED', created_at: new Date('2025-06-09T16:20:01Z'), details: { node_id: 'nodo-a' } },
    { transaction_id: 25, event_type: 'FAILED', created_at: new Date('2025-06-09T16:20:03Z'), details: { node_id: 'nodo-b' } },
    { transaction_id: 25, event_type: 'COMPENSATED', created_at: new Date('2025-06-09T16:20:05Z'), details: { node_id: 'nodo-a' } },
  ];

  for (const log of logs) {
    await prisma.transaction_log.create({ data: log });
  }

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
