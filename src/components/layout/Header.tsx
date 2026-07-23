'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, Database, Sparkles } from 'lucide-react';
import { api } from '@/lib/services/api';
import { Badge } from '@/components/ui/Badge';

export interface HeaderProps {
  onAddProductClick?: () => void;
  onQuickSellClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddProductClick, onQuickSellClick }) => {
  const pathname = usePathname();
  const isDemo = api.isDemoMode();

  const getTitle = () => {
    switch (pathname) {
      case '/':
      case '/dashboard':
        return 'Dashboard';
      case '/products':
        return 'Inventory & Products';
      case '/sell':
        return 'Sell Items';
      case '/sales':
        return 'Sales History';
      case '/settings':
        return 'App Settings';
      default:
        return 'Stock & Sales';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FAFAF7]/90 backdrop-blur-md border-b border-[#EBEBE6] px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Title & Mode */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-[#2A2A24]">
            <span className="text-xl">🍯</span>
            <span className="hidden sm:inline">Stock & Sales</span>
          </Link>

          <div className="h-4 w-px bg-stone-300 hidden sm:block" />

          <h1 className="text-lg font-bold text-[#2A2A24] tracking-tight">{getTitle()}</h1>

          <Badge variant={isDemo ? 'amber' : 'green'} size="sm" className="hidden sm:inline-flex">
            {isDemo ? (
              <>
                <Sparkles className="w-3 h-3" />
                <span>Demo Mode</span>
              </>
            ) : (
              <>
                <Database className="w-3 h-3" />
                <span>Supabase Live</span>
              </>
            )}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {pathname === '/products' && onAddProductClick && (
            <button
              onClick={onAddProductClick}
              className="bg-[#7FB685] hover:bg-[#4F8A5B] text-white px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}

          {pathname !== '/sell' && onQuickSellClick && (
            <button
              onClick={onQuickSellClick}
              className="bg-[#D4A24C] hover:bg-[#B5822F] text-white px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <span className="text-sm">⚡</span>
              <span>Quick Sell</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
