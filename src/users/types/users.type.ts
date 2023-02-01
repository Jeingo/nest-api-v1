import { DirectionType } from '../../types/types';

export type QueryUsers = {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
  sortBy: string;
  sortDirection: DirectionType;
  pageNumber: string;
  pageSize: string;
};
