import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  NotFoundException
} from '@nestjs/common';
import { UsersService } from './users.service';
import { InputCreateUserDto } from './dto/input.create.user.dto';
import { OutputUserDto } from './dto/output.user.dto';
import { UsersQueryRepository } from './users.query.repository';
import { QueryUsers } from './types/users.type';
import { Types } from 'mongoose';
import { PaginatedType } from '../helper/query/types.query.repository.helper';
import { BasicGuard } from '../helper/guards/basic.guard';

@UseGuards(BasicGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() createUserDto: InputCreateUserDto
  ): Promise<OutputUserDto> {
    const createdUserId = await this.usersService.create(createUserDto);
    return await this.usersQueryRepository.getById(createdUserId);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() query: QueryUsers
  ): Promise<PaginatedType<OutputUserDto>> {
    return await this.usersQueryRepository.getAll(query);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException();
    return this.usersService.remove(new Types.ObjectId(id));
  }
}
