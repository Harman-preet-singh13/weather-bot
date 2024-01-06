import { Controller, Delete,Post, Get, Param } from '@nestjs/common';
import { PrismaService } from './prisma-service/prisma.service';

@Controller('api/subscriptions')
export class SubscriptionController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  async getSubscriptions() {
    try {
      const subscriptions = await this.prismaService.findManySubscriptions();
      return { subscriptions };
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  @Delete(':id')
  async deleteSubscription(@Param('id') id: string){
    try {
      const parsedId = parseInt(id);
      await this.prismaService.deleteSubscription(parsedId);
      return { sucess: true, message: 'Subscription deleted successfully'};
    } catch (error){
      console.error("Error: ", error)
      throw error;
    }
  }

  @Post('block/:id')
  async blockUser(@Param('id') id: string){
    const parsedId = parseInt(id);
    await this.prismaService.blockUser(parsedId);
  }
}
