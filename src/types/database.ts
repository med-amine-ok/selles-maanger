export type ProductUnit = 'kg' | 'g' | 'jar' | 'piece' | 'liter' | 'box';

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mobile';

export interface HoneyAttributes {
  honey_type?: string;
  jar_size_g?: number;
  harvest_date?: string;
  origin_apiary?: string;
}

export interface FruitAttributes {
  variety?: string;
  origin_farm?: string;
  harvest_date?: string;
  is_organic?: boolean;
  ripeness?: string;
}

export type ProductAttributes = HoneyAttributes & FruitAttributes & Record<string, unknown>;

export interface AttributeSchemaField {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  label: string;
  required?: boolean;
  options?: string[];
}

export interface AttributeSchema {
  fields: AttributeSchemaField[];
}

export interface Category {
  id: string;
  slug: 'honey' | 'fruits' | string;
  name: string;
  description: string;
  icon?: string;
  accent_color: string;
  attribute_schema?: AttributeSchema;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  sku: string;
  description?: string;
  image_url?: string;
  unit: ProductUnit;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  attributes: ProductAttributes;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Sale {
  id: string;
  product_id: string;
  quantity_sold: number;
  unit_price_at_sale: number;
  total_amount: number;
  cost_price_at_sale: number;
  sale_date: string;
  customer_name?: string;
  payment_method?: PaymentMethod;
  notes?: string;
  created_at: string;
  product?: Product;
}

export type StockMovementType = 'sale' | 'restock' | 'correction' | 'sale_cancellation';

export interface StockMovement {
  id: string;
  product_id: string;
  type: StockMovementType;
  quantity_delta: number;
  reason?: string;
  sale_id?: string;
  created_at: string;
}

export type TimeRangeFilter = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';

export interface CustomDateRange {
  startDate: string;
  endDate: string;
}

export type ExpenseCategory = 'stock_purchase' | 'supplies' | 'transport' | 'utilities' | 'other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  expense_date: string;
  notes?: string;
  created_at: string;
}

export interface DashboardMetrics {
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  total_expenses: number;
  net_cash: number;
  units_sold: number;
  current_stock_value: number;
  low_stock_count: number;
}

export interface RevenueTrendItem {
  date_label: string;
  revenue: number;
  profit: number;
  sales_count: number;
}

export interface CategoryDistributionItem {
  category_slug: string;
  category_name: string;
  accent_color: string;
  revenue: number;
  units_sold: number;
}

export interface TopProductItem {
  product_id: string;
  product_name: string;
  category_slug: string;
  revenue: number;
  units_sold: number;
  unit: ProductUnit;
}
