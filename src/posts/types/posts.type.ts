import { DirectionType } from '../../types/types';

export type QueryPosts = {
  sortBy: string;
  sortDirection: DirectionType;
  pageNumber: string;
  pageSize: string;
};
export type NewestLikesType = {
  addedAt: string;
  userId: string;
  login: string;
};
