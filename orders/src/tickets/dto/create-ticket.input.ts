import { InputType, Field } from '@nestjs/graphql';
import { IsMongoId, IsNotEmpty, Min } from 'class-validator';

@InputType()
export class CreateTicketInput {
  @IsNotEmpty({ message: 'Order status must be provided' })
  @IsMongoId({ message: 'TicketId must be a valid MongoDB ObjectId' })
  @Field(() => String)
  id: string;

  @IsNotEmpty({ message: 'Order status must be provided' })
  @Field(() => String)
  title: string;

  @IsNotEmpty({ message: 'Order status must be provided' })
  @Min(0, { message: 'Price should be greater that 0' })
  @Field(() => String)
  price: number;
}