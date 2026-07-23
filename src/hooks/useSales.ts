'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/services/api';
import { PaymentMethod } from '@/types/database';

export function useSales(filters?: {
  category_id?: string;
  product_id?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  const queryClient = useQueryClient();

  const salesQuery = useQuery({
    queryKey: ['sales', filters],
    queryFn: () => api.getSales(filters),
  });

  const recordSaleMutation = useMutation({
    mutationFn: (saleData: {
      product_id: string;
      quantity_sold: number;
      unit_price_at_sale?: number;
      customer_name?: string;
      payment_method?: PaymentMethod;
      notes?: string;
      sale_date?: string;
    }) => api.recordSale(saleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const recordMultiSaleMutation = useMutation({
    mutationFn: (saleData: {
      items: Array<{
        product_id: string;
        quantity_sold: number;
        unit_price_at_sale?: number;
      }>;
      customer_name?: string;
      payment_method?: PaymentMethod;
      notes?: string;
      sale_date?: string;
    }) => api.recordMultiSale(saleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteSaleMutation = useMutation({
    mutationFn: (id: string) => api.deleteSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    sales: salesQuery.data || [],
    isLoading: salesQuery.isLoading,
    isError: salesQuery.isError,
    refetch: salesQuery.refetch,
    recordSale: recordSaleMutation.mutateAsync,
    isRecording: recordSaleMutation.isPending,
    recordMultiSale: recordMultiSaleMutation.mutateAsync,
    isRecordingMulti: recordMultiSaleMutation.isPending,
    deleteSale: deleteSaleMutation.mutateAsync,
    isDeleting: deleteSaleMutation.isPending,
  };
}
