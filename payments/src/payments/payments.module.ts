import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsResolver } from './payments.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { CookieSessionMiddleware, CurrentUserMiddleware, RequireAuthMiddleware } from '@er3tickets/common';
import { kafkaWrapper } from '../kafka-wrapper';
import { OrdersModule } from '../orders/orders.module';

const kafkaClientProvider = {
  provide: 'KAFKA_CLIENT',
  useFactory: () => kafkaWrapper.client,
};

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
    ]),
    OrdersModule
  ],
  providers: [PaymentsResolver, PaymentsService, kafkaClientProvider],
})
export class PaymentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CookieSessionMiddleware, CurrentUserMiddleware).forRoutes('*');
    consumer.apply(RequireAuthMiddleware).forRoutes({
      path: '/api/payments/graphql',
      method: RequestMethod.ALL,
    });
  }
}
