import { Types } from 'mongoose';

export type DbId = Types.ObjectId;
export type DirectionType = 'asc' | 'desc';
export type StatusLikeType = 'None' | 'Like' | 'Dislike';
