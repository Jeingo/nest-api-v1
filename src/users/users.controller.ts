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
  UseGuards
} from '@nestjs/common';
import { InputCreateUserDto } from './dto/input.create.user.dto';
import { OutputUserDto } from './dto/output.user.dto';
import { UsersQueryRepository } from './users.query.repository';
import { QueryUsers } from './types/users.type';
import { PaginatedType } from '../helper/query/types.query.repository.helper';
import { CheckIdAndParseToDBId } from '../helper/pipes/check.id.validator.pipe';
import { DbId } from '../global-types/global.types';
import { BasicAuthGuard } from '../auth/guards/basic.auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from './use-cases/create.user.use.case';
import { RemoveUserCommand } from './use-cases/remove.user.use.case';

@UseGuards(BasicAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commandBus: CommandBus
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() createUserDto: InputCreateUserDto
  ): Promise<OutputUserDto> {
    const createdUserId = await this.commandBus.execute(
      new CreateUserCommand(createUserDto)
    );
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
  async remove(@Param('id', new CheckIdAndParseToDBId()) id: DbId) {
    await this.commandBus.execute(new RemoveUserCommand(id));
    return;
  }
}
