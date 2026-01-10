import { Kafka } from 'kafkajs';
import { BaseConsumer, ConsumerMessage, Subjects, TicketUpdatedEvent, Topics } from '@er3tickets/common';
import { TicketsService } from '../../tickets/tickets.service';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class TicketUpdatedConsumer extends BaseConsumer<TicketUpdatedEvent> {
  topic = Topics.TicketEvent;
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;

  constructor(
    @Inject('KAFKA_CLIENT') client: Kafka, // provide a Kafka client token
    private readonly ticketsService: TicketsService,
  ) {
    super(client, 'ticket-updated-groupId')
  }

  async onMessage(data: ConsumerMessage<TicketUpdatedEvent>) {
    const { value: { id, version, title, price } } = data
    await this.ticketsService.update({ id, version, title, price })
  }
}