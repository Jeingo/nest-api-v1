import { StatusLikeType } from '../../types/types';

export class OutputPostLikeDto {
  id: string;
  userId: string;
  postId: string;
  myStatus: StatusLikeType;
  login: string;
  addedAt: string;
}
