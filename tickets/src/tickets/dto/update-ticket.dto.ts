import { IsNotEmpty, Min } from 'class-validator';

export class UpdateTicketDto {
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @Min(0, { message: 'Price must be greater than 0' })
  price: number;
}