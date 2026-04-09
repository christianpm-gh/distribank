import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { NodeRouterService } from '../database/node-router.service';

@Injectable()
export class CardsService {
  constructor(private readonly nodeRouter: NodeRouterService) {}

  async getCards(customerId: number) {
    const prisma = this.nodeRouter.getPrismaForCustomer(customerId);

    const ca = await prisma.customer_accounts.findUnique({
      where: { customer_id: customerId },
    });
    if (!ca) return [];

    const accountIds = [ca.checking_account_id, ca.credit_account_id].filter(Boolean) as bigint[];

    const cards = await prisma.cards.findMany({
      where: { account_id: { in: accountIds } },
      include: { account: true },
      orderBy: [{ account: { account_type: 'asc' } }, { issued_at: 'asc' }],
    });

    return cards.map((c) => ({
      id: Number(c.id),
      card_number: c.card_number,
      card_type: c.card_type,
      expiration_date: c.expiration_date.toISOString().slice(0, 7),
      status: c.status,
      daily_limit: c.daily_limit ? Number(c.daily_limit) : 0,
      account_id: Number(c.account_id),
      account_number: c.account.account_number,
      account_type: c.account.account_type,
    }));
  }

  async toggleCard(customerId: number, cardId: number, newStatus: 'ACTIVE' | 'BLOCKED') {
    const prisma = this.nodeRouter.getPrismaForCustomer(customerId);

    const card = await prisma.cards.findUnique({
      where: { id: cardId },
      include: { account: true },
    });

    if (!card) {
      throw new NotFoundException('Tarjeta no encontrada');
    }

    const expectedCurrent = newStatus === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    if (card.status !== expectedCurrent) {
      throw new ConflictException('No fue posible actualizar el estado de la tarjeta. Intenta de nuevo.');
    }

    const updated = await prisma.cards.update({
      where: { id: cardId },
      data: { status: newStatus },
      include: { account: true },
    });

    return {
      id: Number(updated.id),
      card_number: updated.card_number,
      card_type: updated.card_type,
      expiration_date: updated.expiration_date.toISOString().slice(0, 7),
      status: updated.status,
      daily_limit: updated.daily_limit ? Number(updated.daily_limit) : 0,
      account_id: Number(updated.account_id),
      account_number: updated.account.account_number,
      account_type: updated.account.account_type,
    };
  }
}
