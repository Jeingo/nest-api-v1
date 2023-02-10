import { Direction } from '../../types/types';

export type QueryPosts = {
  sortBy: string;
  sortDirection: Direction;
  pageNumber: string;
  pageSize: string;
};
export type NewestLikesType = {
  addedAt: string;
  userId: string;
  login: string;
};
