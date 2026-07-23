'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/services/api';
import { Product } from '@/types/database';

export function useProducts(categoryId?: string, search?: string) {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ['products', categoryId, search],
    queryFn: () => api.getProducts(categoryId, search),
  });

  const createProductMutation = useMutation({
    mutationFn: (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => api.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) => api.updateProduct(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const archiveProductMutation = useMutation({
    mutationFn: (id: string) => api.archiveProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const restockMutation = useMutation({
    mutationFn: ({ id, quantityToAdd }: { id: string; quantityToAdd: number }) =>
      api.restockProduct(id, quantityToAdd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    products: productsQuery.data || [],
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    error: productsQuery.error,
    refetch: productsQuery.refetch,
    createProduct: createProductMutation.mutateAsync,
    isCreating: createProductMutation.isPending,
    updateProduct: updateProductMutation.mutateAsync,
    isUpdating: updateProductMutation.isPending,
    archiveProduct: archiveProductMutation.mutateAsync,
    isArchiving: archiveProductMutation.isPending,
    restockProduct: restockMutation.mutateAsync,
    isRestocking: restockMutation.isPending,
  };
}
