import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

export type NodeId = 'nodo-a' | 'nodo-b' | 'nodo-c';

@Injectable()
export class NodeRouterService {
  private readonly logger = new Logger(NodeRouterService.name);
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

  /** Todos los nodos, incluyendo los que no conectaron. */
  getAllNodes(): PrismaService[] {
    return Object.values(this.prismaInstances);
  }

  /** Solo nodos que conectaron correctamente. Usar para búsquedas multi-nodo. */
  getHealthyNodes(): PrismaService[] {
    return Object.values(this.prismaInstances).filter((p) => p.isConnected);
  }

  /** Busca en qué nodo sano existe un account_number dado. */
  async findAccountNodeByNumber(
    accountNumber: string,
  ): Promise<{ node: NodeId; prisma: PrismaService } | null> {
    for (const [node, prisma] of Object.entries(this.prismaInstances)) {
      if (!prisma.isConnected) {
        this.logger.warn(`Saltando nodo inactivo: ${node}`);
        continue;
      }
      try {
        const account = await prisma.accounts.findUnique({
          where: { account_number: accountNumber },
        });
        if (account) {
          return { node: node as NodeId, prisma };
        }
      } catch (err) {
        this.logger.warn(`Error al buscar en nodo ${node}: ${(err as Error).message}`);
      }
    }
    return null;
  }
}
