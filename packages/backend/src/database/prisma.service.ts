import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly nodeLabel: string;
  public isConnected = false;

  constructor(databaseUrl: string) {
    super({
      datasources: {
        db: { url: databaseUrl },
      },
    });
    // Extraer host para logging (sin mostrar password)
    try {
      const u = new URL(databaseUrl);
      this.nodeLabel = u.hostname;
    } catch {
      this.nodeLabel = 'unknown';
    }
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.isConnected = true;
      this.logger.log(`✅ Conectado a: ${this.nodeLabel}`);
    } catch (err) {
      this.isConnected = false;
      this.logger.warn(
        `⚠️  No se pudo conectar a: ${this.nodeLabel} — ${(err as Error).message}. El nodo estará inactivo.`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
