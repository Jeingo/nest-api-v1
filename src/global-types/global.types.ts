import { Types } from 'mongoose';

export type DbId = Types.ObjectId;

export enum Direction {
  ASC = 'asc',
  DESC = 'desc'
}

export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  DisLike = 'Dislike'
}