import { Injectable, OnModuleInit } from '@nestjs/common';
import { TicketCreatedConsumer } from './ticket-created-consumer';
import { TicketUpdatedConsumer } from './ticket-updated-consumer';
import { ExpirationCompleteConsumer } from './expiration-complete-consumer';
import { PaymentCreatedConsumer } from './payment-created-consumer';

@Injectable()
export class ConsumersService implements OnModuleInit {
  constructor(
    private readonly ticketCreated: TicketCreatedConsumer,
    private readonly ticketUpdated: TicketUpdatedConsumer,
    private readonly expirationCompelete: ExpirationCompleteConsumer,
    private readonly paymentCreated: PaymentCreatedConsumer
  ) { }

  async onModuleInit() {
    await Promise.all([this.ticketCreated.start(), this.ticketUpdated.start(), this.expirationCompelete.start(), this.paymentCreated.start()]);
  }

  // async onModuleDestroy() {
  //   await Promise.allSettled([this.ticketCreated.stop?.(), this.ticketUpdated.stop?.()]);
  // }
}
