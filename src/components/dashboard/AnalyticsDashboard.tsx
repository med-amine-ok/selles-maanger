'use client';

import React, { useState } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useDashboard } from '@/hooks/useDashboard';
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
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { format, addDays, subDays, parseISO } from 'date-fns';

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
    isDayView || customRange.startDate ? effectiveCustomRange : undefined
  );

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

  const CATEGORY_COLORS: Record<string, string> = {
    honey: '#D4A24C',
    fruits: '#7FB685',
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner / Time Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#2A2A24] flex items-center gap-2">
            <span>Revenue Analytics</span>
            <Sparkles className="w-5 h-5 text-[#D4A24C]" />
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6B63] mt-0.5">
            Track daily revenue, honey & fruits breakdown in DZD
          </p>
        </div>

        {/* Time Filter Tabs */}
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

      {/* DAY-BY-DAY CALENDAR NAVIGATOR */}
      {isDayView && (
        <Card padding="md" className="bg-[#FBF1DD]/40 border-[#F3E3BE]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#B5822F]" />
              <div>
                <h4 className="text-sm font-bold text-[#2A2A24]">Day-by-Day Calendar View</h4>
                <p className="text-xs text-[#6B6B63]">
                  Viewing sales revenue for{' '}
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
                className="bg-white border border-[#EBEBE6] rounded-2xl text-xs font-bold text-[#2A2A24] px-3 py-2 outline-none focus:border-[#D4A24C] cursor-pointer"
              />

              <Button onClick={handleNextDay} variant="outline" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                Next Day
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Top Stat Cards Grid (Only Revenue Focus) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <StatCard
          title="Total Revenue"
          value={formatDZD(metrics?.total_revenue || 0)}
          subtitle="Total sales revenue"
          icon={<Banknote className="w-4 h-4" />}
          accent="gold"
        />

        {/* Honey Revenue */}
        <StatCard
          title="Honey Revenue"
          value={formatDZD(honeyRevenue)}
          subtitle="Sales from honey jars 🍯"
          icon={<span className="text-base">🍯</span>}
          accent="gold"
        />

        {/* Fruits Revenue */}
        <StatCard
          title="Fruits Revenue"
          value={formatDZD(fruitsRevenue)}
          subtitle="Sales from fruits 🍎"
          icon={<span className="text-base">🍎</span>}
          accent="green"
        />

        {/* Units Sold */}
        <StatCard
          title="Items Sold"
          value={`${Math.round(metrics?.units_sold || 0)} pcs`}
          subtitle="Total pieces sold"
          icon={<PackageCheck className="w-4 h-4" />}
          accent="neutral"
        />

        {/* Low Stock Alerts */}
        <StatCard
          title="Low Stock Alerts"
          value={`${metrics?.low_stock_count || 0} items`}
          subtitle="Items needing restock"
          icon={<AlertTriangle className="w-4 h-4" />}
          accent={(metrics?.low_stock_count || 0) > 0 ? 'rose' : 'neutral'}
          onClick={onViewProductsClick}
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Trend Over Time */}
        <Card padding="lg" className="lg:col-span-8 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#2A2A24] text-base">Revenue Trend (DZD)</h3>
              <p className="text-xs text-[#6B6B63]">
                {isDayView ? `Hourly / Day view for ${selectedCalendarDate}` : 'Sales revenue performance'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#B5822F]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4A24C]" /> Total Revenue
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

        {/* Category Breakdown (Honey vs Fruits Donut Chart) */}
        <Card padding="lg" className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-[#2A2A24] text-base">Honey vs Fruits Revenue</h3>
            <p className="text-xs text-[#6B6B63]">Category revenue share</p>
          </div>

          <div className="h-52 w-full relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="revenue"
                  nameKey="category_name"
                >
                  {categoryDistribution.map((entry) => (
                    <Cell
                      key={entry.category_slug}
                      fill={CATEGORY_COLORS[entry.category_slug] || '#A0A096'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${formatDZD(Number(val))}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #EBEBE6',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] text-[#6B6B63] font-medium uppercase">Total Revenue</span>
              <span className="text-sm font-extrabold text-[#2A2A24]">
                {formatDZD(metrics?.total_revenue || 0)}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#EBEBE6]">
            {categoryDistribution.map((cat) => (
              <div key={cat.category_slug} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[cat.category_slug] || '#A0A096' }}
                  />
                  <span className="font-semibold text-[#2A2A24]">{cat.category_name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#2A2A24]">{formatDZD(cat.revenue)}</span>
                  <span className="text-[#6B6B63] block text-[10px]">
                    {Math.round(cat.units_sold)} pcs
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row: Top Selling Products & Quick Sell Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 5 Revenue Products */}
        <Card padding="lg" className="lg:col-span-7">
          <h3 className="font-bold text-[#2A2A24] text-base mb-1">Top Revenue Products</h3>
          <p className="text-xs text-[#6B6B63] mb-4">Highest earning inventory items</p>

          <div className="h-56 w-full">
            {topProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#6B6B63]">
                No sales recorded for this timeframe
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6B6B63' }} />
                  <YAxis
                    type="category"
                    dataKey="product_name"
                    tick={{ fontSize: 11, fill: '#2A2A24', fontWeight: 600 }}
                    width={120}
                  />
                  <Tooltip
                    formatter={(val: any) => [`${formatDZD(Number(val))}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #EBEBE6',
                    }}
                  />
                  <Bar dataKey="revenue" fill="#D4A24C" radius={[0, 8, 8, 0]} name="Revenue (DZD)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Quick Sell Banner */}
        <Card padding="lg" className="lg:col-span-5 bg-gradient-to-br from-[#FBF1DD] to-[#F5E6C8] border-[#F3E3BE] flex flex-col justify-between">
          <div className="space-y-2">
            <Badge variant="gold" className="w-fit">
              Quick Sell ⚡
            </Badge>
            <h3 className="text-xl font-bold text-[#2A2A24]">Process a New Sale</h3>
            <p className="text-xs text-[#6B6B63] leading-relaxed">
              Select honey or fruits, enter pieces, and record revenue in DZD immediately.
            </p>
          </div>

          <div className="pt-6">
            <Button
              onClick={onQuickSellClick}
              variant="gold"
              size="lg"
              leftIcon={<ShoppingBag className="w-5 h-5" />}
              className="w-full shadow-lg shadow-amber-500/20"
            >
              Open Quick Sell Register
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
