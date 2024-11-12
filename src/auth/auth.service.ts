import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const passHash = await bcrypt.hash(password, 10);

      const user = await this.userModel.create({
        ...userData,
        password: passHash,
      });

      // Convertir el documento de Mongoose a un objeto JavaScript
      const userObject = user.toObject();

      // Eliminar el campo `password` antes de retornar
      delete userObject.password;

      return {
        ...userObject,
        token: this.getJwtToken({
          _id: userObject._id.toString(),
        }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Convertir el documento de Mongoose a un objeto JavaScript
    const userObject = user.toObject();

    // Eliminar el campo `password` antes de retornar
    delete userObject.password;

    return {
      ...userObject,
      token: this.getJwtToken({
        _id: userObject._id.toString(),
      }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBErrors(error: any): never {
    if (error.code === 11000) {
      throw new BadRequestException(error.errmsg);
    }

    console.log(error);
    throw new InternalServerErrorException('Please check server logs');
  }
}
