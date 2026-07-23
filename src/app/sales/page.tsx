'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSales } from '@/hooks/useSales';
import { useToast } from '@/lib/context/ToastContext';
import { Sale } from '@/types/database';
import { formatDZD } from '@/lib/utils';
import { Search, Download, Trash2, Calendar, Receipt } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function SalesHistoryPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const { sales, isLoading, deleteSale } = useSales({
    category_id: categoryFilter,
    search,
    startDate: startDate ? new Date(startDate).toISOString() : undefined,
    endDate: endDate ? new Date(endDate).toISOString() : undefined,
  });

  const { showToast } = useToast();

  const handleDeleteSale = async (sale: Sale) => {
    if (
      window.confirm(
        `Are you sure you want to delete this sale? This will restore ${Math.round(sale.quantity_sold)} pcs back into stock.`
      )
    ) {
      try {
        await deleteSale(sale.id);
        showToast(
          'Sale Refunded 🔄',
          `Restored ${Math.round(sale.quantity_sold)} pcs of ${sale.product?.name || 'item'} to stock`,
          'info'
        );
      } catch (err: any) {
        showToast('Failed to delete sale', err.message || 'An error occurred', 'error');
      }
    }
  };

  const exportToCSV = () => {
    if (sales.length === 0) {
      showToast('No sales data', 'Nothing to export', 'warning');
      return;
    }

    const headers = ['Sale ID', 'Date', 'Product', 'Category', 'Qty (pcs)', 'Unit Price (DZD)', 'Total Amount (DZD)', 'Payment Method', 'Customer'];
    const rows = sales.map((s) => [
      s.id,
      format(parseISO(s.sale_date), 'yyyy-MM-dd HH:mm'),
      `"${s.product?.name || 'Unknown'}"`,
      s.product?.category?.slug || '',
      Math.round(s.quantity_sold),
      Math.round(s.unit_price_at_sale),
      Math.round(s.total_amount),
      s.payment_method || 'cash',
      `"${s.customer_name || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_history_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('CSV Exported 📄', `Exported ${sales.length} sales records`, 'success');
  };

  const groupedSales = sales.reduce((acc, sale) => {
    const dateKey = format(parseISO(sale.sale_date), 'EEEE, MMMM d, yyyy');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(sale);
    return acc;
  }, {} as Record<string, Sale[]>);

  const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#2A2A24]">Sales History</h2>
          <p className="text-xs sm:text-sm text-[#6B6B63] mt-0.5">
            View past transactions and refund sales in DZD
          </p>
        </div>

        <Button
          onClick={exportToCSV}
          variant="outline"
          leftIcon={<Download className="w-4 h-4 text-[#D4A24C]" />}
          className="shrink-0"
        >
          Export CSV
        </Button>
      </div>

      <Card padding="md" className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search customer or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'honey', label: 'Honey 🍯' },
              { value: 'fruits', label: 'Fruits 🍎' },
            ]}
          />

          <Input
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Input
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center pt-2 text-xs text-[#6B6B63]">
          <span>Found {sales.length} transactions</span>
          <span className="font-semibold text-[#2A2A24]">
            Total Filtered Revenue: <span className="text-[#B5822F] font-bold">{formatDZD(totalRevenue)}</span>
          </span>
        </div>
      </Card>

      {/* Sales List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-stone-200/60 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : sales.length === 0 ? (
        <Card className="py-12 text-center text-[#6B6B63] space-y-3">
          <Receipt className="w-10 h-10 mx-auto text-[#A0A096]" />
          <h3 className="text-base font-bold text-[#2A2A24]">No sales recorded</h3>
          <p className="text-xs">No transaction history matched your selected filters.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSales).map(([dateLabel, daySales]) => {
            const dayTotal = daySales.reduce((sum, s) => sum + s.total_amount, 0);

            return (
              <div key={dateLabel} className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B6B63] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{dateLabel}</span>
                  </h3>
                  <span className="text-xs font-semibold text-[#2A2A24]">
                    Day Total: <span className="text-[#B5822F] font-bold">{formatDZD(dayTotal)}</span>
                  </span>
                </div>

                <div className="space-y-2">
                  {daySales.map((sale) => {
                    const isHoney =
                      sale.product?.category?.slug === 'honey' ||
                      sale.product?.category_id.includes('1111');

                    return (
                      <Card
                        key={sale.id}
                        padding="md"
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-stone-300 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-3 rounded-2xl bg-[#F5F5F0] text-xl shrink-0">
                            {isHoney ? '🍯' : '🍎'}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-[#2A2A24]">
                                {sale.product?.name || 'Item'}
                              </h4>
                              <Badge variant={isHoney ? 'honey' : 'fruits'} size="sm">
                                {isHoney ? 'Honey' : 'Fruit'}
                              </Badge>
                            </div>

                            <p className="text-xs text-[#6B6B63] mt-0.5">
                              {Math.round(sale.quantity_sold)} pcs @ {formatDZD(sale.unit_price_at_sale)} •{' '}
                              <span className="capitalize">{sale.payment_method || 'Cash'}</span>
                              {sale.customer_name && ` • Customer: ${sale.customer_name}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EBEBE6]">
                          <div className="text-right">
                            <span className="text-lg font-extrabold text-[#B5822F] block">
                              {formatDZD(sale.total_amount)}
                            </span>
                            <span className="text-[10px] text-[#6B6B63]">
                              {format(parseISO(sale.sale_date), 'h:mm a')}
                            </span>
                          </div>

                          <button
                            onClick={() => handleDeleteSale(sale)}
                            title="Refund Sale & Restore Stock"
                            className="p-2 rounded-xl text-[#6B6B63] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
