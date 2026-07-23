'use client';

import React, { useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/lib/context/ToastContext';
import { Product } from '@/types/database';
import { RefreshCw } from 'lucide-react';

export interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const RestockModal: React.FC<RestockModalProps> = ({ isOpen, onClose, product }) => {
  const { restockProduct, isRestocking } = useProducts();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState<number>(10);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity === 0) return;

    const intQty = Math.floor(quantity);

    try {
      await restockProduct({ id: product.id, quantityToAdd: intQty });
      showToast(
        'Inventory Restocked 📦',
        `Added ${intQty} pcs to ${product.name}. New total: ${Math.round(product.stock_quantity + intQty)} pcs`,
        'success'
      );
      onClose();
    } catch (err: any) {
      showToast('Restock Failed', err.message || 'Could not update inventory', 'error');
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Restock ${product.name}`}
      description="Add fresh inventory pieces"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-[#FAFAF7] p-4 rounded-2xl border border-[#EBEBE6] flex justify-between items-center">
          <div>
            <span className="text-xs text-[#6B6B63] block font-medium">Current Stock</span>
            <span className="text-xl font-bold text-[#2A2A24]">
              {Math.round(product.stock_quantity)} pcs
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#6B6B63] block font-medium">Updated Target</span>
            <span className="text-xl font-bold text-[#7FB685]">
              {Math.max(0, Math.round(product.stock_quantity + (quantity || 0)))} pcs
            </span>
          </div>
        </div>

        <Input
          label="Quantity to Add (Pieces)"
          type="number"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
        />

        <div className="pt-3 border-t border-[#EBEBE6] flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="green"
            isLoading={isRestocking}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="flex-1"
          >
            Confirm Restock
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
