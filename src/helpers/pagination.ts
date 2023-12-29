export const pagination = (
  items: any[],
  pageSize: number,
  pageNumber: number,
) => {
  return {
    movies: items.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
    totalCount: items.length,
    totalPages: Math.ceil(items.length / pageSize),
  };
};
