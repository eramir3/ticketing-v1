import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConsumerMessage, OrderCreatedEvent } from '@er3tickets/common';

@Injectable()
export class ExpirationProducerService {
  constructor(
    @InjectQueue('orders')
    private readonly ordersExpirationQueue: Queue,
  ) { }

  async addOrderExpiration(order: OrderCreatedEvent['data']) {
    try {
      const delay = new Date(order.expiresAt).getTime() - new Date().getTime();
      console.log('Waiting this many miliseconds!:', delay)
      const orderId = order.id
      await this.ordersExpirationQueue.add(
        'order-expiration',
        { orderId },
        {
          jobId: `order-expire-${orderId}`,
          delay, // ⏱ 15 minutes
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
        },
      );
      console.log('Added Order Expiration!')
    } catch (e) {
      console.log('Error!!!', e)
    }

  }
}
