'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { QuickSellModal } from '@/components/sell/QuickSellModal';
import { ProductFormModal } from '@/components/products/ProductFormModal';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isQuickSellOpen, setIsQuickSellOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#FAFAF7]">
      {/* Desktop Navigation Sidebar (md:flex) */}
      <DesktopSidebar onQuickSellClick={() => setIsQuickSellOpen(true)} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        <Header
          onQuickSellClick={() => setIsQuickSellOpen(true)}
          onAddProductClick={() => setIsAddProductOpen(true)}
        />
        <main className="flex-1">{children}</main>
      </div>

      {/* Mobile Bottom Navigation Bar (md:hidden) */}
      <MobileNav onQuickSellClick={() => setIsQuickSellOpen(true)} />

      {/* Global Quick Sell FAB / Header Modal */}
      <QuickSellModal
        isOpen={isQuickSellOpen}
        onClose={() => setIsQuickSellOpen(false)}
      />

      {/* Global Add Product Modal */}
      <ProductFormModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />
    </div>
  );
};
