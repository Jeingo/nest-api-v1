import { Direction } from '../../types/types';

export type QueryUsers = {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
  sortBy: string;
  sortDirection: Direction;
  pageNumber: string;
  pageSize: string;
};
