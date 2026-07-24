'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/services/api';
import { ExpenseCategory } from '@/types/database';

export function useExpenses(filters?: {
  startDate?: string;
  endDate?: string;
}) {
  const queryClient = useQueryClient();

  const expensesQuery = useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => api.getExpenses(filters),
  });

  const createExpenseMutation = useMutation({
    mutationFn: (expenseData: {
      title: string;
      amount: number;
      category?: ExpenseCategory;
      expense_date?: string;
      notes?: string;
    }) => api.createExpense(expenseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => api.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    expenses: expensesQuery.data || [],
    isLoading: expensesQuery.isLoading,
    isError: expensesQuery.isError,
    refetch: expensesQuery.refetch,
    createExpense: createExpenseMutation.mutateAsync,
    isCreating: createExpenseMutation.isPending,
    deleteExpense: deleteExpenseMutation.mutateAsync,
    isDeleting: deleteExpenseMutation.isPending,
  };
}
