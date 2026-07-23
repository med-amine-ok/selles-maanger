'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/lib/context/ToastContext';
import { Product } from '@/types/database';

const productSchema = z.object({
  category_slug: z.enum(['honey', 'fruits']),
  name: z.string().min(1, 'Product name is required'),
  selling_price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  stock_quantity: z.coerce.number().int('Stock must be a whole number').min(0, 'Stock must be 0 or greater'),
});

type ProductFormData = z.infer<typeof productSchema>;

export interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit = null,
}) => {
  const { createProduct, updateProduct, isCreating, isUpdating } = useProducts();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category_slug: 'honey',
      name: '',
      selling_price: 0,
      stock_quantity: 10,
    },
  });

  useEffect(() => {
    if (productToEdit) {
      const isHoney =
        productToEdit.category?.slug === 'honey' || productToEdit.category_id.includes('1111');

      reset({
        category_slug: isHoney ? 'honey' : 'fruits',
        name: productToEdit.name,
        selling_price: Math.round(productToEdit.selling_price),
        stock_quantity: Math.round(productToEdit.stock_quantity),
      });
    } else {
      reset({
        category_slug: 'honey',
        name: '',
        selling_price: 0,
        stock_quantity: 10,
      });
    }
  }, [productToEdit, isOpen, reset]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      const category_id =
        data.category_slug === 'honey'
          ? '11111111-1111-1111-1111-111111111111'
          : '22222222-2222-2222-2222-222222222222';

      // Auto-generate SKU code if not editing
      const skuPrefix = data.category_slug === 'honey' ? 'HNY' : 'FRT';
      const generatedSku = productToEdit?.sku || `${skuPrefix}-${Date.now().toString().slice(-6)}`;

      if (productToEdit) {
        await updateProduct({
          id: productToEdit.id,
          updates: {
            name: data.name,
            category_id,
            unit: 'piece',
            cost_price: 0,
            selling_price: Math.round(data.selling_price),
            stock_quantity: Math.round(data.stock_quantity),
          },
        });
        showToast('Product Updated ✨', `${data.name} has been updated`, 'success');
      } else {
        await createProduct({
          name: data.name,
          sku: generatedSku,
          category_id,
          description: '',
          image_url:
            data.category_slug === 'honey'
              ? 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80'
              : 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
          unit: 'piece',
          cost_price: 0,
          selling_price: Math.round(data.selling_price),
          stock_quantity: Math.round(data.stock_quantity),
          low_stock_threshold: 5,
          attributes: {},
          is_active: true,
        });
        showToast('Product Added 📦', `${data.name} has been added to inventory`, 'success');
      }
      onClose();
    } catch (err: any) {
      showToast('Form Submission Error', err.message || 'Failed to save product', 'error');
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? 'Edit Product' : 'Add New Product'}
      description="Quickly add or modify your product details"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Category Switcher */}
        <Select
          label="Category"
          options={[
            { value: 'honey', label: 'Honey 🍯' },
            { value: 'fruits', label: 'Fruits 🍎' },
          ]}
          {...register('category_slug')}
          error={errors.category_slug?.message}
        />

        {/* Simple Product Name */}
        <Input
          label="Product Name"
          placeholder="e.g. Wildflower Honey Jar"
          {...register('name')}
          error={errors.name?.message}
        />

        {/* Price & Stock Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Price (DZD)"
            type="number"
            step="1"
            placeholder="e.g. 1500"
            {...register('selling_price')}
            error={errors.selling_price?.message}
          />
          <Input
            label="Stock Quantity (Pieces)"
            type="number"
            step="1"
            placeholder="e.g. 20"
            {...register('stock_quantity')}
            error={errors.stock_quantity?.message}
          />
        </div>

        {/* Submit Buttons */}
        <div className="pt-4 border-t border-[#EBEBE6] flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gold"
            isLoading={isCreating || isUpdating}
            className="flex-1"
          >
            {productToEdit ? 'Save Changes' : 'Add Product'}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
