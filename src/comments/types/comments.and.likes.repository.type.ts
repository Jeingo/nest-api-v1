import { CommentDocument } from '../entities/comment.entity';
import { CommentLikeDocument } from '../../comment-likes/entities/comment.like.entity';

export type CommentsAndLikesRepositoryType = {
  commentDocument: CommentDocument;
  commentLikeDocument: CommentLikeDocument;
};
