import {
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateWishDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(250)
  name?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  link?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  image?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  price?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(1024)
  description?: string;
}
