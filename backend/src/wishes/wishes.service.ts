import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeleteResult,
  FindManyOptions,
  FindOptionsWhere,
  Repository,
  UpdateResult,
} from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
    private readonly usersService: UsersService,
  ) {}

  create(data: Partial<Wish>): Promise<Wish> {
    return this.wishRepository.save(data);
  }

  findOne(query: FindOptionsWhere<Wish>): Promise<Wish | null> {
    return this.wishRepository.findOne({ where: query });
  }

  find(query: FindManyOptions<Wish>): Promise<Wish[]> {
    return this.wishRepository.find(query);
  }

  updateOne(
    query: FindOptionsWhere<Wish>,
    data: Partial<Wish>,
  ): Promise<UpdateResult> {
    return this.wishRepository.update(query, data);
  }

  removeOne(query: FindOptionsWhere<Wish>): Promise<DeleteResult> {
    return this.wishRepository.delete(query);
  }

  async createWish(
    userId: number,
    createWishDto: CreateWishDto,
  ): Promise<void> {
    await this.create({
      ...createWishDto,
      raised: 0,
      copied: 0,
      owner: { id: userId } as User,
    });
  }

  async findWishById(id: number): Promise<Wish> {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: { owner: true, offers: { user: true } },
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    return {
      ...wish,
      owner: this.usersService.removePasswordAndEmail(wish.owner),
      offers: wish.offers.map((offer) => ({
        ...offer,
        user: this.usersService.removePasswordAndEmail(offer.user),
      })),
    } as Wish;
  }

  async updateWish(
    wishId: number,
    userId: number,
    updateWishDto: UpdateWishDto,
  ): Promise<void> {
    const wish = await this.wishRepository.findOne({
      where: { id: wishId },
      relations: { owner: true, offers: true },
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    if (userId !== wish.owner.id) {
      throw new ForbiddenException('Можно редактировать только свои подарки');
    }

    if (wish.offers.length > 0) {
      throw new BadRequestException(
        'Нельзя изменить подарок, на который уже скинулись',
      );
    }

    if (updateWishDto.price !== undefined && Number(wish.raised) > 0) {
      throw new BadRequestException(
        'Нельзя изменить стоимость подарка, если уже есть желающие скинуться',
      );
    }

    const updateData: Partial<Wish> = { ...updateWishDto };

    await this.updateOne({ id: wishId }, updateData);
  }

  async removeWish(id: number, userId: number): Promise<Wish> {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: { owner: true },
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    if (userId !== wish.owner.id) {
      throw new ForbiddenException('Можно удалять только свои подарки');
    }

    await this.removeOne({ id });

    return wish;
  }

  async copyWish(id: number, user: User): Promise<void> {
    const wish = await this.wishRepository.findOne({ where: { id } });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    await this.updateOne({ id }, { copied: wish.copied + 1 });

    await this.create({
      name: wish.name,
      link: wish.link,
      image: wish.image,
      price: wish.price,
      description: wish.description,
      raised: 0,
      copied: 0,
      owner: user,
    });
  }

  findLast(): Promise<Wish[]> {
    return this.find({
      order: { createdAt: 'DESC' },
      take: 40,
      relations: { owner: true, offers: true },
    }).then(
      (wishes) =>
        wishes.map((wish) => ({
          ...wish,
          owner: this.usersService.removePasswordAndEmail(wish.owner),
        })) as Wish[],
    );
  }

  findTop(): Promise<Wish[]> {
    return this.find({
      order: { copied: 'DESC' },
      take: 10,
      relations: { owner: true, offers: true },
    }).then(
      (wishes) =>
        wishes.map((wish) => ({
          ...wish,
          owner: this.usersService.removePasswordAndEmail(wish.owner),
        })) as Wish[],
    );
  }

  async updateRaisedAmount(wish: Wish, amount: number): Promise<void> {
    await this.updateOne(
      { id: wish.id },
      { raised: Number(wish.raised) + amount },
    );
  }
}
