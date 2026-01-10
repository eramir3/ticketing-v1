import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { kafkaWrapper } from '../kafka-wrapper';
import { ConsumersService } from '../events/consumers/consumer.service';
import { OrderCreatedConsumer } from '../events/consumers/order-created-consumer';
import { OrderCancelledConsumer } from '../events/consumers/order-cancelled-consumer';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';

const kafkaClientProvider = {
  provide: 'KAFKA_CLIENT',
  useFactory: () => kafkaWrapper.client,
};

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  providers: [OrdersService, ConsumersService, OrderCreatedConsumer, OrderCancelledConsumer, kafkaClientProvider],
  exports: [OrdersService]
})
export class OrdersModule { }
