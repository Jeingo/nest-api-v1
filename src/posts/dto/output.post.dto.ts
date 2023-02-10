import { StatusLikeType } from '../../types/types';
import { NewestLikesType } from '../types/posts.type';

export class OutputPostDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: StatusLikeType;
    newestLikes: Array<NewestLikesType>;
  };
}
