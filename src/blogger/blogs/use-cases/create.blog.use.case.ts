import { CommandHandler } from '@nestjs/cqrs';
import { InputCreateBlogDto } from '../dto/input.create.blog.dto';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { DbId } from '../../../global-types/global.types';
import { CurrentUserType } from '../../../auth/types/current.user.type';

export class CreateBlogCommand {
  constructor(
    public createBlogDto: InputCreateBlogDto,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand): Promise<DbId> {
    const { name, description, websiteUrl } = command.createBlogDto;
    const createdBlog = this.blogsRepository.create(
      name,
      description,
      websiteUrl,
      command.user.userId,
      command.user.login
    );
    await this.blogsRepository.save(createdBlog);
    return createdBlog._id;
  }
}
