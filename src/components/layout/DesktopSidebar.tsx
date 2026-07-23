'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Receipt, Settings, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { api } from '@/lib/services/api';

export interface DesktopSidebarProps {
  onQuickSellClick: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ onQuickSellClick }) => {
  const pathname = usePathname();
  const isDemo = api.isDemoMode();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Products', href: '/products', icon: Package },
    { label: 'Sales History', href: '/sales', icon: Receipt },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-[#EBEBE6] bg-white min-h-screen p-4 shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-4 border-b border-[#EBEBE6]">
        <div className="w-10 h-10 rounded-2xl bg-[#FBF1DD] border border-[#F3E3BE] flex items-center justify-center text-xl shadow-xs">
          🍯
        </div>
        <div>
          <h2 className="font-bold text-[#2A2A24] text-base leading-tight">Stock & Sales</h2>
          <p className="text-xs text-[#6B6B63]">Honey & Fruits Store</p>
        </div>
      </div>

      {/* Quick Sell Hero Button */}
      <div className="my-4">
        <button
          onClick={onQuickSellClick}
          className="w-full bg-[#D4A24C] hover:bg-[#B5822F] text-white p-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all active:scale-98 cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>New Sale (Sell Item)</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/' && pathname === '/dashboard');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-[#FBF1DD] text-[#B5822F] font-semibold shadow-xs'
                  : 'text-[#6B6B63] hover:bg-[#F5F5F0] hover:text-[#2A2A24]'
              )}
            >
              <Icon className={clsx('w-5 h-5', isActive ? 'text-[#B5822F]' : 'text-[#6B6B63]')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="mt-auto pt-4 border-t border-[#EBEBE6] text-xs text-[#6B6B63] space-y-2">
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F5F5F0]">
          <span className="font-medium">Mode:</span>
          <span className="font-semibold text-[#2A2A24] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#D4A24C]" />
            {isDemo ? 'Demo Mode' : 'Supabase Live'}
          </span>
        </div>
        <p className="text-[11px] text-center text-[#A0A096]">Stock & Sales v1.0 • PWA Ready</p>
      </div>
    </aside>
  );
};
