import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { HashService } from '../hash/hash.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  async validatePassword(
    username: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.usersService.findOne({ username });

    if (!user) {
      return null;
    }

    const isValid = await this.hashService.verify(password, user.password);

    if (!isValid) {
      return null;
    }

    return user;
  }

  login(user: Pick<User, 'id'>) {
    return {
      access_token: this.jwtService.sign({ sub: user.id }),
    };
  }

  async signup(createUserDto: CreateUserDto) {
    const userByUsername = await this.usersService.findOne({
      username: createUserDto.username,
    });
    const userByEmail = await this.usersService.findOne({
      email: createUserDto.email,
    });

    if (userByUsername || userByEmail) {
      throw new ConflictException(
        'Пользователь с таким email или username уже зарегистрирован',
      );
    }

    const hashedPassword = await this.hashService.hash(createUserDto.password);

    const user = await this.usersService.create({
      username: createUserDto.username,
      email: createUserDto.email,
      password: hashedPassword,
      about: createUserDto.about ?? 'Пока ничего не рассказал о себе',
      avatar: createUserDto.avatar ?? 'https://i.pravatar.cc/300',
    });

    return this.usersService.removePasswordAndEmail(user);
  }
}
