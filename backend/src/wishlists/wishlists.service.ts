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
import { Wish } from '../wishes/entities/wish.entity';
import { UsersService } from '../users/users.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly usersService: UsersService,
  ) {}

  create(data: Partial<Wishlist>): Promise<Wishlist> {
    return this.wishlistRepository.save(data);
  }

  findOne(query: FindOptionsWhere<Wishlist>): Promise<Wishlist | null> {
    return this.wishlistRepository.findOne({ where: query });
  }

  find(query: FindManyOptions<Wishlist>): Promise<Wishlist[]> {
    return this.wishlistRepository.find(query);
  }

  updateOne(
    query: FindOptionsWhere<Wishlist>,
    data: Partial<Wishlist>,
  ): Promise<UpdateResult> {
    return this.wishlistRepository.update(query, data);
  }

  removeOne(query: FindOptionsWhere<Wishlist>): Promise<DeleteResult> {
    return this.wishlistRepository.delete(query);
  }

  async createWishlist(
    userId: number,
    createWishlistDto: CreateWishlistDto,
  ): Promise<Wishlist> {
    const { name, image, itemsId } = createWishlistDto;
    const items = itemsId.map((id) => ({ id }) as Wish);

    const wishlist = this.wishlistRepository.create({
      name,
      image,
      description: '',
      items,
      owner: { id: userId },
    });

    const saved = await this.create(wishlist);

    return this.findWishlistById(saved.id);
  }

  findAll(): Promise<Wishlist[]> {
    return this.wishlistRepository
      .find({ relations: { owner: true, items: true } })
      .then(
        (wishlists) =>
          wishlists.map((wishlist) => ({
            ...wishlist,
            owner: this.usersService.removePasswordAndEmail(wishlist.owner),
          })) as Wishlist[],
      );
  }

  async findWishlistById(id: number): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: { owner: true, items: true },
    });

    if (!wishlist) {
      throw new NotFoundException('Список подарков не найден');
    }

    return {
      ...wishlist,
      owner: this.usersService.removePasswordAndEmail(wishlist.owner),
    } as Wishlist;
  }

  async updateWishlist(
    id: number,
    userId: number,
    updateWishlistDto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: { owner: true },
    });

    if (!wishlist) {
      throw new NotFoundException('Список подарков не найден');
    }

    if (userId !== wishlist.owner.id) {
      throw new ForbiddenException(
        'Можно редактировать только свои подборки подарков',
      );
    }

    const { itemsId, ...rest } = updateWishlistDto;
    const updateData: Partial<Wishlist> = { ...rest, id };

    if (itemsId) {
      updateData.items = itemsId.map((itemId) => ({ id: itemId }) as Wish);
    }

    await this.create(updateData);

    return this.findWishlistById(id);
  }

  async removeWishlist(id: number, userId: number): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: { owner: true },
    });

    if (!wishlist) {
      throw new NotFoundException('Список подарков не найден');
    }

    if (userId !== wishlist.owner.id) {
      throw new BadRequestException(
        'Можно удалять только свои подборки подарков',
      );
    }

    await this.removeOne({ id });

    return {
      ...wishlist,
      owner: this.usersService.removePasswordAndEmail(wishlist.owner),
    } as Wishlist;
  }
}
