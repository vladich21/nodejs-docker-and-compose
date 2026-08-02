import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { User } from './entities/user.entity';
import { FindUsersDto } from './dto/find-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async findOwn(@Req() req: Request & { user: User }) {
    const user = await this.usersService.findOneById(req.user.id);
    return this.usersService.removePassword(user);
  }

  @Patch('me')
  async update(
    @Req() req: Request & { user: User },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.updateMe(req.user.id, updateUserDto);
    return this.usersService.removePassword(user);
  }

  @Get('me/wishes')
  getOwnWishes(@Req() req: Request & { user: User }) {
    return this.usersService.getUserWishesById(req.user.id);
  }

  @Post('find')
  @HttpCode(201)
  async findMany(@Body() findUsersDto: FindUsersDto) {
    const users = await this.usersService.findMany(findUsersDto);
    return users.map((user) => this.usersService.removePasswordAndEmail(user));
  }

  @Get(':username')
  async findOne(@Param('username') username: string) {
    const user = await this.usersService.findOneByUsername(username);
    return this.usersService.removePasswordAndEmail(user);
  }

  @Get(':username/wishes')
  getWishes(@Param('username') username: string) {
    return this.usersService.getUserWishesByUsername(username);
  }
}
