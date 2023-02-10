import { LikeStatus } from '../../types/types';

export class OutputCommentLikeDto {
  id: string;
  userId: string;
  commentId: string;
  myStatus: LikeStatus;
}
