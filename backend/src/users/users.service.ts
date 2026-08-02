import {
  ConflictException,
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
import { HashService } from '../hash/hash.service';
import { User } from './entities/user.entity';
import { FindUsersDto } from './dto/find-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashService: HashService,
  ) {}

  removePassword(user: User) {
    const { password, ...result } = user;
    void password;
    return result;
  }

  removePasswordAndEmail(user: User) {
    const { password, email, ...result } = user;
    void password;
    void email;
    return result;
  }

  create(data: Partial<User>): Promise<User> {
    return this.userRepository.save(data);
  }

  findOne(query: FindOptionsWhere<User>): Promise<User | null> {
    return this.userRepository.findOne({ where: query });
  }

  find(query: FindManyOptions<User>): Promise<User[]> {
    return this.userRepository.find(query);
  }

  findMany(findUsersDto: FindUsersDto): Promise<User[]> {
    const { query } = findUsersDto;
    return this.userRepository.find({
      where: [{ email: query }, { username: query }],
    });
  }

  async findOneByUsername(username: string): Promise<User> {
    const user = await this.findOne({ username });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async findOneById(id: number): Promise<User> {
    const user = await this.findOne({ id });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async updateMe(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.username) {
      const existing = await this.findOne({ username: updateUserDto.username });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          'Пользователь с таким email или username уже зарегистрирован',
        );
      }
    }

    if (updateUserDto.email) {
      const existing = await this.findOne({ email: updateUserDto.email });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          'Пользователь с таким email или username уже зарегистрирован',
        );
      }
    }

    const updateData: Partial<User> = { ...updateUserDto };

    if (updateUserDto.password) {
      updateData.password = await this.hashService.hash(updateUserDto.password);
    }

    await this.updateOne({ id }, updateData);

    return this.findOneById(id);
  }

  async getUserWishesById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { wishes: { owner: true, offers: { user: true } } },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user.wishes.map((wish) => ({
      ...wish,
      owner: this.removePasswordAndEmail(wish.owner),
      offers: wish.offers.map((offer) => ({
        ...offer,
        user: this.removePasswordAndEmail(offer.user),
      })),
    }));
  }

  async getUserWishesByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: { wishes: { offers: { user: true } } },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user.wishes.map((wish) => {
      const { owner, ...wishData } = wish;
      void owner;
      return {
        ...wishData,
        offers: wish.offers.map((offer) => ({
          ...offer,
          user: this.removePasswordAndEmail(offer.user),
        })),
      };
    });
  }

  updateOne(
    query: FindOptionsWhere<User>,
    data: Partial<User>,
  ): Promise<UpdateResult> {
    return this.userRepository.update(query, data);
  }

  removeOne(query: FindOptionsWhere<User>): Promise<DeleteResult> {
    return this.userRepository.delete(query);
  }
}
