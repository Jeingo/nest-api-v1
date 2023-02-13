import { CommandHandler } from '@nestjs/cqrs';
import { DbId, LikeStatus } from '../../global-types/global.types';
import { PostsRepository } from '../posts.repository';
import { NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../blogs/blogs.repository';
import { PostLikesRepository } from '../../post-likes/post.likes.repository';

export class UpdateStatusLikeInPostCommand {
  constructor(
    public userId: string,
    public postId: DbId,
    public login: string,
    public newLikeStatus: LikeStatus
  ) {}
}

@CommandHandler(UpdateStatusLikeInPostCommand)
export class UpdateStatusLikeInPostUseCase {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly postLikesRepository: PostLikesRepository
  ) {}

  async execute(command: UpdateStatusLikeInPostCommand): Promise<boolean> {
    let lastLikeStatus: LikeStatus = LikeStatus.None;

    const post = await this.postsRepository.getById(command.postId);
    if (!post) throw new NotFoundException();
    let like = await this.postLikesRepository.getByUserIdAndPostId(
      command.userId,
      command.postId.toString()
    );
    if (!like) {
      like = this.postLikesRepository.create(
        command.userId,
        command.postId.toString(),
        command.newLikeStatus,
        command.login
      );
    } else {
      lastLikeStatus = like.myStatus;
      like.update(command.newLikeStatus);
    }
    post.updateLike(lastLikeStatus, command.newLikeStatus);

    await this.postLikesRepository.save(like);
    await this.postsRepository.save(post);
    return true;
  }
}
