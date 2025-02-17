import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor(private configService: ConfigService) {
    // Initialize the connection pool
    const pool = new Pool({
      connectionString: configService.get<string>('DATABASE_URL'),
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
      connectionTimeoutMillis: 2000, // How long to wait for a connection
    });

    // Create the Prisma adapter with the pool
    const adapter = new PrismaPg(pool, {
      schema: configService.get<string>('DATABASE_SCHEMA') // Optional: specify schema if needed
    });

    // Initialize PrismaClient with the adapter
    super({
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    });

    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end(); // Properly close all pool connections
  }
}