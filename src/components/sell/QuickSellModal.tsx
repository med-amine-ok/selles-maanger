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
import { Search, ShoppingCart, Plus, Minus, Trash2, CheckCircle2, ShoppingBag } from 'lucide-react';

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
  const [categoryTab, setCategoryTab] = useState<'all' | 'honey' | 'fruits'>('all');
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
      setSearch('');
      setCategoryTab('all');
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

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      categoryTab === 'all' ||
      p.category?.slug === categoryTab ||
      (categoryTab === 'honey' && p.category_id.includes('1111')) ||
      (categoryTab === 'fruits' && p.category_id.includes('2222'));

    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

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
      title="⚡ Multi-Item Quick Register"
      description="Explore products by category, tap to add to ticket, and sell in one tap"
      maxWidth="4xl"
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

          <div className="w-full max-w-md bg-[#FAFAF7] border border-[#EBEBE6] rounded-2xl p-4 text-left space-y-2 mt-2">
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Product Explorer with Category Tabs */}
          <div className="md:col-span-7 space-y-4">
            {/* Category Tabs & Search Bar */}
            <div className="space-y-2.5">
              <div className="flex bg-[#F5F5F0] p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setCategoryTab('all')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    categoryTab === 'all' ? 'bg-white text-[#2A2A24] shadow-xs' : 'text-[#6B6B63]'
                  }`}
                >
                  All Products
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryTab('honey')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    categoryTab === 'honey' ? 'bg-[#D4A24C] text-white shadow-xs' : 'text-[#6B6B63]'
                  }`}
                >
                  Honey 🍯
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryTab('fruits')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    categoryTab === 'fruits' ? 'bg-[#7FB685] text-white shadow-xs' : 'text-[#6B6B63]'
                  }`}
                >
                  Fruits 🍎
                </button>
              </div>

              <Input
                placeholder="Search product name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Product Catalog Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-[#6B6B63]">
                  No products found matching your search
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const inCart = cart.find((item) => item.product.id === p.id);
                  const isHoney = p.category?.slug === 'honey' || p.category_id.includes('1111');
                  const isOutOfStock = p.stock_quantity <= 0;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => addToCart(p)}
                      className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-32 relative ${
                        inCart
                          ? 'border-[#D4A24C] bg-[#FBF1DD]/60 ring-2 ring-[#D4A24C]/30 shadow-xs'
                          : isOutOfStock
                          ? 'border-[#EBEBE6] bg-stone-100 opacity-60 cursor-not-allowed'
                          : 'border-[#EBEBE6] bg-white hover:border-stone-300'
                      }`}
                    >
                      {inCart && (
                        <span className="absolute -top-1.5 -right-1.5 bg-[#D4A24C] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                          {inCart.quantity}
                        </span>
                      )}
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <Badge variant={isHoney ? 'honey' : 'fruits'} size="sm">
                            {isHoney ? 'Honey' : 'Fruit'}
                          </Badge>
                        </div>
                        <h5 className="text-xs font-bold text-[#2A2A24] line-clamp-1">{p.name}</h5>
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-[#B5822F]">{formatDZD(p.selling_price)}</div>
                        <div className="text-[10px] text-[#6B6B63] mt-0.5">
                          Stock: {Math.round(p.stock_quantity)} pcs
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Ticket Cart & Payment Checkout */}
          <div className="md:col-span-5 bg-[#FAFAF7] border border-[#EBEBE6] rounded-2xl p-4 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#EBEBE6]">
              <h4 className="text-sm font-bold text-[#2A2A24] flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#D4A24C]" />
                <span>Ticket ({calculateTotalItems()} pcs)</span>
              </h4>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-[11px] font-semibold text-rose-600 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {cart.length > 0 ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="bg-white border border-[#EBEBE6] p-2.5 rounded-xl flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-[#2A2A24] truncate">{item.product.name}</h5>
                        <span className="text-[11px] font-semibold text-[#B5822F]">
                          {formatDZD(item.quantity * item.unit_price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 bg-[#F5F5F0] rounded-lg px-1 py-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-white text-[#2A2A24]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-[#2A2A24]">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-white text-[#2A2A24]"
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

                <div className="space-y-2 pt-2 border-t border-[#EBEBE6]">
                  <Select
                    label="Payment Method"
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

                <div className="pt-3 border-t border-[#EBEBE6] flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-[#6B6B63] block">Grand Total</span>
                    <span className="text-xl font-extrabold text-[#B5822F]">
                      {formatDZD(calculateGrandTotal())}
                    </span>
                  </div>

                  <Button
                    type="submit"
                    variant="gold"
                    size="md"
                    isLoading={isRecordingMulti}
                    disabled={cart.length === 0}
                    leftIcon={<ShoppingCart className="w-4 h-4" />}
                    className="flex-1"
                  >
                    Confirm Sale
                  </Button>
                </div>
              </form>
            ) : (
              <div className="py-8 text-center text-xs text-[#6B6B63] space-y-1">
                <p className="text-2xl">🛒</p>
                <p className="font-medium">Tap any product from the catalog to build ticket</p>
              </div>
            )}
          </div>
        </div>
      )}
    </BottomSheet>
  );
};
