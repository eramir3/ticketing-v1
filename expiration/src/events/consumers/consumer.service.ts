import { Injectable, OnModuleInit } from '@nestjs/common';
import { OrderCreatedConsumer } from './order-created-consumer';


@Injectable()
export class ConsumersService implements OnModuleInit {
  constructor(
    private readonly orderCreated: OrderCreatedConsumer,
  ) { }

  async onModuleInit() {
    await Promise.all([this.orderCreated.start()]);
  }

  // async onModuleDestroy() {
  //   await Promise.allSettled([this.ticketCreated.stop?.(), this.ticketUpdated.stop?.()]);
  // }
}
