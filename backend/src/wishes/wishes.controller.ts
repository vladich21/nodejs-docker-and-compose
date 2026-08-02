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
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { WishesService } from './wishes.service';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @UseGuards(JwtGuard)
  @Post()
  @HttpCode(201)
  async create(
    @Req() req: Request & { user: User },
    @Body() createWishDto: CreateWishDto,
  ) {
    await this.wishesService.createWish(req.user.id, createWishDto);
    return {};
  }

  @Get('last')
  findLast() {
    return this.wishesService.findLast();
  }

  @Get('top')
  findTop() {
    return this.wishesService.findTop();
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wishesService.findWishById(id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: User },
    @Body() updateWishDto: UpdateWishDto,
  ) {
    await this.wishesService.updateWish(id, req.user.id, updateWishDto);
    return {};
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(
    @Req() req: Request & { user: User },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.wishesService.removeWish(id, req.user.id);
  }

  @UseGuards(JwtGuard)
  @Post(':id/copy')
  @HttpCode(201)
  async copyWish(
    @Req() req: Request & { user: User },
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.wishesService.copyWish(id, req.user);
    return {};
  }
}
