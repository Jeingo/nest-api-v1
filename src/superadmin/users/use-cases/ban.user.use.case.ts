import { CommandHandler } from '@nestjs/cqrs';
import { DbId } from '../../../global-types/global.types';
import { UsersRepository } from '../../../users/users.repository';
import { InputBanUserDto } from '../dto/input.ban.user.dto';
import { PostsRepository } from '../../../posts/posts.repository';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { CommentsRepository } from '../../../comments/comments.repository';
import { CommentLikesRepository } from '../../../comment-likes/comment.likes.repository';
import { PostLikesRepository } from '../../../post-likes/post.likes.repository';
import { SessionsRepository } from '../../../sessions/sessions.repository';
import { NotFoundException } from '@nestjs/common';

export class BanUserCommand {
  constructor(public banUserDto: InputBanUserDto, public id: DbId) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly commentLikesRepository: CommentLikesRepository,
    private readonly postLikesRepository: PostLikesRepository,
    private readonly sessionsRepository: SessionsRepository
  ) {}

  async execute(command: BanUserCommand): Promise<boolean> {
    const { isBanned, banReason } = command.banUserDto;
    const isBannedBoolean = isBanned == 'true';

    const user = await this.usersRepository.getById(command.id);
    if (!user) throw new NotFoundException();

    const blogs = await this.blogsRepository.getByUserId(command.id.toString());
    const posts = await this.postsRepository.getByUserId(command.id.toString());
    const comments = await this.commentsRepository.getByUserId(
      command.id.toString()
    );
    const commentLikes = await this.commentLikesRepository.getByUserId(
      command.id.toString()
    );
    const postLikes = await this.postLikesRepository.getByUserId(
      command.id.toString()
    );

    user.ban(isBannedBoolean, banReason);
    blogs.map((doc) => doc.ban(isBannedBoolean));
    posts.map((doc) => doc.ban(isBannedBoolean));
    comments.map((doc) => doc.ban(isBannedBoolean));
    commentLikes.map((doc) => doc.ban(isBannedBoolean));
    postLikes.map((doc) => doc.ban(isBannedBoolean));

    await this.usersRepository.save(user);
    blogs.map((doc) => this.blogsRepository.save(doc));
    posts.map((doc) => this.postsRepository.save(doc));
    comments.map((doc) => this.commentsRepository.save(doc));
    commentLikes.map((doc) => this.commentLikesRepository.save(doc));
    postLikes.map((doc) => this.postLikesRepository.save(doc));

    await this.sessionsRepository.deleteByUserId(command.id.toString());

    return true;
  }
}
