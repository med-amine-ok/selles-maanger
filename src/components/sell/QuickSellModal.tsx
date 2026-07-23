'use client';

import React, { useState, useEffect } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { useToast } from '@/lib/context/ToastContext';
import { Product, PaymentMethod } from '@/types/database';
import { formatDZD } from '@/lib/utils';
import { Search, ShoppingCart, Plus, Minus, Trash2, CheckCircle2 } from 'lucide-react';

export interface QuickSellModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProduct?: Product | null;
}

export interface QuickCartItem {
  product: Product;
  quantity: number;
  unit_price: number;
}

export const QuickSellModal: React.FC<QuickSellModalProps> = ({
  isOpen,
  onClose,
  preselectedProduct = null,
}) => {
  const { products } = useProducts();
  const { recordMultiSale, isRecordingMulti } = useSales();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<QuickCartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [receipt, setReceipt] = useState<{
    itemsCount: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (preselectedProduct) {
        setCart([
          {
            product: preselectedProduct,
            quantity: 1,
            unit_price: Math.round(preselectedProduct.selling_price),
          },
        ]);
      } else {
        setCart([]);
      }
    }
  }, [preselectedProduct, isOpen]);

  const addToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      showToast('Out of Stock', `${product.name} is currently out of stock!`, 'error');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          showToast('Stock Limit', `Cannot add more than ${Math.round(product.stock_quantity)} pcs of ${product.name}`, 'warning');
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          unit_price: Math.round(product.selling_price),
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock_quantity) {
              showToast('Stock Limit', `Only ${Math.round(item.product.stock_quantity)} pcs available`, 'warning');
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as QuickCartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const calculateGrandTotal = () => {
    return cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  };

  const calculateTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Cart empty', 'Please select at least one product', 'warning');
      return;
    }

    try {
      const items = cart.map((item) => ({
        product_id: item.product.id,
        quantity_sold: item.quantity,
        unit_price_at_sale: item.unit_price,
      }));

      await recordMultiSale({
        items,
        customer_name: customerName || undefined,
        payment_method: paymentMethod,
      });

      const grandTotal = calculateGrandTotal();
      const totalItems = calculateTotalItems();

      setReceipt({
        itemsCount: totalItems,
        total: grandTotal,
      });

      showToast(
        'Sale Confirmed! ⚡',
        `Processed ${totalItems} items for total ${formatDZD(grandTotal)}`,
        'success'
      );

      setTimeout(() => {
        setReceipt(null);
        setCart([]);
        onClose();
      }, 1800);
    } catch (err: any) {
      showToast('Failed to record sale', err.message || 'An error occurred', 'error');
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="⚡ Multi-Item Quick Sell"
      description="Tap items to add to ticket and confirm sale in one action"
    >
      {receipt ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-[#2A2A24]">Sale Successful!</h4>
            <p className="text-sm text-[#6B6B63] mt-1">Multi-item sale processed & stock updated</p>
          </div>

          <div className="w-full bg-[#FAFAF7] border border-[#EBEBE6] rounded-2xl p-4 text-left space-y-2 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B6B63]">Total Items:</span>
              <span className="font-semibold text-[#2A2A24]">{receipt.itemsCount} pcs</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-stone-200 text-[#2A2A24]">
              <span>Total Paid:</span>
              <span className="text-[#B5822F]">{formatDZD(receipt.total)}</span>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Search & Picker */}
          <div>
            <Input
              placeholder="Search product to add..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />

            {/* Horizontal Product Picker */}
            <div className="mt-2.5 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {filteredProducts.map((p) => {
                const inCart = cart.find((item) => item.product.id === p.id);
                const isHoney = p.category?.slug === 'honey' || p.category_id.includes('1111');
                const isOutOfStock = p.stock_quantity <= 0;

                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => addToCart(p)}
                    className={`flex-shrink-0 w-36 text-left p-3 rounded-2xl border transition-all cursor-pointer relative ${
                      inCart
                        ? 'border-[#D4A24C] bg-[#FBF1DD]/60 shadow-sm'
                        : isOutOfStock
                        ? 'border-[#EBEBE6] bg-stone-100 opacity-60 cursor-not-allowed'
                        : 'border-[#EBEBE6] bg-white hover:border-stone-300'
                    }`}
                  >
                    {inCart && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#D4A24C] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                        {inCart.quantity}
                      </span>
                    )}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <Badge variant={isHoney ? 'honey' : 'fruits'} size="sm">
                        {isHoney ? 'Honey' : 'Fruit'}
                      </Badge>
                    </div>
                    <h5 className="text-xs font-bold text-[#2A2A24] line-clamp-1">{p.name}</h5>
                    <div className="mt-1.5 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#B5822F]">{formatDZD(p.selling_price)}</span>
                      <span className="text-[#6B6B63]">{Math.round(p.stock_quantity)} pcs</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cart Items List */}
          {cart.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              <span className="text-xs font-semibold text-[#6B6B63] uppercase tracking-wider block">
                Sale Ticket ({calculateTotalItems()} pcs)
              </span>

              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-[#FAFAF7] border border-[#EBEBE6] p-2.5 rounded-2xl flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-[#2A2A24] truncate">{item.product.name}</h5>
                    <span className="text-[11px] font-semibold text-[#B5822F]">
                      {formatDZD(item.quantity * item.unit_price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-white border border-[#EBEBE6] rounded-xl px-1 py-0.5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-5 h-5 flex items-center justify-center rounded bg-[#F5F5F0] text-[#2A2A24]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-[#2A2A24]">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-5 h-5 flex items-center justify-center rounded bg-[#F5F5F0] text-[#2A2A24]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-[#6B6B63] hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-[#6B6B63] bg-[#FAFAF7] rounded-2xl border border-dashed border-[#EBEBE6]">
              Tap any product above to add to this sale ticket
            </div>
          )}

          {/* Payment Method & Customer */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Select
              label="Payment"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              options={[
                { value: 'cash', label: 'Cash 💵' },
                { value: 'card', label: 'Card 💳' },
                { value: 'mobile', label: 'Mobile 📱' },
                { value: 'transfer', label: 'Transfer 🏦' },
              ]}
            />
            <Input
              label="Customer (Optional)"
              placeholder="e.g. Karim"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          {/* Total & Submit */}
          <div className="pt-3 border-t border-[#EBEBE6] flex items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[#6B6B63] block font-medium">Grand Total</span>
              <span className="text-2xl font-extrabold text-[#B5822F]">
                {formatDZD(calculateGrandTotal())}
              </span>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              isLoading={isRecordingMulti}
              disabled={cart.length === 0}
              leftIcon={<ShoppingCart className="w-5 h-5" />}
              className="flex-1 max-w-[210px]"
            >
              Confirm Sale ({calculateTotalItems()})
            </Button>
          </div>
        </form>
      )}
    </BottomSheet>
  );
};
