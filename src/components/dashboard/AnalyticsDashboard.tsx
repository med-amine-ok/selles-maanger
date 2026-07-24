'use client';

import React, { useState } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useDashboard } from '@/hooks/useDashboard';
import { useExpenses } from '@/hooks/useExpenses';
import { ExpenseModal } from '@/components/expenses/ExpenseModal';
import { TimeRangeFilter, CustomDateRange } from '@/types/database';
import { formatDZD } from '@/lib/utils';
import {
  Banknote,
  PackageCheck,
  Boxes,
  AlertTriangle,
  Calendar,
  ShoppingBag,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Wallet,
  TrendingDown,
  Receipt,
  Plus,
  Trash2,
  PieChart as PieChartIcon,
  BarChart3,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { format, addDays, subDays, parseISO } from 'date-fns';

import { getDateIntervalForFilter } from '@/lib/services/api';

export interface AnalyticsDashboardProps {
  onQuickSellClick: () => void;
  onViewProductsClick?: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  onQuickSellClick,
  onViewProductsClick,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('month');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const [customRange, setCustomRange] = useState<CustomDateRange>({
    startDate: selectedCalendarDate,
    endDate: selectedCalendarDate,
  });

  // Fetch metrics based on selected view mode
  const isDayView = timeRange === 'custom';
  const effectiveCustomRange = isDayView
    ? { startDate: selectedCalendarDate, endDate: selectedCalendarDate }
    : customRange;

  const { metrics, trend, categoryDistribution, topProducts } = useDashboard(
    timeRange,
    isDayView ? effectiveCustomRange : undefined
  );

  const interval = getDateIntervalForFilter(
    timeRange,
    isDayView ? effectiveCustomRange : undefined
  );

  const expenseFilters =
    timeRange === 'all'
      ? undefined
      : {
          startDate: interval.start.toISOString(),
          endDate: interval.end.toISOString(),
        };

  const { expenses, deleteExpense, isDeleting } = useExpenses(expenseFilters);

  const timeFilterTabs: { id: TimeRangeFilter; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'custom', label: '📅 Calendar Day' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
    { id: 'all', label: 'All Time' },
  ];

  const handleTabChange = (tab: TimeRangeFilter) => {
    setTimeRange(tab);
  };

  const handlePrevDay = () => {
    const current = parseISO(selectedCalendarDate);
    const prev = subDays(current, 1);
    const formatted = format(prev, 'yyyy-MM-dd');
    setSelectedCalendarDate(formatted);
    setTimeRange('custom');
  };

  const handleNextDay = () => {
    const current = parseISO(selectedCalendarDate);
    const next = addDays(current, 1);
    const formatted = format(next, 'yyyy-MM-dd');
    setSelectedCalendarDate(formatted);
    setTimeRange('custom');
  };

  // Find Honey & Fruits revenue
  const honeyCategory = categoryDistribution.find(
    (c) => c.category_slug === 'honey' || c.category_name.toLowerCase().includes('honey')
  );
  const fruitCategory = categoryDistribution.find(
    (c) => c.category_slug === 'fruits' || c.category_name.toLowerCase().includes('fruit')
  );

  const honeyRevenue = honeyCategory ? honeyCategory.revenue : 0;
  const fruitsRevenue = fruitCategory ? fruitCategory.revenue : 0;
  const honey20Percent = Math.round(honeyRevenue * 0.2);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'stock_purchase':
        return 'Stock Purchase 📦';
      case 'supplies':
        return 'Supplies 🍯';
      case 'transport':
        return 'Transport 🚚';
      case 'utilities':
        return 'Utilities 💡';
      default:
        return 'Other Expense 📝';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner / Time Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#2A2A24] flex items-center gap-2">
            <span>Sales & Expense Dashboard</span>
            <Sparkles className="w-5 h-5 text-[#D4A24C]" />
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6B63] mt-0.5">
            Monitor money available, sales revenue, and business expenses in DZD
          </p>
        </div>

        {/* Action Buttons & Time Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setIsExpenseModalOpen(true)}
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-4 h-4 text-rose-600" />}
            className="border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-100"
          >
            Record Purchase / Expense
          </Button>

          <div className="flex bg-[#F5F5F0] p-1 rounded-2xl overflow-x-auto scrollbar-none">
            {timeFilterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  timeRange === tab.id
                    ? 'bg-white text-[#2A2A24] shadow-xs'
                    : 'text-[#6B6B63] hover:text-[#2A2A24]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DAY-BY-DAY CALENDAR NAVIGATOR */}
      {isDayView && (
        <Card padding="md" className="bg-[#FBF1DD]/40 border-[#F3E3BE]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#B5822F]" />
              <div>
                <h4 className="text-sm font-bold text-[#2A2A24]">Day-by-Day Calendar View</h4>
                <p className="text-xs text-[#6B6B63]">
                  Viewing metrics for{' '}
                  <span className="font-bold text-[#B5822F]">
                    {format(parseISO(selectedCalendarDate), 'EEEE, MMMM d, yyyy')}
                  </span>
                </p>
              </div>
            </div>

            {/* Date Navigator Controls */}
            <div className="flex items-center gap-2">
              <Button onClick={handlePrevDay} variant="outline" size="sm" leftIcon={<ChevronLeft className="w-4 h-4" />}>
                Prev Day
              </Button>

              <input
                type="date"
                value={selectedCalendarDate}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedCalendarDate(e.target.value);
                    setTimeRange('custom');
                  }
                }}
                className="bg-[#FFFFFF] border border-[#EBEBE6] rounded-2xl text-xs font-bold text-[#2A2A24] px-3 py-2 outline-none focus:border-[#D4A24C] cursor-pointer"
              />

              <Button onClick={handleNextDay} variant="outline" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                Next Day
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Net Cash Available */}
        <StatCard
          title="Net Cash Available"
          value={formatDZD(metrics?.net_cash || 0)}
          subtitle="Net = Revenue - Expenses"
          icon={<Wallet className="w-4 h-4" />}
          accent={(metrics?.net_cash || 0) >= 0 ? 'green' : 'rose'}
          className="col-span-2 sm:col-span-1 border-2 border-[#D4A24C]/40 bg-[#FBF1DD]/30"
        />

        {/* Total Revenue */}
        <StatCard
          title="Sales Revenue"
          value={formatDZD(metrics?.total_revenue || 0)}
          subtitle="Total sales collected"
          icon={<Banknote className="w-4 h-4" />}
          accent="gold"
        />

        {/* Money Spent (Expenses) */}
        <StatCard
          title="Money Spent"
          value={formatDZD(metrics?.total_expenses || 0)}
          subtitle="Purchases & Expenses 💸"
          icon={<TrendingDown className="w-4 h-4" />}
          accent="rose"
        />

        {/* Honey Revenue */}
        <StatCard
          title="Honey Revenue"
          value={formatDZD(honeyRevenue)}
          subtitle="Honey sales 🍯"
          icon={<span className="text-base">🍯</span>}
          accent="gold"
        />

        {/* Honey 20% Share */}
        <StatCard
          title="Honey 20% Share"
          value={formatDZD(honey20Percent)}
          subtitle="20% cut of Honey Revenue 🍯"
          icon={<Percent className="w-4 h-4 text-[#B5822F]" />}
          accent="amber"
        />

        {/* Fruits Revenue */}
        <StatCard
          title="Fruits Revenue"
          value={formatDZD(fruitsRevenue)}
          subtitle="Fruits sales 🍎"
          icon={<span className="text-base">🍎</span>}
          accent="green"
        />

        {/* Items Sold */}
        <StatCard
          title="Items Sold"
          value={`${Math.round(metrics?.units_sold || 0)} pcs`}
          subtitle="Total pieces sold"
          icon={<PackageCheck className="w-4 h-4" />}
          accent="neutral"
        />
      </div>

      {/* Section 1: Revenue Trend & Category Donut Circle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Trend Over Time (Area Chart) */}
        <Card padding="lg" className="lg:col-span-7 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#2A2A24] text-base">Revenue Trend (DZD)</h3>
              <p className="text-xs text-[#6B6B63]">
                {isDayView ? `Day view for ${selectedCalendarDate}` : 'Sales performance overview'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#B5822F]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4A24C]" /> Revenue
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {trend.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#6B6B63] space-y-2">
                <Calendar className="w-8 h-8 text-stone-300" />
                <p className="text-xs">No sales recorded for this date</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4A24C" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#D4A24C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date_label" tick={{ fontSize: 11, fill: '#6B6B63' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B6B63' }} />
                  <Tooltip
                    formatter={(value: any) => [`${formatDZD(Number(value))}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #EBEBE6',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue (DZD)"
                    stroke="#D4A24C"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Honey vs Fruits Circle Donut Chart */}
        <Card padding="lg" className="lg:col-span-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#2A2A24] text-base flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-[#D4A24C]" />
                <span>Honey vs Fruits Share</span>
              </h3>
              <p className="text-xs text-[#6B6B63]">Category sales proportion</p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full flex flex-col items-center justify-center relative">
            {categoryDistribution.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#6B6B63] space-y-2">
                <p className="text-xs">No category sales recorded</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="revenue"
                      nameKey="category_name"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.category_slug === 'honey' || entry.category_name.toLowerCase().includes('honey')
                              ? '#D4A24C'
                              : '#7FB685'
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${formatDZD(Number(value))}`, 'Revenue']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1px solid #EBEBE6',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Custom Legend */}
                <div className="flex items-center justify-center gap-6 mt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2A2A24]">
                    <span className="w-3 h-3 rounded-full bg-[#D4A24C]" />
                    <span>Honey 🍯 ({formatDZD(honeyRevenue)})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2A2A24]">
                    <span className="w-3 h-3 rounded-full bg-[#7FB685]" />
                    <span>Fruits 🍎 ({formatDZD(fruitsRevenue)})</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Section 2: Products Revenue Bar Chart (All Products Bar Comparison) */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-[#2A2A24] text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#B5822F]" />
              <span>Products Revenue Bar Comparison</span>
            </h3>
            <p className="text-xs text-[#6B6B63]">Revenue collected by product in DZD</p>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          {topProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#6B6B63] space-y-2">
              <p className="text-xs">No products sold in this period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="product_name" tick={{ fontSize: 11, fill: '#6B6B63' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B6B63' }} />
                <Tooltip
                  formatter={(value: any) => [`${formatDZD(Number(value))}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #EBEBE6',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
                <Bar dataKey="revenue" radius={[12, 12, 0, 0]} barSize={36}>
                  {topProducts.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.category_slug === 'honey' || entry.product_name.toLowerCase().includes('honey')
                          ? '#D4A24C'
                          : '#7FB685'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Section 3: Expenses & Money Spent List */}
      <Card padding="lg" className="flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-[#EBEBE6]">
          <div>
            <h3 className="font-bold text-[#2A2A24] text-base flex items-center gap-2">
              <Receipt className="w-5 h-5 text-rose-500" />
              <span>Purchases & Business Expenses List</span>
            </h3>
            <p className="text-xs text-[#6B6B63]">Track all money spent on stock & operating expenses</p>
          </div>

          <Button
            onClick={() => setIsExpenseModalOpen(true)}
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Record Purchase
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
          {expenses.length === 0 ? (
            <div className="col-span-full py-10 text-center text-[#6B6B63] space-y-2">
              <p className="text-3xl">💸</p>
              <p className="text-xs font-medium">No expenses recorded for this period</p>
            </div>
          ) : (
            expenses.map((exp) => (
              <div
                key={exp.id}
                className="bg-[#FAFAF7] border border-[#EBEBE6] p-3 rounded-2xl flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-bold text-[#2A2A24] truncate">{exp.title}</h5>
                    <span className="text-[10px] bg-rose-50 text-rose-700 font-semibold px-2 py-0.5 rounded-full border border-rose-200">
                      {getCategoryLabel(exp.category)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B6B63] mt-0.5">
                    {format(parseISO(exp.expense_date), 'MMM d, yyyy')}
                    {exp.notes ? ` • ${exp.notes}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-rose-600">
                    -{formatDZD(exp.amount)}
                  </span>
                  <button
                    onClick={() => deleteExpense(exp.id)}
                    className="text-[#6B6B63] hover:text-rose-600 p-1 transition-colors"
                    title="Delete expense"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-[#EBEBE6] mt-4 flex justify-between items-center text-xs font-bold text-[#2A2A24]">
          <span className="text-[#6B6B63]">Total Spent:</span>
          <span className="text-rose-600 text-sm">{formatDZD(metrics?.total_expenses || 0)}</span>
        </div>
      </Card>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />
    </div>
  );
};
