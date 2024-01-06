import { Injectable,Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { PrismaClient, Subscription } from '@prisma/client';

@Injectable()
export class PrismaService {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createSubscription(data: { chatId: string; userName: string; city: string }): Promise<Subscription> {
    return this.prisma.subscription.create({
      data: {
        chatId: String(data.chatId), 
        userName: data.userName,
        city: data.city,
      },
    });
  }

  async findSubscription(params: { chatId: string; city: string }): Promise<Subscription | null> {
    const { chatId, city } = params;
    return this.prisma.subscription.findFirst({
      where: {
          chatId: String(chatId),
          city,
      },
    });
  }

  async findBlockedSubscription(params: { chatId: string;  }): Promise<Subscription | null> {
    const { chatId} = params;
    return this.prisma.subscription.findFirst({
      where: {
          chatId: String(chatId),
        
      },
    });
  }

  async findUniqueSubscription(where: {
    id: number; 
  }): Promise<Subscription | null> {
    return this.prisma.subscription.findUnique({
      where,
    });
  }

  async deleteSubscription(id: number): Promise<Subscription | null> {
    return this.prisma.subscription.delete({
      where: { id },
    });
  }

  async findManySubscriptions(): Promise<Subscription[]> {
    return this.prisma.subscription.findMany({
      select: {
        id: true,
        chatId: true,
        userName: true,
        city: true,
        blocked: true,
        createdAt: true,
      },
    });
  }

  async blockUser(id: number): Promise<void> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });
  
    if (subscription) {
      const blockedValue = !subscription.blocked; // Toggle the blocked field
      await this.prisma.subscription.update({
        where: { id },
        data: { blocked: blockedValue },
      });
    } else {
      // Handle the case where the subscription with the given ID is not found
      throw new Error(`Subscription with ID ${id} not found`);
    }
  }


  async $onDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }

  async findCronJob(): Promise<{ schedule: string } | null> {
    const cronJobs = await this.prisma.cronJob.findMany({
      take: 1,
      select: {
        schedule: true,
      },
    });
  
    return cronJobs.length > 0 ? cronJobs[0] : null;
  }
}

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  async getAllSubscriptions() {
    return this.prismaService.findManySubscriptions();
  }

  @Get(':id')
  async getSubscriptionById(@Param('id') id: number) {
    return this.prismaService.findUniqueSubscription({ id });
  }

  @Post()
  async createSubscription(@Body() data: { chatId: any; userName: string; city: string }) {
    return this.prismaService.createSubscription(data);
  }

  @Delete(':id')
  async deleteSubscription(@Param('id') id: number) {
    return this.prismaService.deleteSubscription(id);
  }
}