import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SignUpDto {
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;

  @IsString({ message: 'Password must be between 4 and 20 characters' })
  @MinLength(4)
  @MaxLength(20)
  password: string;
}
