'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Receipt, Settings } from 'lucide-react';
import { clsx } from 'clsx';

export interface MobileNavProps {
  onQuickSellClick: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onQuickSellClick }) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Products', href: '/products', icon: Package },
    // Center FAB spot reserved for Sell
    { label: 'Sales', href: '/sales', icon: Receipt },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#EBEBE6] pb-safe md:hidden">
      <div className="flex items-center justify-around h-16 px-2 relative">
        {/* First 2 nav items */}
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href || (item.href === '/' && pathname === '/dashboard');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-[#D4A24C] font-semibold' : 'text-[#6B6B63] hover:text-[#2A2A24]'
              )}
            >
              <Icon className={clsx('w-5 h-5 transition-transform', isActive && 'scale-110')} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Center Floating Action Button (FAB) for Quick Sell */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={onQuickSellClick}
            aria-label="Sell Item"
            className="w-14 h-14 bg-[#D4A24C] hover:bg-[#B5822F] text-white rounded-full flex flex-col items-center justify-center shadow-lg shadow-amber-500/30 transition-transform active:scale-90 cursor-pointer border-4 border-[#FAFAF7]"
          >
            <ShoppingBag className="w-6 h-6" />
            <span className="text-[9px] font-bold tracking-tighter -mt-0.5 uppercase">Sell</span>
          </button>
        </div>

        {/* Last 2 nav items */}
        {navItems.slice(2).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-[#D4A24C] font-semibold' : 'text-[#6B6B63] hover:text-[#2A2A24]'
              )}
            >
              <Icon className={clsx('w-5 h-5 transition-transform', isActive && 'scale-110')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
