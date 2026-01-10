import { Kafka } from 'kafkajs';
import { BaseConsumer, ConsumerMessage, OrderCreatedEvent, Subjects, Topics } from '@er3tickets/common';
import { Inject, Injectable } from '@nestjs/common';
import { ExpirationProducerService } from 'src/queues/expiration-producer-service';

@Injectable()
export class OrderCreatedConsumer extends BaseConsumer<OrderCreatedEvent> {
  topic = Topics.TicketEvent;
  subject: Subjects.OrderCreated = Subjects.OrderCreated;

  constructor(
    @Inject('KAFKA_CLIENT') client: Kafka, // provide a Kafka client token
    private readonly expirationProducerService: ExpirationProducerService,
  ) {
    super(client, 'order-expiration-groupId')
  }

  async onMessage(data: ConsumerMessage<OrderCreatedEvent>) {
    await this.expirationProducerService.addOrderExpiration(data.value)
  }
}