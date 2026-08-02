import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { WishesModule } from '../wishes/wishes.module';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { Offer } from './entities/offer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Offer]),
    WishesModule,
    UsersModule,
    AuthModule,
  ],
  providers: [OffersService],
  controllers: [OffersController],
})
export class OffersModule {}
