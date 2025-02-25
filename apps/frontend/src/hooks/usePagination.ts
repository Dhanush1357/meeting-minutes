import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

interface UsePaginationOptions<T, P = {}> {
  fetchFn: (params: any, page: number, pageSize: number) => Promise<PaginatedResponse<T>>;
  initialParams?: P;
  pageSize?: number;
}

export function usePagination<T>({ fetchFn, initialParams = {}, pageSize = 10 }: UsePaginationOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [params, setParams] = useState(initialParams);

  const fetchData = useCallback(
    async (page: number, updatedParams: any) => {
      try {
        setLoading(true);
        const response = await fetchFn(updatedParams, page, pageSize);
        setData(response?.data);
        setMeta(response?.meta);
        setPageCount(response?.meta?.totalPages);
        setCurrentPage(response?.meta?.currentPage);
      } catch (error) {
        toast.error("Failed to fetch data");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, pageSize]
  );

  const goToPage = useCallback(
    (page: number) => {
      fetchData(page, params);
    },
    [fetchData, params]
  );

  const refetch = useCallback(() => {
    return fetchData(currentPage, params);
  }, [fetchData, currentPage, params]);

  const updateParams = useCallback((newParams: any) => {
    setParams((prevParams) => ({ ...prevParams, ...newParams }));
    fetchData(1, { ...params, ...newParams });
  }, [fetchData, params]);

  useEffect(() => {
    fetchData(1, params);
  }, [fetchData, params]);

  return {
    data,
    loading,
    pageCount,
    currentPage,
    goToPage,
    meta,
    refetch,
    updateParams,
  };
}