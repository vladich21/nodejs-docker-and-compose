import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OffersService } from './offers.service';

@UseGuards(JwtGuard)
@Controller('offers')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @HttpCode(201)
  async create(
    @Req() req: Request & { user: User },
    @Body() createOfferDto: CreateOfferDto,
  ) {
    const user = await this.usersService.findOneById(req.user.id);
    await this.offersService.createOffer(user, createOfferDto);
    return {};
  }

  @Get()
  findAll() {
    return this.offersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.offersService.findOfferById(id);
  }
}
