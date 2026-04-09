import { Injectable, NotFoundException } from '@nestjs/common';
import { NodeRouterService } from '../database/node-router.service';

@Injectable()
export class TransactionsService {
  constructor(private readonly nodeRouter: NodeRouterService) {}

  async getByAccount(customerId: number, accountId: number) {
    const prisma = this.nodeRouter.getPrismaForCustomer(customerId);

    const transactions = await prisma.transactions.findMany({
      where: {
        OR: [
          { from_account_id: accountId },
          { to_account_id: accountId },
        ],
      },
      orderBy: { initiated_at: 'desc' },
    });

    // Collect all account IDs needed (may live on different nodes)
    const allIds = new Set<number>();
    for (const t of transactions) {
      allIds.add(Number(t.from_account_id));
      allIds.add(Number(t.to_account_id));
    }

    // Search across all healthy nodes
    const accountMap = new Map<number, string>();
    for (const nodePrisma of this.nodeRouter.getHealthyNodes()) {
      const accounts = await nodePrisma.accounts.findMany({
        where: { id: { in: [...allIds].map(BigInt) } },
        select: { id: true, account_number: true },
      });
      for (const a of accounts) {
        accountMap.set(Number(a.id), a.account_number);
      }
    }

    return transactions.map((t) => {
      const isOrigin = Number(t.from_account_id) === accountId;
      return {
        id: Number(t.id),
        transaction_uuid: t.transaction_uuid,
        from_account_id: Number(t.from_account_id),
        to_account_id: Number(t.to_account_id),
        amount: Number(t.amount),
        transaction_type: t.transaction_type,
        status: t.status,
        description: null,
        card_id: t.card_id ? Number(t.card_id) : null,
        initiated_at: t.initiated_at.toISOString(),
        completed_at: t.completed_at?.toISOString() ?? null,
        rol_cuenta: isOrigin ? 'ORIGEN' : 'DESTINO',
        counterpart_account: isOrigin
          ? (accountMap.get(Number(t.to_account_id)) ?? '—')
          : (accountMap.get(Number(t.from_account_id)) ?? '—'),
      };
    });
  }

  async getDetail(customerId: number, uuid: string) {
    const prisma = this.nodeRouter.getPrismaForCustomer(customerId);

    const tx = await prisma.transactions.findUnique({
      where: { transaction_uuid: uuid },
      include: {
        card: { select: { card_number: true } },
        transaction_log: {
          orderBy: { created_at: 'asc' },
          select: { id: true, event_type: true, created_at: true, details: true },
        },
      },
    });

    if (!tx) {
      throw new NotFoundException('Transacción no encontrada');
    }

    // Resolve accounts across nodes
    const accountIds = [Number(tx.from_account_id), Number(tx.to_account_id)];
    const accountMap = new Map<number, { account_number: string; account_type: string }>();
    for (const nodePrisma of this.nodeRouter.getHealthyNodes()) {
      const accounts = await nodePrisma.accounts.findMany({
        where: { id: { in: accountIds.map(BigInt) } },
        select: { id: true, account_number: true, account_type: true },
      });
      for (const a of accounts) {
        accountMap.set(Number(a.id), { account_number: a.account_number, account_type: a.account_type });
      }
    }

    const fromAccount = accountMap.get(Number(tx.from_account_id));
    const toAccount = accountMap.get(Number(tx.to_account_id));

    // Determinar si el cliente es origen o destino
    const ca = await prisma.customer_accounts.findUnique({
      where: { customer_id: customerId },
      select: { checking_account_id: true, credit_account_id: true },
    });
    const customerAccountIds = new Set(
      [ca?.checking_account_id, ca?.credit_account_id]
        .filter(Boolean)
        .map(Number),
    );
    const isOrigin = customerAccountIds.has(Number(tx.from_account_id));

    return {
      transaction: {
        id: Number(tx.id),
        transaction_uuid: tx.transaction_uuid,
        from_account_id: Number(tx.from_account_id),
        to_account_id: Number(tx.to_account_id),
        amount: Number(tx.amount),
        transaction_type: tx.transaction_type,
        status: tx.status,
        description: null,
        card_id: tx.card_id ? Number(tx.card_id) : null,
        initiated_at: tx.initiated_at.toISOString(),
        completed_at: tx.completed_at?.toISOString() ?? null,
        rol_cuenta: isOrigin ? 'ORIGEN' : 'DESTINO',
        counterpart_account: isOrigin
          ? (toAccount?.account_number ?? '—')
          : (fromAccount?.account_number ?? '—'),
      },
      from_account: fromAccount ?? { account_number: '—', account_type: '—' },
      to_account: toAccount ?? { account_number: '—', account_type: '—' },
      card: tx.card ? { card_number: tx.card.card_number } : null,
      log_events: tx.transaction_log.map((log) => ({
        id: Number(log.id),
        event_type: log.event_type,
        occurred_at: log.created_at.toISOString(),
        node_id: (log.details as any)?.node_id ?? 'nodo-a',
      })),
    };
  }
}
