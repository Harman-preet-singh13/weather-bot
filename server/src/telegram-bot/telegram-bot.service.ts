import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import { PrismaService } from "../prisma-service/prisma.service"

@Injectable()
export class TelegramBotService {
  private readonly bot: TelegramBot;
  

  constructor(private prismaService: PrismaService) {
    this.bot = new TelegramBot(
      '6882488690:AAHk1sbzFjsvHjhgP5J-9-kKxDumzHwvFrc',
      { polling: true },
    );
    this.setupBot();
    this.setupDailyWeatherReportTask();

  
  }

  private kelvinToCelsius(kelvinTemperature: number): number {
    return kelvinTemperature - 273.15;
  }

  private setupBot() {
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const userName = msg.from.first_name;

      const chatIdAsString = chatId.toString();

      const isBlocked = await this.isBlocked(chatIdAsString);

      if(isBlocked){
        this.bot.sendMessage(
          chatId,
          'You are blocked from using this bot'
        );
        return;
      }

      this.bot.sendMessage(
        chatId,
        `Hello ${userName}! Welcome to Weather Telegram Bot! \n\n This bot will provide daily temperature update.  \n\nFollowing are the rule of WeatherBot. \n\n1. Enter the name of city to view temprature /weather cityname  \n\n2. To set subscription Enter /subscribe cityname . For example, /subscribe jalandhar \n\n 3. To unsubscribe Enter /unsubscribe cityname`,
      );
    });

    this.bot.onText(/\/weather (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const cityName = match[1];
      const city = match[1];
      const chatIdAsString = chatId.toString();

      const isBlocked = await this.isBlocked(chatIdAsString);

      if(isBlocked){
        this.bot.sendMessage(
          chatId,
          'You are blocked from using this bot'
        );
        return;
      }

      if (/^[a-zA-Z ]+$/.test(cityName)) {
        try {
          const weatherData = await this.getWeatherData(cityName);
          const temperatureKelvin = weatherData.main.temp;
          const temperatureCelsius = this.kelvinToCelsius(temperatureKelvin);

          this.bot.sendMessage(
            chatId,
            `The temperature in ${cityName} is ${temperatureCelsius.toFixed(
              2,
            )}°C`,
          );
        } catch (error) {
          this.bot.sendMessage(
            chatId,
            'Error fetching weather data. Please try again later.',
          );
        }
      } else {
        this.bot.sendMessage(
          chatId,
          'Invalid input. Please enter a valid city name.',
        );
      }
    });

    this.bot.onText(/\/subscribe (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const userName = msg.from.first_name;
      const city = match[1];

      const chatIdAsString = chatId.toString();

      const isBlocked = await this.isBlocked(chatIdAsString);

      if(isBlocked){
        this.bot.sendMessage(
          chatId,
          'You are blocked from using this bot'
        );
        return;
      }
    
      // Check if the user is already subscribed
      if (!(await this.isSubscribed(chatId, city))) {
        await this.saveSubscription(chatId, city, userName);
        this.bot.sendMessage(
          chatId,
          `You are now subscribed to daily weather reports for ${city}.`,
        );
      } else {
        this.bot.sendMessage(
          chatId,
          `You are already subscribed to daily weather reports for ${city}.`,
        );
      }
    });

    this.bot.onText(/\/unsubscribe (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const city = match[1];

      if (await this.isSubscribed(chatId, city)) {
        await this.deleteSubscription(chatId, city);
        this.bot.sendMessage(
          chatId,
          `You are unsubscribed from daily weather reports for ${city}.`,
        );
      } else {
        this.bot.sendMessage(
          chatId,
          `You are not subscribed to daily weather reports for ${city}.`,
        );
      }
    });
  }

  private async getWeatherData(cityName: string): Promise<any> {
    const apiKey = 'ac0f4dd188c4497b28f7f420aeb2b31b';
    const apiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;

    const response = await axios.get(apiUrl);
    return response.data;
  }

  getWelcomeMessage(): string {
    console.log('Bot is running')
    return 'Bot is running';
  }

  stratBot() {
    this.bot.startPolling();
  }

  private setupDailyWeatherReportTask() {
    this.prismaService.findCronJob().then((cronJob) => {
      const cronSchedule = '0 */12 * * *';
  
      if (cronSchedule) {
        const cron = require('node-cron');
        cron.schedule(cronSchedule, async () => {
          try {
            const subscriptions = await this.fetchSubscriptions();
            for (const subscription of subscriptions) {
              
              const { chatId, city } = subscription;
  
              const weatherData = await this.getWeatherData(city);
              const temperatureKelvin = weatherData.main.temp;
              const temperatureCelsius = this.kelvinToCelsius(temperatureKelvin);
  
              this.bot.sendMessage(
                chatId,
                `Daily Weather Report for ${city}: ${temperatureCelsius.toFixed(2)}°C`,
              );
            }
          } catch (error) {
            console.error('Error sending daily weather reports:', error.message);
          }
        });
      }
    });
  }
  

  private async fetchSubscriptions(): Promise<{ chatId: any; city: string }[]> {
    const subscriptions = await this.prismaService.findManySubscriptions();
    
    // Convert BigInt to Number in the result
    const convertedSubscriptions = subscriptions.map(subscription => ({
      chatId: Number(subscription.chatId),
      city: subscription.city,
    }));
  
    return convertedSubscriptions;
  }

  private async saveSubscription(chatId: any, city: string, userName:string): Promise<void> {
    await this.prismaService.createSubscription({chatId, city, userName});
  }

  private async deleteSubscription(chatId: any, city: string): Promise<void> {
    const subscriptionId = await this.getSubscriptionId(chatId, city);

    if (subscriptionId !== null) {
      await this.prismaService.deleteSubscription(subscriptionId);
    }
  }

  private async getSubscriptionId(chatId: any, city: string): Promise<number | null> {
    const subscription = await this.prismaService.findSubscription({ chatId, city });
  
    return subscription ? subscription.id : null;
  }

  private async isSubscribed(chatId: any, city: string): Promise<boolean> {
    const subscription = await this.prismaService.findSubscription({ chatId, city });
    return !!subscription; // Returns true if subscription is found, false if it's null
  }

private async isBlocked(chatId: string): Promise<boolean> {
  const subscription = await this.prismaService.findBlockedSubscription({ chatId});

  return subscription ? subscription.blocked : false;
}

}