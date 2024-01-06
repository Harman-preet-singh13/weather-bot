import { Controller, Get } from '@nestjs/common';
import { TelegramBotService } from './telegram-bot.service';

@Controller('telegram')
export class TelegramBotController {
  constructor(private readonly telegramBotService: TelegramBotService) {}

  @Get('start')
  onStart(): string {
    return this.telegramBotService.getWelcomeMessage();
  }
}
