import { Injectable, OnModuleInit } from '@nestjs/common';
import { OrderCreatedConsumer } from './order-created-consumer';
import { OrderCancelledConsumer } from './order-cancelled-consumer';

@Injectable()
export class ConsumersService implements OnModuleInit {
  constructor(
    private readonly orderCreated: OrderCreatedConsumer,
    private readonly orderCancelled: OrderCancelledConsumer,
  ) { }

  async onModuleInit() {
    await Promise.all([this.orderCreated.start(), this.orderCancelled.start()]);
  }

  // async onModuleDestroy() {
  //   await Promise.allSettled([this.ticketCreated.stop?.(), this.ticketUpdated.stop?.()]);
  // }
}
