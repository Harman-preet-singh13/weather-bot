import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { SubscriptionController } from './subscription.controller'; 
import { PrismaService } from './prisma-service/prisma.service';
import * as cors from 'cors'; 

@Module({
  controllers: [AppController, SubscriptionController],
  providers: [AppService, PrismaService],
  imports:[TelegramBotModule],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cors()).forRoutes('*');
  }
}
