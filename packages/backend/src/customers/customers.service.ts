import { Injectable, NotFoundException } from '@nestjs/common';
import { NodeRouterService } from '../database/node-router.service';

@Injectable()
export class CustomersService {
  constructor(private readonly nodeRouter: NodeRouterService) {}

  async getProfile(customerId: number) {
    const prisma = this.nodeRouter.getPrismaForCustomer(customerId);

    const customer = await prisma.customers.findUnique({
      where: { id: customerId },
      include: {
        customer_accounts: {
          include: {
            checking_account: true,
            credit_account: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const accounts = [];
    const ca = customer.customer_accounts;

    if (ca?.checking_account) {
      accounts.push(this.serializeAccount(ca.checking_account));
    }
    if (ca?.credit_account) {
      accounts.push(this.serializeAccount(ca.credit_account));
    }

    return {
      customer: {
        id: Number(customer.id),
        name: customer.name,
        email: customer.email,
      },
      accounts,
    };
  }

  private serializeAccount(a: any) {
    return {
      id: Number(a.id),
      account_number: a.account_number,
      account_type: a.account_type,
      balance: Number(a.balance),
      credit_limit: a.credit_limit ? Number(a.credit_limit) : null,
      available_credit: a.available_credit ? Number(a.available_credit) : null,
      overdraft_limit: a.overdraft_limit ? Number(a.overdraft_limit) : null,
      status: a.status,
      week_transactions: Number(a.week_transactions),
      created_at: a.created_at.toISOString(),
      last_limit_increase_at: a.last_limit_increase_at?.toISOString() ?? null,
    };
  }
}
