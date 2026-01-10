import { Kafka } from 'kafkajs';
import { BaseConsumer, ConsumerMessage, OrderCancelledEvent, Subjects, Topics } from '@er3tickets/common';
import { TicketsService } from '../../tickets/tickets.service';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class OrderCancelledConsumer extends BaseConsumer<OrderCancelledEvent> {
  topic = Topics.TicketEvent;
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;

  constructor(
    @Inject('KAFKA_CLIENT') client: Kafka, // provide a Kafka client token
    private readonly ticketsService: TicketsService,
  ) {
    super(client, 'order-consumer-groupId')
  }

  async onMessage(data: ConsumerMessage<OrderCancelledEvent>) {
    await this.ticketsService.assignOrder(data.value.ticket.id, data.value.id)
  }
}