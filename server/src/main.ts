import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const telegramBotService = app.get(TelegramBotModule);
  
  await app.listen(3000);
}
bootstrap();
