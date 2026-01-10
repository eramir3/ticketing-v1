import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConsumersService } from '../events/consumers/consumer.service';
import { OrderCreatedConsumer } from '../events/consumers/order-created-consumer';
import { ExpirationProducerService } from '../queues/expiration-producer-service';
import { ExpirationProcessorService } from '../queues/expiration-processor-service';
import { kafkaWrapper } from '../kafka-wrapper';
import { ExpirationCompleteProducer } from 'src/events/producer/expiration-complete-producer';

const kafkaClientProvider = {
  provide: 'KAFKA_CLIENT',
  useFactory: () => kafkaWrapper.client,
};

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'orders',
    }),
  ],
  providers: [ConsumersService, OrderCreatedConsumer, ExpirationProducerService, ExpirationProcessorService, ExpirationCompleteProducer, kafkaClientProvider],
})
export class OrdersModule { }
