import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

@Controller('blogger/blogs')
export class SuperAdminUsersController {
  constructor(private readonly commandBus: CommandBus) {}
}
