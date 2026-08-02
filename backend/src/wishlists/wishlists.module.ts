import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { WishlistsService } from './wishlists.service';
import { WishlistsController } from './wishlists.controller';
import { Wishlist } from './entities/wishlist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist]), UsersModule, AuthModule],
  providers: [WishlistsService],
  controllers: [WishlistsController],
})
export class WishlistsModule {}
