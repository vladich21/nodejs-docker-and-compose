import {
  BadRequestException,
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
import { WishesService } from '../wishes/wishes.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly wishesService: WishesService,
    private readonly usersService: UsersService,
  ) {}

  create(data: Partial<Offer>): Promise<Offer> {
    return this.offerRepository.save(data);
  }

  findOne(query: FindOptionsWhere<Offer>): Promise<Offer | null> {
    return this.offerRepository.findOne({ where: query });
  }

  find(query: FindManyOptions<Offer>): Promise<Offer[]> {
    return this.offerRepository.find(query);
  }

  updateOne(
    query: FindOptionsWhere<Offer>,
    data: Partial<Offer>,
  ): Promise<UpdateResult> {
    return this.offerRepository.update(query, data);
  }

  removeOne(query: FindOptionsWhere<Offer>): Promise<DeleteResult> {
    return this.offerRepository.delete(query);
  }

  async createOffer(user: User, createOfferDto: CreateOfferDto): Promise<void> {
    const { itemId, amount, hidden } = createOfferDto;
    const [wish] = await this.wishesService.find({
      where: { id: itemId },
      relations: { owner: true },
    });

    if (!wish) {
      throw new BadRequestException('Подарок не найден');
    }

    const raised = Number(wish.raised);
    const price = Number(wish.price);

    if (user.id === wish.owner.id) {
      throw new BadRequestException(
        'Нельзя вносить деньги на собственные подарки',
      );
    }

    if (raised >= price) {
      throw new BadRequestException(
        'Нельзя скинуться на подарки, на которые уже собраны деньги',
      );
    }

    if (amount + raised > price) {
      throw new BadRequestException(
        'Сумма вносимых средств не может превышать стоимость подарка',
      );
    }

    await this.wishesService.updateRaisedAmount(wish, amount);

    await this.create({
      amount,
      hidden,
      item: wish,
      user,
    });
  }

  findAll(): Promise<Offer[]> {
    return this.offerRepository
      .find({ relations: { user: true, item: { owner: true } } })
      .then(
        (offers) =>
          offers.map((offer) => ({
            ...offer,
            user: this.usersService.removePasswordAndEmail(offer.user),
            item: {
              ...offer.item,
              owner: this.usersService.removePasswordAndEmail(offer.item.owner),
            },
          })) as Offer[],
      );
  }

  async findOfferById(id: number): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: { id },
      relations: { user: true, item: { owner: true } },
    });

    if (!offer) {
      throw new NotFoundException('Заявка не найдена');
    }

    return {
      ...offer,
      user: this.usersService.removePasswordAndEmail(offer.user),
      item: {
        ...offer.item,
        owner: this.usersService.removePasswordAndEmail(offer.item.owner),
      },
    } as Offer;
  }
}
