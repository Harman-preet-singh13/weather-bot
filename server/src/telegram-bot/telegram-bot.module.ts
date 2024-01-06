import { Module } from '@nestjs/common';
import { TelegramBotController } from './telegram-bot.controller';
import { TelegramBotService } from './telegram-bot.service';
import {PrismaService} from "../prisma-service/prisma.service"

@Module({
  controllers: [TelegramBotController],
  providers: [TelegramBotService, PrismaService],
})
export class TelegramBotModule{}
