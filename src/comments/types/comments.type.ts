import { DirectionType } from '../../types/types';

export type QueryComments = {
  sortBy: string;
  sortDirection: DirectionType;
  pageNumber: string;
  pageSize: string;
};
