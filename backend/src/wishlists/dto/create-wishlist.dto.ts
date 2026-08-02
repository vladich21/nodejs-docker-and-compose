import { IsArray, IsNumber, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @MaxLength(250)
  name: string;

  @IsString()
  @IsUrl()
  image: string;

  @IsArray()
  @IsNumber({}, { each: true })
  itemsId: number[];
}
