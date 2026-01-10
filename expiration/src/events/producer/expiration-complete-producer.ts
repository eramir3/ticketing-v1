import {
  Subjects,
  BaseProducer,
  ExpirationCompleteEvent,
  Topics,
} from '@er3tickets/common';
import { Inject, Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class ExpirationCompleteProducer extends BaseProducer<ExpirationCompleteEvent> {
  readonly topic = Topics.TicketEvent
  readonly subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;

  constructor(@Inject('KAFKA_CLIENT') client: Kafka) {
    super(client);
  }
}
