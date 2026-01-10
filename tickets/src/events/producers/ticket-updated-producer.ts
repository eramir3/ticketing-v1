import { Inject, Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { BaseProducer, Subjects, TicketUpdatedEvent, Topics } from '@er3tickets/common';

@Injectable()
export class TicketUpdatedProducer extends BaseProducer<TicketUpdatedEvent> {
  readonly topic = Topics.TicketEvent
  readonly subject = Subjects.TicketUpdated;

  constructor(@Inject('KAFKA_CLIENT') client: Kafka) {
    super(client);
  }
}