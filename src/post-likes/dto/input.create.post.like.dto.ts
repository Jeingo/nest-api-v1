import { StatusLikeType } from '../../types/types';

export class InputCreatePostLikeDto {
  userId: string;
  postId: string;
  myStatus: StatusLikeType;
  login: string;
}
