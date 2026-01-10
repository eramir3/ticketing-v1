import {
  BaseConsumer,
  Subjects,
  ExpirationCompleteEvent,
  Topics,
  ConsumerMessage,
} from '@er3tickets/common';
import { Inject } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { OrdersService } from '../../orders/orders.service';

export class ExpirationCompleteConsumer extends BaseConsumer<ExpirationCompleteEvent> {
  topic = Topics.TicketEvent;
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;

  constructor(
    @Inject('KAFKA_CLIENT') client: Kafka, // provide a Kafka client token
    private readonly orderService: OrdersService,
  ) {
    super(client, 'order-expiration-consumer-groupId')
  }

  async onMessage(data: ConsumerMessage<ExpirationCompleteEvent>) {
    await this.orderService.expire(data.value)
  }
}
