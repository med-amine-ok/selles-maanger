'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { useToast } from '@/lib/context/ToastContext';
import { Product, PaymentMethod } from '@/types/database';
import { formatDZD } from '@/lib/utils';
import { Search, ShoppingBag, Plus, Minus, Trash2, CheckCircle2, ShoppingCart } from 'lucide-react';

export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
}

export default function SellPage() {
  const { products } = useProducts();
  const { recordMultiSale, isRecordingMulti } = useSales();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [categoryTab, setCategoryTab] = useState<'all' | 'honey' | 'fruits'>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');

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

  // Cart operations
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
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
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
        .filter(Boolean) as CartItem[]
    );
  };

  const updatePrice = (productId: string, price: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, unit_price: Math.max(0, price) } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateGrandTotal = () => {
    return cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  };

  const calculateTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleConfirmMultiSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Empty Ticket', 'Please add at least one product to the sale', 'warning');
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
        notes: notes || undefined,
      });

      const grandTotal = calculateGrandTotal();
      const totalItems = calculateTotalItems();

      showToast(
        'Multi-Item Sale Confirmed! ⚡',
        `Sold ${totalItems} items for total ${formatDZD(grandTotal)}`,
        'success'
      );

      // Clear cart
      setCart([]);
      setCustomerName('');
      setNotes('');
    } catch (err: any) {
      showToast('Error Processing Sale', err.message || 'Failed to complete transaction', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#2A2A24]">Cash Register & Quick Sell</h2>
          <p className="text-xs sm:text-sm text-[#6B6B63] mt-0.5">
            Add multiple products to ticket and sell all in one action
          </p>
        </div>

        {cart.length > 0 && (
          <Button onClick={clearCart} variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50">
            Clear Ticket
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Selection Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-3">
            <div className="flex bg-[#F5F5F0] p-1 rounded-2xl">
              <button
                onClick={() => setCategoryTab('all')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  categoryTab === 'all' ? 'bg-white text-[#2A2A24] shadow-xs' : 'text-[#6B6B63]'
                }`}
              >
                All Products
              </button>
              <button
                onClick={() => setCategoryTab('honey')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  categoryTab === 'honey' ? 'bg-[#D4A24C] text-white shadow-xs' : 'text-[#6B6B63]'
                }`}
              >
                Honey 🍯
              </button>
              <button
                onClick={() => setCategoryTab('fruits')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  categoryTab === 'fruits' ? 'bg-[#7FB685] text-white shadow-xs' : 'text-[#6B6B63]'
                }`}
              >
                Fruits 🍎
              </button>
            </div>

            <Input
              placeholder="Search product to add..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map((p) => {
              const inCartItem = cart.find((item) => item.product.id === p.id);
              const isHoney = p.category?.slug === 'honey' || p.category_id.includes('1111');
              const isLowStock = p.stock_quantity <= p.low_stock_threshold;
              const isOutOfStock = p.stock_quantity <= 0;

              return (
                <button
                  key={p.id}
                  disabled={isOutOfStock}
                  onClick={() => addToCart(p)}
                  className={`text-left p-3.5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between h-36 relative ${
                    inCartItem
                      ? 'border-[#D4A24C] bg-[#FBF1DD]/60 ring-2 ring-[#D4A24C]/30 shadow-md'
                      : isOutOfStock
                      ? 'border-[#EBEBE6] bg-stone-100 opacity-60 cursor-not-allowed'
                      : 'border-[#EBEBE6] bg-white hover:border-stone-300 shadow-xs'
                  }`}
                >
                  {/* Badge for In-Cart Quantity */}
                  {inCartItem && (
                    <span className="absolute -top-2 -right-2 bg-[#D4A24C] text-white text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-scale-in">
                      {inCartItem.quantity}
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <Badge variant={isHoney ? 'honey' : 'fruits'} size="sm">
                        {isHoney ? 'Honey' : 'Fruit'}
                      </Badge>
                    </div>
                    <h4 className="text-xs font-bold text-[#2A2A24] line-clamp-2">{p.name}</h4>
                  </div>

                  <div>
                    <div className="text-sm font-extrabold text-[#B5822F]">{formatDZD(p.selling_price)}</div>
                    <div className="flex justify-between items-center text-[11px] text-[#6B6B63] mt-0.5">
                      <span>Stock:</span>
                      <span className={isLowStock ? 'text-rose-600 font-bold' : 'font-semibold'}>
                        {Math.round(p.stock_quantity)} pcs
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Multi-Item Sale Cart */}
        <div className="lg:col-span-5">
          <Card padding="lg" className="sticky top-20 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#EBEBE6]">
              <h3 className="text-base font-bold text-[#2A2A24] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#D4A24C]" />
                <span>Sale Ticket ({calculateTotalItems()} items)</span>
              </h3>
              {cart.length > 0 && (
                <span className="text-xs font-bold text-[#B5822F] bg-[#FBF1DD] px-2.5 py-1 rounded-full">
                  {formatDZD(calculateGrandTotal())}
                </span>
              )}
            </div>

            {cart.length > 0 ? (
              <form onSubmit={handleConfirmMultiSale} className="space-y-4">
                {/* Cart Line Items List */}
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {cart.map((item) => {
                    const isHoney =
                      item.product.category?.slug === 'honey' || item.product.category_id.includes('1111');

                    return (
                      <div
                        key={item.product.id}
                        className="bg-[#FAFAF7] border border-[#EBEBE6] p-3 rounded-2xl space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-xs text-[#2A2A24] line-clamp-1">
                              {item.product.name}
                            </h4>
                            <span className="text-[10px] text-[#6B6B63]">
                              Subtotal: <strong className="text-[#B5822F]">{formatDZD(item.quantity * item.unit_price)}</strong>
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-[#6B6B63] hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Quantity controls & price override */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-200">
                          {/* Qty Switcher */}
                          <div className="flex items-center gap-1.5 bg-white border border-[#EBEBE6] rounded-xl px-1.5 py-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#F5F5F0] hover:bg-stone-200 text-[#2A2A24]"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <span className="w-8 text-center text-xs font-bold text-[#2A2A24]">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#F5F5F0] hover:bg-stone-200 text-[#2A2A24]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Unit price input */}
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-[#6B6B63]">Price:</span>
                            <input
                              type="number"
                              value={item.unit_price}
                              onChange={(e) => updatePrice(item.product.id, parseInt(e.target.value) || 0)}
                              className="w-20 bg-white border border-[#EBEBE6] rounded-xl px-2 py-1 text-xs font-bold text-[#2A2A24] outline-none focus:border-[#D4A24C]"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Additional details */}
                <div className="space-y-2 pt-2 border-t border-[#EBEBE6]">
                  <Select
                    label="Payment Method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    options={[
                      { value: 'cash', label: 'Cash 💵' },
                      { value: 'card', label: 'Card 💳' },
                      { value: 'mobile', label: 'Mobile 📱' },
                      { value: 'transfer', label: 'Bank Transfer 🏦' },
                    ]}
                  />

                  <Input
                    label="Customer Name (Optional)"
                    placeholder="e.g. Karim"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                {/* Checkout Grand Total & Submit Action */}
                <div className="pt-4 border-t border-[#EBEBE6] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-[#6B6B63]">Grand Total Due</span>
                    <span className="text-2xl font-extrabold text-[#B5822F]">
                      {formatDZD(calculateGrandTotal())}
                    </span>
                  </div>

                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    isLoading={isRecordingMulti}
                    className="w-full"
                    leftIcon={<ShoppingCart className="w-5 h-5" />}
                  >
                    Confirm Sale ({calculateTotalItems()} Items)
                  </Button>
                </div>
              </form>
            ) : (
              <div className="py-12 text-center text-[#6B6B63] space-y-2">
                <p className="text-3xl">🛒</p>
                <p className="text-sm font-medium">Click any product from the catalog on the left to build your sale ticket</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
