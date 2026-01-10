import { Inject, Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { BaseProducer, OrderCancelledEvent, Subjects, Topics } from '@er3tickets/common';

@Injectable()
export class OrderCancelledProducer extends BaseProducer<OrderCancelledEvent> {
  readonly topic = Topics.TicketEvent
  readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled;

  constructor(@Inject('KAFKA_CLIENT') client: Kafka) {
    super(client);
  }
}