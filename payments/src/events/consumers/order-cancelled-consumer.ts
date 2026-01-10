import { Kafka } from 'kafkajs';
import { BaseConsumer, ConsumerMessage, OrderCancelledEvent, Subjects, Topics } from '@er3tickets/common';
import { Inject, Injectable } from '@nestjs/common';
import { OrdersService } from '../../orders/orders.service';

@Injectable()
export class OrderCancelledConsumer extends BaseConsumer<OrderCancelledEvent> {
  topic = Topics.TicketEvent;
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;

  constructor(
    @Inject('KAFKA_CLIENT') client: Kafka, // provide a Kafka client token
    private readonly ordersService: OrdersService,
  ) {
    super(client, 'payments-cancelled-consumer-groupId')
  }

  async onMessage(data: ConsumerMessage<OrderCancelledEvent>) {
    await this.ordersService.cancel(data.value)
  }
}