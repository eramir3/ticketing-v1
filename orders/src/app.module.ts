import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { join } from 'path';
import { OrdersModule } from './orders/orders.module';
import { TicketsModule } from './tickets/tickets.module';
import { TicketCreatedConsumer } from './events/consumers/ticket-created-consumer';
import { kafkaWrapper } from './kafka-wrapper';
import { ConsumersService } from './events/consumers/consumer.service';
import { TicketUpdatedConsumer } from './events/consumers/ticket-updated-consumer';
import { ExpirationCompleteConsumer } from './events/consumers/expiration-complete-consumer';

const kafkaClientProvider = {
  provide: 'KAFKA_CLIENT',
  useFactory: () => kafkaWrapper.client,
};

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req, res }) => ({ req, res }),
      path: '/api/orders/graphql',
      plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
      // autoSchemaFile: true,
      playground: false, // optional
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({ uri: process.env.MONGO_URI }),
    }),
    OrdersModule,
    TicketsModule,
  ],
  providers: [ConsumersService, TicketCreatedConsumer, TicketUpdatedConsumer, ExpirationCompleteConsumer, kafkaClientProvider]
})
export class AppModule { }
