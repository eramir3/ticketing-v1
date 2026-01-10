import { Inject, Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { BaseProducer, OrderCreatedEvent, Subjects, Topics } from '@er3tickets/common';

@Injectable()
export class OrderCreatedProducer extends BaseProducer<OrderCreatedEvent> {
  readonly topic = Topics.TicketEvent
  readonly subject: Subjects.OrderCreated = Subjects.OrderCreated

  constructor(@Inject('KAFKA_CLIENT') client: Kafka) {
    super(client);
  }
}