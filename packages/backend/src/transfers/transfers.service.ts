import { Injectable, BadRequestException } from '@nestjs/common';
import { NodeRouterService } from '../database/node-router.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

@Injectable()
export class TransfersService {
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
}
