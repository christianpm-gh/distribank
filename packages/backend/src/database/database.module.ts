import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { NodeRouterService } from './node-router.service';

const PRISMA_NODE_A = 'PRISMA_NODE_A';
const PRISMA_NODE_B = 'PRISMA_NODE_B';
const PRISMA_NODE_C = 'PRISMA_NODE_C';

@Global()
@Module({
  providers: [
    {
      provide: PRISMA_NODE_A,
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow<string>('NODE_A_DATABASE_URL');
        return new PrismaService(url);
      },
      inject: [ConfigService],
    },
    {
      provide: PRISMA_NODE_B,
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow<string>('NODE_B_DATABASE_URL');
        return new PrismaService(url);
      },
      inject: [ConfigService],
    },
    {
      provide: PRISMA_NODE_C,
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow<string>('NODE_C_DATABASE_URL');
        return new PrismaService(url);
      },
      inject: [ConfigService],
    },
    {
      provide: NodeRouterService,
      useFactory: (a: PrismaService, b: PrismaService, c: PrismaService) => {
        return new NodeRouterService(a, b, c);
      },
      inject: [PRISMA_NODE_A, PRISMA_NODE_B, PRISMA_NODE_C],
    },
  ],
  exports: [NodeRouterService, PRISMA_NODE_A, PRISMA_NODE_B, PRISMA_NODE_C],
})
export class DatabaseModule {}
