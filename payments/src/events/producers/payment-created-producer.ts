import { Inject, Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { BaseProducer, PaymentCreatedEvent, Subjects, Topics } from '@er3tickets/common';

@Injectable()
export class PaymentCreatedProducer extends BaseProducer<PaymentCreatedEvent> {
  readonly topic = Topics.TicketEvent
  readonly subject: Subjects.PaymentCreated = Subjects.PaymentCreated

  constructor(@Inject('KAFKA_CLIENT') client: Kafka) {
    super(client);
  }
}