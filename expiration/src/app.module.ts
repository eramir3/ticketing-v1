import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrdersModule } from './orders/orders.module';
import { ConsumersService } from './events/consumers/consumer.service';
import { ExpirationProducerService } from './queues/expiration-producer-service';
import { ExpirationProcessorService } from './queues/expiration-processor-service';
import { OrderCreatedConsumer } from './events/consumers/order-created-consumer';
import { kafkaWrapper } from './kafka-wrapper';
import { ExpirationCompleteProducer } from './events/producer/expiration-complete-producer';

const kafkaClientProvider = {
  provide: 'KAFKA_CLIENT',
  useFactory: () => kafkaWrapper.client,
};

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
      },
    }),
    BullModule.registerQueue({
      name: 'orders',
    }),
    OrdersModule,
  ],
  controllers: [],
  providers: [ConsumersService, OrderCreatedConsumer, ExpirationProducerService, ExpirationProcessorService, ExpirationCompleteProducer, kafkaClientProvider],
})
export class AppModule { }
