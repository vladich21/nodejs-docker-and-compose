import { IsBoolean, IsNumber, Min } from 'class-validator';

export class CreateOfferDto {
  @IsNumber()
  itemId: number;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsBoolean()
  hidden: boolean;
}
