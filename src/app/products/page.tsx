'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useProducts } from '@/hooks/useProducts';
import { ProductFormModal } from '@/components/products/ProductFormModal';
import { RestockModal } from '@/components/products/RestockModal';
import { QuickSellModal } from '@/components/sell/QuickSellModal';
import { useToast } from '@/lib/context/ToastContext';
import { Product } from '@/types/database';
import { formatDZD } from '@/lib/utils';
import { Search, Plus, Edit3, Trash2, RefreshCw, ShoppingBag, AlertTriangle } from 'lucide-react';

export default function ProductsPage() {
  const [categoryTab, setCategoryTab] = useState<'all' | 'honey' | 'fruits'>('all');
  const [search, setSearch] = useState('');
  const { products, isLoading, archiveProduct } = useProducts();
  const { showToast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [restockProductTarget, setRestockProductTarget] = useState<Product | null>(null);

  const [isSellOpen, setIsSellOpen] = useState(false);
  const [sellProductTarget, setSellProductTarget] = useState<Product | null>(null);

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

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleOpenRestock = (product: Product) => {
    setRestockProductTarget(product);
    setIsRestockOpen(true);
  };

  const handleOpenSell = (product: Product) => {
    setSellProductTarget(product);
    setIsSellOpen(true);
  };

  const handleArchive = async (product: Product) => {
    if (window.confirm(`Are you sure you want to archive "${product.name}"?`)) {
      try {
        await archiveProduct(product.id);
        showToast('Product Archived 📦', `${product.name} moved to archive`, 'info');
      } catch (err: any) {
        showToast('Error archiving product', err.message || 'An error occurred', 'error');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#2A2A24]">Inventory & Products</h2>
          <p className="text-xs sm:text-sm text-[#6B6B63] mt-0.5">
            Manage your honey jars and farm fresh fruits stock levels
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          variant="green"
          leftIcon={<Plus className="w-4 h-4" />}
          className="shrink-0"
        >
          Add New Product
        </Button>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="space-y-3">
        <div className="flex bg-[#F5F5F0] p-1 rounded-2xl max-w-md">
          <button
            onClick={() => setCategoryTab('all')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              categoryTab === 'all' ? 'bg-white text-[#2A2A24] shadow-xs' : 'text-[#6B6B63]'
            }`}
          >
            All Items ({products.length})
          </button>
          <button
            onClick={() => setCategoryTab('honey')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              categoryTab === 'honey' ? 'bg-[#D4A24C] text-white shadow-xs' : 'text-[#6B6B63]'
            }`}
          >
            Honey 🍯
          </button>
          <button
            onClick={() => setCategoryTab('fruits')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              categoryTab === 'fruits' ? 'bg-[#7FB685] text-white shadow-xs' : 'text-[#6B6B63]'
            }`}
          >
            Fruits 🍎
          </button>
        </div>

        <Input
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Product List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-44 bg-stone-200/60 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="py-12 text-center text-[#6B6B63] space-y-3">
          <div className="text-4xl">🍯</div>
          <h3 className="text-base font-bold text-[#2A2A24]">No products found</h3>
          <p className="text-xs max-w-sm mx-auto">
            {search ? `No inventory items matched "${search}"` : 'Your inventory is empty — add a product!'}
          </p>
          <Button onClick={handleOpenAdd} variant="gold" size="sm" className="mt-2">
            + Add Product
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const isHoney = product.category?.slug === 'honey' || product.category_id.includes('1111');
            const isLowStock = product.stock_quantity <= product.low_stock_threshold;
            const isOutOfStock = product.stock_quantity <= 0;

            return (
              <Card key={product.id} padding="none" className="flex flex-col justify-between group">
                <div className="p-4 space-y-3">
                  {/* Category Badge & Actions */}
                  <div className="flex items-center justify-between">
                    <Badge variant={isHoney ? 'honey' : 'fruits'}>
                      {isHoney ? 'Honey 🍯' : 'Fruit 🍎'}
                    </Badge>

                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenRestock(product)}
                        title="Restock Inventory"
                        className="p-1.5 rounded-xl hover:bg-[#F5F5F0] text-[#6B6B63] hover:text-[#7FB685] transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(product)}
                        title="Edit Product"
                        className="p-1.5 rounded-xl hover:bg-[#F5F5F0] text-[#6B6B63] hover:text-[#D4A24C] transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleArchive(product)}
                        title="Archive Product"
                        className="p-1.5 rounded-xl hover:bg-rose-50 text-[#6B6B63] hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="font-bold text-[#2A2A24] text-base leading-snug group-hover:text-[#B5822F] transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  {/* Price & Stock info */}
                  <div className="pt-3 border-t border-[#EBEBE6] flex items-end justify-between">
                    <div>
                      <span className="text-xs text-[#6B6B63] block">Price</span>
                      <span className="text-lg font-extrabold text-[#2A2A24]">
                        {formatDZD(product.selling_price)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-[#6B6B63] block">In Stock</span>
                      <span
                        className={`text-sm font-bold flex items-center justify-end gap-1 ${
                          isOutOfStock
                            ? 'text-rose-600'
                            : isLowStock
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {isLowStock && <AlertTriangle className="w-3.5 h-3.5" />}
                        <span>{Math.round(product.stock_quantity)} pcs</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sell Action Footer */}
                <div className="p-3 bg-[#FAFAF7] border-t border-[#EBEBE6] flex gap-2">
                  <Button
                    onClick={() => handleOpenRestock(product)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    + Restock
                  </Button>
                  <Button
                    onClick={() => handleOpenSell(product)}
                    variant={isHoney ? 'gold' : 'green'}
                    size="sm"
                    disabled={isOutOfStock}
                    leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                    className="flex-1 text-xs"
                  >
                    Sell
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        productToEdit={editingProduct}
      />

      <RestockModal
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        product={restockProductTarget}
      />

      <QuickSellModal
        isOpen={isSellOpen}
        onClose={() => setIsSellOpen(false)}
        preselectedProduct={sellProductTarget}
      />
    </div>
  );
}
