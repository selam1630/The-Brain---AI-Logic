/**
 * Application Module
 * Root module that imports all feature modules and configures global services
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { ChatToTextModule } from './modules/chat-to-text/chat-to-text.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env.local', '../../.env', '.env.local', '.env'],
    }),
    PrismaModule,
    ChatToTextModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
