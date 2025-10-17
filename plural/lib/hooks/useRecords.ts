import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchRecords, fetchStats, fetchFilterOptions, fetchRecord, type RecordsFilters, type StatsFilters } from '../services/records';

// Query keys
export const queryKeys = {
  records: {
    all: ['records'] as const,
    lists: () => [...queryKeys.records.all, 'list'] as const,
    list: (filters: RecordsFilters) => [...queryKeys.records.lists(), filters] as const,
    details: () => [...queryKeys.records.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.records.details(), id] as const,
  },
  stats: {
    all: ['stats'] as const,
    list: (filters: StatsFilters) => [...queryKeys.stats.all, filters] as const,
  },
  filters: {
    all: ['filters'] as const,
    options: (facilityId?: string) => [...queryKeys.filters.all, facilityId] as const,
  },
};

// Hook to fetch records with filters
export const useRecords = (filters: RecordsFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.records.list(filters),
    queryFn: () => fetchRecords(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch statistics
export const useStats = (filters: StatsFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.stats.list(filters),
    queryFn: () => fetchStats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch filter options
export const useFilterOptions = (facilityId?: string) => {
  return useQuery({
    queryKey: queryKeys.filters.options(facilityId),
    queryFn: () => fetchFilterOptions(facilityId),
    staleTime: 15 * 60 * 1000, // 15 minutes (filter options change less frequently)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook to fetch single record
export const useRecord = (id: string) => {
  return useQuery({
    queryKey: queryKeys.records.detail(id),
    queryFn: () => fetchRecord(id),
    enabled: !!id, // Only run query if id exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to invalidate records cache
export const useInvalidateRecords = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: queryKeys.records.all }),
    invalidateList: () => queryClient.invalidateQueries({ queryKey: queryKeys.records.lists() }),
    invalidateStats: () => queryClient.invalidateQueries({ queryKey: queryKeys.stats.all }),
    invalidateFilters: () => queryClient.invalidateQueries({ queryKey: queryKeys.filters.all }),
  };
};
