import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  about?: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;
}
