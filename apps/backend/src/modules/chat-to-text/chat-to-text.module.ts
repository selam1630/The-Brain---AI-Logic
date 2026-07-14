/**
 * Chat-to-Text Module
 * Feature module for speech-to-text transcription
 * Imports and exports all related services and controllers
 */

import { Module } from '@nestjs/common';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { ChatToTextService } from './chat-to-text.service';
import { ChatToTextController } from './chat-to-text.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ChatToTextController],
  providers: [ChatToTextService],
  exports: [ChatToTextService],
})
export class ChatToTextModule {}
