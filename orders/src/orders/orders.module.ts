import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { CookieSessionMiddleware, CurrentUserMiddleware, RequireAuthMiddleware } from '@er3tickets/common';
import { TicketsModule } from '../tickets/tickets.module';
import { OrdersService } from './orders.service';
import { OrdersResolver } from './orders.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { kafkaWrapper } from '../kafka-wrapper';
import { OrderCreatedProducer } from '../events/producers/order-created-producer';
import { OrderCancelledProducer } from '../events/producers/order-cancelled-producer';

const kafkaClientProvider = {
  provide: 'KAFKA_CLIENT',
  useFactory: () => kafkaWrapper.client,
};

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
    ]),
    TicketsModule
  ],
  providers: [OrdersResolver, OrdersService, OrderCreatedProducer, OrderCancelledProducer, kafkaClientProvider],
  exports: [OrdersService]
})
export class OrdersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CookieSessionMiddleware, CurrentUserMiddleware).forRoutes('*');
    consumer.apply(RequireAuthMiddleware).forRoutes({
      path: '/api/orders/graphql',
      method: RequestMethod.ALL,
    });
  }
}
