import { Pagination } from 'src/common/@types/index';

export const calculateTotalPages = (total: number, limit: number): number => {
  return Math.ceil(total / limit);
};

export const calculateNextPage = (
  currentPage: number,
  totalPages: number,
): number | null => {
  if (currentPage >= totalPages) return null;
  return currentPage + 1;
};

export const paginateData = (pageNo = '1', pageSize = '10') => {
  const page = parseInt(pageNo, 10);
  const limit = parseInt(pageSize, 10);

  const skip = limit * (page - 1);

  return {
    skip,
    take: limit,
    page,
    limit,
  };
};

export const paginationMeta = ({
  totalItems,
  page,
  limit,
}: {
  totalItems: number;
  page: number;
  limit: number;
}): Pagination => {
  const numberOfPages = calculateTotalPages(totalItems, limit);
  const next = calculateNextPage(page, numberOfPages);

  return {
    current: page,
    perPage: limit,
    numberOfPages,
    totalItems,
    next,
  };
};
