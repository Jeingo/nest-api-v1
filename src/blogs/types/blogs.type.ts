import { DirectionType } from '../../types/types';

export type QueryBlogs = {
  searchNameTerm?: string;
  sortBy: string;
  sortDirection: DirectionType;
  pageNumber: string;
  pageSize: string;
};
