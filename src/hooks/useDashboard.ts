'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/services/api';
import { TimeRangeFilter, CustomDateRange } from '@/types/database';

export function useDashboard(timeRange: TimeRangeFilter = 'month', customRange?: CustomDateRange) {
  const metricsQuery = useQuery({
    queryKey: ['dashboard', 'metrics', timeRange, customRange],
    queryFn: () => api.getDashboardMetrics(timeRange, customRange),
  });

  const trendQuery = useQuery({
    queryKey: ['dashboard', 'trend', timeRange, customRange],
    queryFn: () => api.getRevenueTrend(timeRange, customRange),
  });

  const categoryQuery = useQuery({
    queryKey: ['dashboard', 'categories', timeRange, customRange],
    queryFn: () => api.getCategoryDistribution(timeRange, customRange),
  });

  const topProductsQuery = useQuery({
    queryKey: ['dashboard', 'topProducts', timeRange, customRange],
    queryFn: () => api.getTopProducts(timeRange, 5, customRange),
  });

  return {
    metrics: metricsQuery.data,
    isLoadingMetrics: metricsQuery.isLoading,
    trend: trendQuery.data || [],
    isLoadingTrend: trendQuery.isLoading,
    categoryDistribution: categoryQuery.data || [],
    isLoadingCategories: categoryQuery.isLoading,
    topProducts: topProductsQuery.data || [],
    isLoadingTopProducts: topProductsQuery.isLoading,
    isError: metricsQuery.isError || trendQuery.isError,
  };
}
