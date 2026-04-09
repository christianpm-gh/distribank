import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { NodeRouterService } from '../database/node-router.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { PrismaService } from '../database/prisma.service';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

@Injectable()
export class TransfersService {
  private readonly logger = new Logger(TransfersService.name);

  constructor(private readonly nodeRouter: NodeRouterService) {}

  async create(customerId: number, dto: CreateTransferDto) {
    const prismaOrigin = this.nodeRouter.getPrismaForCustomer(customerId);

    // Check idempotency
    const existing = await prismaOrigin.transactions.findUnique({
      where: { transaction_uuid: dto.transaction_uuid },
    });
    if (existing) {
      return {
        transaction_uuid: existing.transaction_uuid,
        status: existing.status,
        initiated_at: existing.initiated_at.toISOString(),
      };
    }

    // Get origin account
    const fromAccount = await prismaOrigin.accounts.findUnique({
      where: { id: dto.from_account_id },
    });
    if (!fromAccount) {
      throw new BadRequestException('Cuenta origen no encontrada');
    }

    // Validate sufficient balance
    const balance = Number(fromAccount.balance);
    const overdraft = Number(fromAccount.overdraft_limit ?? 0);
    const availableCredit = Number(fromAccount.available_credit ?? 0);

    if (fromAccount.account_type === 'CHECKING') {
      if (dto.amount > balance + overdraft) {
        throw new BadRequestException(
          `Saldo insuficiente. Tienes $${balance.toFixed(2)} + $${overdraft.toFixed(2)} de sobregiro disponible.`,
        );
      }
    } else {
      if (dto.amount > availableCredit) {
        throw new BadRequestException(
          `Crédito insuficiente. Tienes $${availableCredit.toFixed(2)} disponibles en tu línea de crédito.`,
        );
      }
    }

    // Find destination account
    const destResult = await this.nodeRouter.findAccountNodeByNumber(dto.to_account_number);
    if (!destResult) {
      throw new BadRequestException('Cuenta destino no encontrada');
    }

    if (Number(fromAccount.id) === Number((await destResult.prisma.accounts.findUnique({ where: { account_number: dto.to_account_number } }))?.id)) {
      throw new BadRequestException('La cuenta origen y destino no pueden ser la misma');
    }

    const destAccount = await destResult.prisma.accounts.findUnique({
      where: { account_number: dto.to_account_number },
    });
    if (!destAccount) {
      throw new BadRequestException('Cuenta destino no encontrada');
    }

    const originNode = this.nodeRouter.getNodeForCustomer(customerId);
    const isIntraNode = originNode === destResult.node;

    if (isIntraNode) {
      return this.executeIntraNode(prismaOrigin, fromAccount, destAccount, dto, originNode);
    } else {
      return this.executeCrossNode(prismaOrigin, destResult.prisma, fromAccount, destAccount, dto, originNode, destResult.node);
    }
  }

  private async executeIntraNode(prisma: any, fromAccount: any, toAccount: any, dto: CreateTransferDto, node: string) {
    const tx = await prisma.transactions.create({
      data: {
        transaction_uuid: dto.transaction_uuid,
        from_account_id: fromAccount.id,
        to_account_id: toAccount.id,
        amount: dto.amount,
        transaction_type: 'TRANSFER',
        status: 'COMPLETED',
        initiated_at: new Date(),
        completed_at: new Date(),
      },
    });

    // Create log events con delay para visualizar saga en tiempo real
    const now = new Date();
    await prisma.transaction_log.create({
      data: { transaction_id: tx.id, event_type: 'INITIATED', created_at: now, details: { node_id: node } },
    });
    await sleep(3000);
    await prisma.transaction_log.create({
      data: { transaction_id: tx.id, event_type: 'DEBIT_APPLIED', created_at: new Date(now.getTime() + 3000), details: { node_id: node } },
    });
    await sleep(3000);
    await prisma.transaction_log.create({
      data: { transaction_id: tx.id, event_type: 'CREDIT_APPLIED', created_at: new Date(now.getTime() + 6000), details: { node_id: node } },
    });
    await sleep(3000);
    await prisma.transaction_log.create({
      data: { transaction_id: tx.id, event_type: 'COMPLETED', created_at: new Date(now.getTime() + 9000), details: { node_id: node } },
    });

    // Update balances
    await prisma.accounts.update({
      where: { id: fromAccount.id },
      data: { balance: { decrement: dto.amount } },
    });

    await prisma.accounts.update({
      where: { id: toAccount.id },
      data: { balance: { increment: dto.amount } },
    });

    // VIP sync post-COMPLETED
    await sleep(3000);
    await this.syncVipSchema(
      fromAccount.id, toAccount.id, dto.amount,
      { uuid: dto.transaction_uuid, type: 'TRANSFER', status: 'COMPLETED', initiated_at: tx.initiated_at, completed_at: tx.completed_at },
      node, node,
    );

    return {
      transaction_uuid: dto.transaction_uuid,
      status: 'COMPLETED',
      initiated_at: tx.initiated_at.toISOString(),
    };
  }

  private async executeCrossNode(
    prismaOrigin: any, prismaDest: any,
    fromAccount: any, toAccount: any,
    dto: CreateTransferDto,
    originNode: string, destNode: string,
  ) {
    const now = new Date();

    // Step 1: Create transaction on origin node
    const tx = await prismaOrigin.transactions.create({
      data: {
        transaction_uuid: dto.transaction_uuid,
        from_account_id: fromAccount.id,
        to_account_id: Number(toAccount.id),
        amount: dto.amount,
        transaction_type: 'TRANSFER',
        status: 'PENDING',
        initiated_at: now,
      },
    });

    // Step 2: Log INITIATED + DEBIT_APPLIED on origin (con delay)
    await prismaOrigin.transaction_log.create({
      data: { transaction_id: tx.id, event_type: 'INITIATED', created_at: now, details: { node_id: originNode } },
    });
    await sleep(3000);
    await prismaOrigin.transaction_log.create({
      data: { transaction_id: tx.id, event_type: 'DEBIT_APPLIED', created_at: new Date(now.getTime() + 3000), details: { node_id: originNode } },
    });

    // Step 3: Debit from origin
    await prismaOrigin.accounts.update({
      where: { id: fromAccount.id },
      data: { balance: { decrement: dto.amount } },
    });

    try {
      // Step 4: Credit on destination node
      await prismaDest.accounts.update({
        where: { id: toAccount.id },
        data: { balance: { increment: dto.amount } },
      });

      // Step 5: Log CREDIT_APPLIED + COMPLETED (con delay)
      await sleep(3000);
      await prismaOrigin.transaction_log.create({
        data: { transaction_id: tx.id, event_type: 'CREDIT_APPLIED', created_at: new Date(now.getTime() + 6000), details: { node_id: destNode } },
      });
      await sleep(3000);
      await prismaOrigin.transaction_log.create({
        data: { transaction_id: tx.id, event_type: 'COMPLETED', created_at: new Date(now.getTime() + 9000), details: { node_id: originNode } },
      });

      await prismaOrigin.transactions.update({
        where: { id: tx.id },
        data: { status: 'COMPLETED', completed_at: new Date() },
      });

      // VIP sync post-COMPLETED
      await sleep(3000);
      await this.syncVipSchema(
        fromAccount.id, toAccount.id, dto.amount,
        { uuid: dto.transaction_uuid, type: 'TRANSFER', status: 'COMPLETED', initiated_at: tx.initiated_at, completed_at: new Date() },
        originNode, destNode,
      );

      return {
        transaction_uuid: dto.transaction_uuid,
        status: 'COMPLETED',
        initiated_at: tx.initiated_at.toISOString(),
      };
    } catch {
      // Compensation: revert debit
      await prismaOrigin.accounts.update({
        where: { id: fromAccount.id },
        data: { balance: { increment: dto.amount } },
      });

      await sleep(3000);
      await prismaOrigin.transaction_log.create({
        data: { transaction_id: tx.id, event_type: 'FAILED', created_at: new Date(now.getTime() + 6000), details: { node_id: destNode } },
      });
      await sleep(3000);
      await prismaOrigin.transaction_log.create({
        data: { transaction_id: tx.id, event_type: 'COMPENSATED', created_at: new Date(now.getTime() + 9000), details: { node_id: originNode } },
      });

      await prismaOrigin.transactions.update({
        where: { id: tx.id },
        data: { status: 'ROLLED_BACK' },
      });

      return {
        transaction_uuid: dto.transaction_uuid,
        status: 'ROLLED_BACK',
        initiated_at: tx.initiated_at.toISOString(),
      };
    }
  }

  // ── VIP Sync ────────────────────────────────────────────────────────

  private async isVipAccount(prismaC: PrismaService, accountId: number): Promise<boolean> {
    const rows: any[] = await prismaC.$queryRawUnsafe(
      `SELECT 1 FROM distribank_vip_customers.accounts WHERE id = $1`,
      accountId,
    );
    return rows.length > 0;
  }

  private async syncVipSchema(
    fromAccountId: number,
    toAccountId: number,
    amount: number,
    txData: { uuid: string; type: string; status: string; initiated_at: Date; completed_at: Date | null },
    originNode: string,
    destNode: string,
  ): Promise<void> {
    try {
      const prismaC = this.nodeRouter.getPrismaForNode('nodo-c');
      if (!prismaC.isConnected) return;

      const fromIsVip = await this.isVipAccount(prismaC, fromAccountId);
      const toIsVip = await this.isVipAccount(prismaC, toAccountId);

      if (!fromIsVip && !toIsVip) return;

      // Actualizar balance del origen VIP (debito)
      if (fromIsVip) {
        await prismaC.$executeRawUnsafe(
          `UPDATE distribank_vip_customers.accounts SET balance = balance - $1 WHERE id = $2`,
          amount, fromAccountId,
        );
        this.logger.log(`⭐ VIP sync: balance debitado acc:${fromAccountId} (-$${amount})`);
      }

      // Actualizar balance del destino VIP (credito)
      if (toIsVip) {
        await prismaC.$executeRawUnsafe(
          `UPDATE distribank_vip_customers.accounts SET balance = balance + $1 WHERE id = $2`,
          amount, toAccountId,
        );
        this.logger.log(`⭐ VIP sync: balance acreditado acc:${toAccountId} (+$${amount})`);
      }

      // Replicar transaccion y logs solo si el origen es VIP (FK en from_account_id)
      if (fromIsVip) {
        const inserted: any[] = await prismaC.$queryRawUnsafe(
          `INSERT INTO distribank_vip_customers.transactions
             (transaction_uuid, from_account_id, to_account_id, amount, transaction_type, status, initiated_at, completed_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (transaction_uuid) DO UPDATE
             SET status = EXCLUDED.status, completed_at = EXCLUDED.completed_at
           RETURNING id`,
          txData.uuid, fromAccountId, toAccountId, amount,
          txData.type, txData.status, txData.initiated_at, txData.completed_at,
        );

        const vipTxId = inserted[0]?.id;
        if (vipTxId) {
          const now = txData.initiated_at;
          const events = [
            { event: 'INITIATED', ts: now, node: originNode },
            { event: 'DEBIT_APPLIED', ts: new Date(now.getTime() + 3000), node: originNode },
            { event: 'CREDIT_APPLIED', ts: new Date(now.getTime() + 6000), node: destNode },
            { event: 'COMPLETED', ts: new Date(now.getTime() + 9000), node: originNode },
          ];

          for (const e of events) {
            await prismaC.$executeRawUnsafe(
              `INSERT INTO distribank_vip_customers.transaction_log
                 (transaction_id, event_type, details, created_at)
               VALUES ($1, $2, $3, $4)`,
              vipTxId, e.event, JSON.stringify({ node_id: e.node }), e.ts,
            );
          }
          this.logger.log(`⭐ VIP sync: transaccion + logs replicados (vip_tx:${vipTxId})`);
        }
      }
    } catch (err) {
      this.logger.warn(`⚠️ VIP sync fallido: ${(err as Error).message}`);
    }
  }
}
