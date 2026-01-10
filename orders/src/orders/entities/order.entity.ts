import { OrderStatus } from '@er3tickets/common';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { Ticket } from '../../tickets/entities/ticket.entity';

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@ObjectType()
export class Order {
  @Field(() => ID)
  id: string;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => GraphQLISODateTime)
  expiresAt: Date;

  @Field(() => ID)
  userId: string;

  @Field(() => Ticket)
  ticket: Ticket;
}
