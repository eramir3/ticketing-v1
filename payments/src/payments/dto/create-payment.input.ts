import { InputType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CreatePaymentInput {
  @Field(() => String)
  @IsString()
  orderId: string;
}
