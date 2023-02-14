import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SuperAdminUsersQueryRepository } from './superadmin.users.query.repository';
import { BasicAuthGuard } from '../../auth/guards/basic.auth.guard';
import { InputCreateUserDto } from './dto/input.create.user.dto';
import { OutputUserDto } from './dto/output.user.dto';
import { CreateUserCommand } from './use-cases/create.user.use.case';
import { QueryUsers } from './types/query.users.type';
import { PaginatedType } from '../../helper/query/types.query.repository.helper';
import { CheckIdAndParseToDBId } from '../../helper/pipes/check.id.validator.pipe';
import { DbId } from '../../global-types/global.types';
import { RemoveUserCommand } from './use-cases/remove.user.use.case';

@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class SuperAdminUsersController {
  constructor(
    private readonly superAdminUsersQueryRepository: SuperAdminUsersQueryRepository,
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
    return await this.superAdminUsersQueryRepository.getById(createdUserId);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() query: QueryUsers
  ): Promise<PaginatedType<OutputUserDto>> {
    return await this.superAdminUsersQueryRepository.getAll(query);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id', new CheckIdAndParseToDBId()) id: DbId) {
    await this.commandBus.execute(new RemoveUserCommand(id));
    return;
  }
}
