import { CommentDocument } from '../../application/entities/comment.entity';
import { CommentLikeDocument } from '../../../comment-likes/application/entities/comment.like.entity';

export type CommentsAndLikesRepositoryType = {
  commentDocument: CommentDocument;
  commentLikeDocument: CommentLikeDocument;
};
