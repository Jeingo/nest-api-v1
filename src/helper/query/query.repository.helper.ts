import { PaginatedType } from './types.query.repository.helper';
import { Direction } from '../../global-types/global.types';

export const getPaginatedType = <T>(
  items: T[],
  pageSize: number,
  pageNumber: number,
  countDoc: number
): PaginatedType<T> => {
  return {
    pagesCount: Math.ceil(countDoc / pageSize),
    page: pageNumber,
    pageSize: pageSize,
    totalCount: countDoc,
    items: items
  };
};

export const makeDirectionToNumber = (val: Direction) =>
  val === Direction.DESC ? -1 : 1;
