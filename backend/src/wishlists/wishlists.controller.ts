import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { User } from '../users/entities/user.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { WishlistsService } from './wishlists.service';

@UseGuards(JwtGuard)
@Controller('wishlistlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Post()
  @HttpCode(201)
  create(
    @Req() req: Request & { user: User },
    @Body() createWishlistDto: CreateWishlistDto,
  ) {
    return this.wishlistsService.createWishlist(req.user.id, createWishlistDto);
  }

  @Get()
  findAll() {
    return this.wishlistsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wishlistsService.findWishlistById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: User },
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    return this.wishlistsService.updateWishlist(
      id,
      req.user.id,
      updateWishlistDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: User },
  ) {
    return this.wishlistsService.removeWishlist(id, req.user.id);
  }
}
