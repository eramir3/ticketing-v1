import { Kafka } from 'kafkajs';
import { BaseConsumer, ConsumerMessage, PaymentCreatedEvent, Subjects, TicketCreatedEvent, Topics } from '@er3tickets/common';
import { TicketsService } from '../../tickets/tickets.service';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class PaymentCreatedConsumer extends BaseConsumer<PaymentCreatedEvent> {
  topic = Topics.TicketEvent;
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;

  constructor(
    @Inject('KAFKA_CLIENT') client: Kafka, // provide a Kafka client token
    private readonly ticketsService: TicketsService,
  ) {
    super(client, 'ticket-consumer-groupId')
  }

  async onMessage(data: ConsumerMessage<PaymentCreatedEvent>) {
    await this.ticketsService.paymentCreated(data.value);
  }
}