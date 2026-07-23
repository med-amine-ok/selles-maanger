'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';
import { QuickSellModal } from '@/components/sell/QuickSellModal';

export default function DashboardPage() {
  const router = useRouter();
  const [isQuickSellOpen, setIsQuickSellOpen] = useState(false);

  return (
    <>
      <AnalyticsDashboard
        onQuickSellClick={() => setIsQuickSellOpen(true)}
        onViewProductsClick={() => router.push('/products')}
      />

      <QuickSellModal
        isOpen={isQuickSellOpen}
        onClose={() => setIsQuickSellOpen(false)}
      />
    </>
  );
}
