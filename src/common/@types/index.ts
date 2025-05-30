import { Response } from 'express';

export interface QueryParams {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  withUser?: string;
  userId?: string;
}

export class Pagination {
  current: number;
  perPage: number;
  numberOfPages: number;
  next: number | null;
  totalItems: number;
}

export interface PaginationOptions {
  select?: {
    [key: string]: boolean;
  };
  skip?: number;
  take?: number;
}

export enum SearchBy {
  eventName = 'eventName',
  organizerName = 'organizerName',
  category = 'category',
  location = 'location',
  email = 'email',
  ticketId = 'ticketId',
}

export interface FilterParams {
  status?: string;
  category?: string;
  userId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}
