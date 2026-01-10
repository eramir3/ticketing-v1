import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { CookieSessionMiddleware, CurrentUserMiddleware, RequireAuthMiddleware } from '@er3tickets/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticket, TicketSchema } from './entities/ticket.entity';
import { TicketCreatedProducer } from '../events/producers/ticket-created-producer';
import { kafkaWrapper } from '../kafka-wrapper';
import { TicketUpdatedProducer } from '../events/producers/ticket-updated-producer';
import { OrderCreatedConsumer } from '../events/consumers/order-created-consumer';
import { OrderCancelledConsumer } from '../events/consumers/order-cancelled-consumer';
import { ConsumersService } from '../events/consumers/consumer.service';

const kafkaClientProvider = {
  provide: 'KAFKA_CLIENT',
  useFactory: () => kafkaWrapper.client,
};

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]),
  ],
  controllers: [TicketsController],
  providers: [TicketsService, TicketCreatedProducer, TicketUpdatedProducer, OrderCreatedConsumer, OrderCancelledConsumer, ConsumersService, kafkaClientProvider],
})
export class TicketsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CookieSessionMiddleware, CurrentUserMiddleware).forRoutes('*');
    consumer.apply(RequireAuthMiddleware).forRoutes({
      path: '/api/tickets',
      method: RequestMethod.POST,
    },
      {
        path: '/api/tickets/:id',
        method: RequestMethod.PUT,
      });
  }
}
