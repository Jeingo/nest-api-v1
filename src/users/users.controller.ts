import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
  HttpStatus,
  Query
} from '@nestjs/common';
import { UsersService } from './users.service';
import { InputCreateUserDto } from './dto/input.create.user.dto';
import { OutputUserDto } from './dto/output.user.dto';
import { UsersQueryRepository } from './users.query.repository';
import { QueryUsers } from './types/users.type';
import { PaginatedType } from '../helper/types.query.repository.helper';

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

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
