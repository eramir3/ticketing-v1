import { Inject, Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { BaseProducer, Subjects, TicketCreatedEvent, Topics } from '@er3tickets/common';

@Injectable()
export class TicketCreatedProducer extends BaseProducer<TicketCreatedEvent> {
  readonly topic = Topics.TicketEvent
  readonly subject = Subjects.TicketCreated;

  constructor(@Inject('KAFKA_CLIENT') client: Kafka) {
    super(client);
  }
}
