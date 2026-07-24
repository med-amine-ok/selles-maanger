'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useExpenses } from '@/hooks/useExpenses';
import { useToast } from '@/lib/context/ToastContext';
import { ExpenseCategory } from '@/types/database';
import { formatDZD } from '@/lib/utils';
import { Receipt, DollarSign, Calendar, Tag } from 'lucide-react';

const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  category: z.enum(['stock_purchase', 'supplies', 'transport', 'utilities', 'other']),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose }) => {
  const { createExpense, isCreating } = useExpenses();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: '',
      amount: 0,
      category: 'stock_purchase',
      notes: '',
    },
  });

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      await createExpense({
        title: data.title,
        amount: Math.round(data.amount),
        category: data.category as ExpenseCategory,
        notes: data.notes,
      });

      showToast(
        'Expense Recorded 💸',
        `Spent ${formatDZD(data.amount)} on "${data.title}"`,
        'success'
      );

      reset();
      onClose();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to record expense', 'error');
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="💸 Record Business Purchase / Expense"
      description="Track money spent on stock, supplies, transport, and operating costs"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title Input */}
        <Input
          label="Purchase / Expense Title"
          placeholder="e.g. Bulk Honey Jars Purchase, Fuel, Transport"
          {...register('title')}
          error={errors.title?.message}
        />

        {/* Category & Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Category"
            options={[
              { value: 'stock_purchase', label: 'Stock Purchase 📦' },
              { value: 'supplies', label: 'Supplies 🍯' },
              { value: 'transport', label: 'Transport & Fuel 🚚' },
              { value: 'utilities', label: 'Utilities & Rent 💡' },
              { value: 'other', label: 'Other Expense 📝' },
            ]}
            {...register('category')}
            error={errors.category?.message}
          />

          <Input
            label="Amount Spent (DZD)"
            type="number"
            step="1"
            placeholder="e.g. 15000"
            {...register('amount')}
            error={errors.amount?.message}
          />
        </div>

        {/* Notes */}
        <Input
          label="Notes (Optional)"
          placeholder="Supplier info, invoice details, etc."
          {...register('notes')}
          error={errors.notes?.message}
        />

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[#EBEBE6] flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="gold" isLoading={isCreating} className="flex-1">
            Record Expense
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
