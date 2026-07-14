/**
 * Prisma Module
 * Provides database service across the application
 * Handles PrismaClient initialization and cleanup
 */

import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
