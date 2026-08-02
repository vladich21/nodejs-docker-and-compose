import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateWishlistDto {
  @IsOptional()
  @IsString()
  @MaxLength(250)
  name?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  image?: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  itemsId?: number[];
}
