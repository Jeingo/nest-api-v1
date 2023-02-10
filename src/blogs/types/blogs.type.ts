import { Direction } from '../../types/types';

export type QueryBlogs = {
  searchNameTerm?: string;
  sortBy: string;
  sortDirection: Direction;
  pageNumber: string;
  pageSize: string;
};
