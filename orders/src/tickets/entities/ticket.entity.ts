import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Ticket {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  price: number;
}