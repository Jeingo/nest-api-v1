import { Types } from 'mongoose';

export type DbId = Types.ObjectId;
export type DirectionType = 'asc' | 'desc';

export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  DisLike = 'Dislike'
}
