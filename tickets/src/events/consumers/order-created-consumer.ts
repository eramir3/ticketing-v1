import { Kafka } from 'kafkajs';
import { BaseConsumer, ConsumerMessage, OrderCreatedEvent, Subjects, Topics } from '@er3tickets/common';
import { TicketsService } from '../../tickets/tickets.service';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class OrderCreatedConsumer extends BaseConsumer<OrderCreatedEvent> {
  topic = Topics.TicketEvent;
  subject: Subjects.OrderCreated = Subjects.OrderCreated;

  constructor(
    @Inject('KAFKA_CLIENT') client: Kafka, // provide a Kafka client token
    private readonly ticketsService: TicketsService,
  ) {
    super(client, 'order-consumer-groupId')
  }

  async onMessage(data: ConsumerMessage<OrderCreatedEvent>) {
    await this.ticketsService.assignOrder(data.value.ticket.id, data.value.id)
  }
}