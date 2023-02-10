import { Direction } from '../../types/types';

export type QueryComments = {
  sortBy: string;
  sortDirection: Direction;
  pageNumber: string;
  pageSize: string;
};
