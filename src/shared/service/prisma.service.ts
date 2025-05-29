import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      log: [{ emit: 'event', level: 'query' }],
    });
  }
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }

  async runTransaction<T>(
    transactionCallback: (tx: PrismaClient) => Promise<T>,
  ): Promise<T> {
    return await this.$transaction(async (tx) => {
      return await transactionCallback(tx as PrismaClient);
    });
  }
}
