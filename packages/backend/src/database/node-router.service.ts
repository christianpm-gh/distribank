import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

export type NodeId = 'nodo-a' | 'nodo-b' | 'nodo-c';

@Injectable()
export class NodeRouterService {
  private readonly prismaInstances: Record<NodeId, PrismaService>;

  constructor(
    private readonly prismaNodeA: PrismaService,
    private readonly prismaNodeB: PrismaService,
    private readonly prismaNodeC: PrismaService,
  ) {
    this.prismaInstances = {
      'nodo-a': prismaNodeA,
      'nodo-b': prismaNodeB,
      'nodo-c': prismaNodeC,
    };
  }

  getNodeForCustomer(customerId: number): NodeId {
    const mod = customerId % 3;
    if (mod === 0) return 'nodo-a';
    if (mod === 1) return 'nodo-b';
    return 'nodo-c';
  }

  getPrismaForCustomer(customerId: number): PrismaService {
    const node = this.getNodeForCustomer(customerId);
    return this.prismaInstances[node];
  }

  getPrismaForNode(node: NodeId): PrismaService {
    return this.prismaInstances[node];
  }

  getAllNodes(): PrismaService[] {
    return Object.values(this.prismaInstances);
  }

  async findAccountNodeByNumber(accountNumber: string): Promise<{ node: NodeId; prisma: PrismaService } | null> {
    for (const [node, prisma] of Object.entries(this.prismaInstances)) {
      const account = await prisma.accounts.findUnique({
        where: { account_number: accountNumber },
      });
      if (account) {
        return { node: node as NodeId, prisma };
      }
    }
    return null;
  }
}
