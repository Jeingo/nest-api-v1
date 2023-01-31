import { Types } from 'mongoose';

export type Direction = 'asc' | 'desc';

export type BlogId = Types.ObjectId;

export type QueryBlogs = {
  searchNameTerm?: string;
  sortBy: string;
  sortDirection: Direction;
  pageNumber: string;
  pageSize: string;
};
