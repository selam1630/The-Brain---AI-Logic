/**
 * Prisma Service
 * Manages PrismaClient instance and database connections
 * Implements proper lifecycle management for connection cleanup
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  /**
   * Initialize Prisma Client on module initialization
   */
  async onModuleInit() {
    await this.$connect();
    this.logger.log('✓ Database connected');
  }

  /**
   * Disconnect Prisma Client on module destruction
   */
  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('✓ Database disconnected');
  }
}
