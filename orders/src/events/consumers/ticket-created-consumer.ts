import { Kafka } from 'kafkajs';
import { BaseConsumer, ConsumerMessage, Subjects, TicketCreatedEvent, Topics } from '@er3tickets/common';
import { TicketsService } from '../../tickets/tickets.service';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class TicketCreatedConsumer extends BaseConsumer<TicketCreatedEvent> {
  topic = Topics.TicketEvent;
  subject: Subjects.TicketCreated = Subjects.TicketCreated;

  constructor(
    @Inject('KAFKA_CLIENT') client: Kafka, // provide a Kafka client token
    private readonly ticketsService: TicketsService,
  ) {
    super(client, 'ticket-consumer-groupId')
  }

  async onMessage(data: ConsumerMessage<TicketCreatedEvent>) {
    await this.ticketsService.create(data.value);
  }
}
