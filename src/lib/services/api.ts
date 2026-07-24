import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  Category,
  Product,
  ProductUnit,
  Sale,
  Expense,
  ExpenseCategory,
  DashboardMetrics,
  RevenueTrendItem,
  CategoryDistributionItem,
  TopProductItem,
  TimeRangeFilter,
  CustomDateRange,
  PaymentMethod,
} from '@/types/database';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, generateInitialSales } from '@/lib/mock-data/seed';
import {
  subDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  parseISO,
  format,
} from 'date-fns';

const STORAGE_KEYS = {
  CATEGORIES: 'selles_categories_v2',
  PRODUCTS: 'selles_products_v2',
  SALES: 'selles_sales_v2',
  EXPENSES: 'selles_expenses_v2',
};

const getLocalCategories = (): Category[] => {
  if (typeof window === 'undefined') return INITIAL_CATEGORIES;
  const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_CATEGORIES;
  }
};

const getLocalProducts = (): Product[] => {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_PRODUCTS;
  }
};

const saveLocalProducts = (products: Product[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }
};

const getLocalSales = (): Sale[] => {
  if (typeof window === 'undefined') return generateInitialSales(INITIAL_PRODUCTS);
  const stored = localStorage.getItem(STORAGE_KEYS.SALES);
  if (!stored) {
    const products = getLocalProducts();
    const initialSales = generateInitialSales(products);
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(initialSales));
    return initialSales;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

const saveLocalSales = (sales: Sale[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }
};

const getLocalExpenses = (): Expense[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

const saveLocalExpenses = (expenses: Expense[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }
};

export const getDateIntervalForFilter = (
  filter: TimeRangeFilter,
  customRange?: CustomDateRange
): { start: Date; end: Date } => {
  const now = new Date();
  switch (filter) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'year':
      return { start: startOfYear(now), end: endOfYear(now) };
    case 'custom':
      if (customRange?.startDate && customRange?.endDate) {
        return {
          start: startOfDay(parseISO(customRange.startDate)),
          end: endOfDay(parseISO(customRange.endDate)),
        };
      }
      return { start: subDays(now, 30), end: now };
    case 'all':
    default:
      return { start: new Date(0), end: new Date('2099-12-31') };
  }
};

export const api = {
  isDemoMode: (): boolean => !isSupabaseConfigured(),

  resetDemoData: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(generateInitialSales(INITIAL_PRODUCTS)));
    }
  },

  getCategories: async (): Promise<Category[]> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error && data) {
        if (data.length === 0) {
          await supabase.from('categories').upsert(INITIAL_CATEGORIES);
          return INITIAL_CATEGORIES;
        }
        return data as Category[];
      }
    }
    return getLocalCategories();
  },

  getProducts: async (categoryId?: string, search?: string): Promise<Product[]> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      let query = supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .order('name');

      if (categoryId && categoryId !== 'all') {
        query = query.eq('category_id', categoryId);
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
      }
      const { data, error } = await query;
      if (!error && data) return data as Product[];
    }

    let products = getLocalProducts().filter((p) => p.is_active);
    const categories = getLocalCategories();

    products = products.map((p) => ({
      ...p,
      category: categories.find((c) => c.id === p.category_id),
    }));

    if (categoryId && categoryId !== 'all') {
      products = products.filter((p) => p.category_id === categoryId || p.category?.slug === categoryId);
    }
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
    }
    return products;
  },

  getProductById: async (id: string): Promise<Product | null> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('id', id)
        .single();
      if (!error && data) return data as Product;
    }
    const products = getLocalProducts();
    const categories = getLocalCategories();
    const found = products.find((p) => p.id === id);
    if (!found) return null;
    return {
      ...found,
      category: categories.find((c) => c.id === found.category_id),
    };
  },

  createProduct: async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      // Ensure category exists in Supabase to prevent foreign key errors
      const { data: cat } = await supabase.from('categories').select('id').eq('id', productData.category_id).maybeSingle();
      if (!cat) {
        const isHoney = productData.category_id.includes('1111') || productData.sku.startsWith('HNY');
        const defaultCat = {
          id: productData.category_id,
          slug: isHoney ? 'honey' : 'fruits',
          name: isHoney ? 'Honey' : 'Fruits',
          description: isHoney ? 'Honey products' : 'Fruit products',
          accent_color: isHoney ? '#D4A24C' : '#7FB685',
        };
        await supabase.from('categories').upsert([defaultCat]);
      }

      const { data, error } = await supabase.from('products').insert([productData]).select().single();
      if (!error && data) return data as Product;
      if (error) throw new Error(error.message);
    }

    const products = getLocalProducts();
    const newProduct: Product = {
      ...productData,
      id: 'p-custom-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    products.unshift(newProduct);
    saveLocalProducts(products);
    return newProduct;
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as Product;
      if (error) throw new Error(error.message);
    }

    const products = getLocalProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    const updated = { ...products[idx], ...updates, updated_at: new Date().toISOString() };
    products[idx] = updated;
    saveLocalProducts(products);
    return updated;
  },

  archiveProduct: async (id: string): Promise<void> => {
    await api.updateProduct(id, { is_active: false });
  },

  restockProduct: async (id: string, quantityToAdd: number): Promise<Product> => {
    const product = await api.getProductById(id);
    if (!product) throw new Error('Product not found');
    const newStock = Math.max(0, Math.round(product.stock_quantity + quantityToAdd));
    return await api.updateProduct(id, { stock_quantity: newStock });
  },

  recordSale: async (saleParams: {
    product_id: string;
    quantity_sold: number;
    unit_price_at_sale?: number;
    customer_name?: string;
    payment_method?: PaymentMethod;
    notes?: string;
    sale_date?: string;
  }): Promise<Sale> => {
    const product = await api.getProductById(saleParams.product_id);
    if (!product) throw new Error('Product not found');

    const intQty = Math.floor(saleParams.quantity_sold);

    if (product.stock_quantity < intQty) {
      throw new Error(`Insufficient stock. Current stock: ${Math.round(product.stock_quantity)} pcs`);
    }

    const unitPrice = Math.round(saleParams.unit_price_at_sale ?? product.selling_price);
    const saleDate = saleParams.sale_date ?? new Date().toISOString();

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('sales')
        .insert([
          {
            product_id: saleParams.product_id,
            quantity_sold: intQty,
            unit_price_at_sale: unitPrice,
            cost_price_at_sale: product.cost_price,
            customer_name: saleParams.customer_name || null,
            payment_method: saleParams.payment_method || 'cash',
            notes: saleParams.notes || null,
            sale_date: saleDate,
          },
        ])
        .select('*, product:products(*)')
        .single();
      if (!error && data) return data as Sale;
      if (error) throw new Error(error.message);
    }

    const sales = getLocalSales();
    const newSale: Sale = {
      id: 's-' + Date.now(),
      product_id: saleParams.product_id,
      quantity_sold: intQty,
      unit_price_at_sale: unitPrice,
      cost_price_at_sale: product.cost_price,
      total_amount: intQty * unitPrice,
      sale_date: saleDate,
      customer_name: saleParams.customer_name,
      payment_method: saleParams.payment_method || 'cash',
      notes: saleParams.notes,
      created_at: new Date().toISOString(),
      product,
    };

    await api.updateProduct(product.id, {
      stock_quantity: Math.max(0, Math.round(product.stock_quantity - intQty)),
    });

    sales.unshift(newSale);
    saveLocalSales(sales);
    return newSale;
  },

  recordMultiSale: async (saleParams: {
    items: Array<{
      product_id: string;
      quantity_sold: number;
      unit_price_at_sale?: number;
    }>;
    customer_name?: string;
    payment_method?: PaymentMethod;
    notes?: string;
    sale_date?: string;
  }): Promise<Sale[]> => {
    const createdSales: Sale[] = [];
    const saleDate = saleParams.sale_date ?? new Date().toISOString();

    for (const item of saleParams.items) {
      const created = await api.recordSale({
        product_id: item.product_id,
        quantity_sold: item.quantity_sold,
        unit_price_at_sale: item.unit_price_at_sale,
        customer_name: saleParams.customer_name,
        payment_method: saleParams.payment_method,
        notes: saleParams.notes,
        sale_date: saleDate,
      });
      createdSales.push(created);
    }

    return createdSales;
  },

  getSales: async (filters?: {
    category_id?: string;
    product_id?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Sale[]> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      let query = supabase
        .from('sales')
        .select('*, product:products(*, category:categories(*))')
        .order('sale_date', { ascending: false });

      if (filters?.product_id) query = query.eq('product_id', filters.product_id);
      if (filters?.startDate) query = query.gte('sale_date', filters.startDate);
      if (filters?.endDate) query = query.lte('sale_date', filters.endDate);

      const { data, error } = await query;
      if (!error && data) {
        let result = data as Sale[];
        if (filters?.category_id && filters.category_id !== 'all') {
          result = result.filter(
            (s) => s.product?.category_id === filters.category_id || s.product?.category?.slug === filters.category_id
          );
        }
        return result;
      }
    }

    let sales = getLocalSales();
    const products = await api.getProducts();

    sales = sales.map((s) => ({
      ...s,
      product: s.product || products.find((p) => p.id === s.product_id),
    }));

    if (filters?.product_id) {
      sales = sales.filter((s) => s.product_id === filters.product_id);
    }
    if (filters?.category_id && filters.category_id !== 'all') {
      sales = sales.filter(
        (s) => s.product?.category_id === filters.category_id || s.product?.category?.slug === filters.category_id
      );
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      sales = sales.filter(
        (s) =>
          s.product?.name.toLowerCase().includes(q) ||
          s.customer_name?.toLowerCase().includes(q) ||
          s.notes?.toLowerCase().includes(q)
      );
    }
    if (filters?.startDate || filters?.endDate) {
      const start = filters.startDate ? parseISO(filters.startDate) : new Date(0);
      const end = filters.endDate ? parseISO(filters.endDate) : new Date('2099-12-31');
      sales = sales.filter((s) => {
        const d = parseISO(s.sale_date);
        return d >= start && d <= end;
      });
    }

    return sales.sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime());
  },

  deleteSale: async (id: string): Promise<void> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }

    const sales = getLocalSales();
    const target = sales.find((s) => s.id === id);
    if (target) {
      const product = await api.getProductById(target.product_id);
      if (product) {
        await api.updateProduct(product.id, {
          stock_quantity: Math.round(product.stock_quantity + target.quantity_sold),
        });
      }
      const updatedSales = sales.filter((s) => s.id !== id);
      saveLocalSales(updatedSales);
    }
  },

  getExpenses: async (filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<Expense[]> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      let query = supabase.from('expenses').select('*').order('expense_date', { ascending: false });
      if (filters?.startDate) {
        const startISO = new Date(filters.startDate).toISOString();
        query = query.gte('expense_date', startISO);
      }
      if (filters?.endDate) {
        const endISO = endOfDay(new Date(filters.endDate)).toISOString();
        query = query.lte('expense_date', endISO);
      }
      const { data, error } = await query;
      if (!error && data) return data as Expense[];
    }

    let expenses = getLocalExpenses();
    if (filters?.startDate) {
      const start = new Date(filters.startDate).getTime();
      expenses = expenses.filter((e) => new Date(e.expense_date).getTime() >= start);
    }
    if (filters?.endDate) {
      const end = endOfDay(new Date(filters.endDate)).getTime();
      expenses = expenses.filter((e) => new Date(e.expense_date).getTime() <= end);
    }
    return expenses;
  },

  createExpense: async (expenseData: {
    title: string;
    amount: number;
    category?: ExpenseCategory;
    expense_date?: string;
    notes?: string;
  }): Promise<Expense> => {
    const supabase = getSupabaseClient();
    const newExpense = {
      title: expenseData.title,
      amount: Math.round(expenseData.amount),
      category: expenseData.category || 'other',
      expense_date: expenseData.expense_date || new Date().toISOString(),
      notes: expenseData.notes || '',
    };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('expenses').insert([newExpense]).select().single();
        if (!error && data) return data as Expense;
        if (error) console.error('Supabase expense table notice:', error.message);
      } catch (err: any) {
        console.error('Supabase expense insert fallback:', err?.message);
      }
    }

    const expenses = getLocalExpenses();
    const created: Expense = {
      ...newExpense,
      id: 'exp-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    expenses.unshift(created);
    saveLocalExpenses(expenses);
    return created;
  },

  deleteExpense: async (id: string): Promise<void> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }

    const expenses = getLocalExpenses().filter((e) => e.id !== id);
    saveLocalExpenses(expenses);
  },

  getDashboardMetrics: async (
    timeRange: TimeRangeFilter,
    customRange?: CustomDateRange
  ): Promise<DashboardMetrics> => {
    const interval = getDateIntervalForFilter(timeRange, customRange);
    const supabase = getSupabaseClient();

    if (supabase) {
      const { data, error } = await supabase.rpc('get_dashboard_stats', {
        p_start_date: interval.start.toISOString(),
        p_end_date: interval.end.toISOString(),
      });
      if (!error && data) return data as DashboardMetrics;
    }

    const sales = await api.getSales({
      startDate: interval.start.toISOString(),
      endDate: interval.end.toISOString(),
    });
    const expenses = await api.getExpenses({
      startDate: interval.start.toISOString(),
      endDate: interval.end.toISOString(),
    });
    const products = await api.getProducts();

    const total_revenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
    const total_cost = sales.reduce((sum, s) => sum + s.quantity_sold * (s.cost_price_at_sale || 0), 0);
    const total_profit = total_revenue - total_cost;
    const total_expenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const net_cash = total_revenue - total_expenses;
    const units_sold = sales.reduce((sum, s) => sum + s.quantity_sold, 0);

    const current_stock_value = products.reduce((sum, p) => sum + p.stock_quantity * p.selling_price, 0);
    const low_stock_count = products.filter((p) => p.stock_quantity <= p.low_stock_threshold).length;

    return {
      total_revenue: Math.round(total_revenue),
      total_cost: Math.round(total_cost),
      total_profit: Math.round(total_profit),
      total_expenses: Math.round(total_expenses),
      net_cash: Math.round(net_cash),
      units_sold: Math.round(units_sold),
      current_stock_value: Math.round(current_stock_value),
      low_stock_count,
    };
  },

  getRevenueTrend: async (
    timeRange: TimeRangeFilter,
    customRange?: CustomDateRange
  ): Promise<RevenueTrendItem[]> => {
    const interval = getDateIntervalForFilter(timeRange, customRange);
    const sales = await api.getSales({
      startDate: interval.start.toISOString(),
      endDate: interval.end.toISOString(),
    });

    const map: Record<string, { revenue: number; profit: number; sales_count: number }> = {};

    sales.forEach((s) => {
      const dateKey = format(parseISO(s.sale_date), 'yyyy-MM-dd');
      if (!map[dateKey]) {
        map[dateKey] = { revenue: 0, profit: 0, sales_count: 0 };
      }
      map[dateKey].revenue += s.total_amount;
      map[dateKey].profit += s.total_amount - s.quantity_sold * (s.cost_price_at_sale || 0);
      map[dateKey].sales_count += 1;
    });

    return Object.entries(map)
      .map(([date_label, values]) => ({
        date_label,
        revenue: Math.round(values.revenue),
        profit: Math.round(values.profit),
        sales_count: values.sales_count,
      }))
      .sort((a, b) => a.date_label.localeCompare(b.date_label));
  },

  getCategoryDistribution: async (
    timeRange: TimeRangeFilter,
    customRange?: CustomDateRange
  ): Promise<CategoryDistributionItem[]> => {
    const interval = getDateIntervalForFilter(timeRange, customRange);
    const sales = await api.getSales({
      startDate: interval.start.toISOString(),
      endDate: interval.end.toISOString(),
    });
    const categories = await api.getCategories();

    const map: Record<string, { revenue: number; units_sold: number }> = {
      honey: { revenue: 0, units_sold: 0 },
      fruits: { revenue: 0, units_sold: 0 },
    };

    sales.forEach((s) => {
      const catSlug = s.product?.category?.slug || (s.product?.category_id.includes('1111') ? 'honey' : 'fruits');
      if (!map[catSlug]) map[catSlug] = { revenue: 0, units_sold: 0 };
      map[catSlug].revenue += s.total_amount;
      map[catSlug].units_sold += s.quantity_sold;
    });

    return categories.map((cat) => ({
      category_slug: cat.slug,
      category_name: cat.name,
      accent_color: cat.accent_color,
      revenue: Math.round(map[cat.slug]?.revenue || 0),
      units_sold: Math.round(map[cat.slug]?.units_sold || 0),
    }));
  },

  getTopProducts: async (
    timeRange: TimeRangeFilter,
    limit: number = 5,
    customRange?: CustomDateRange
  ): Promise<TopProductItem[]> => {
    const interval = getDateIntervalForFilter(timeRange, customRange);
    const sales = await api.getSales({
      startDate: interval.start.toISOString(),
      endDate: interval.end.toISOString(),
    });

    const map: Record<
      string,
      { product_name: string; category_slug: string; revenue: number; units_sold: number; unit: ProductUnit }
    > = {};

    sales.forEach((s) => {
      const pid = s.product_id;
      if (!map[pid]) {
        map[pid] = {
          product_name: s.product?.name || 'Unknown Product',
          category_slug: s.product?.category?.slug || 'general',
          revenue: 0,
          units_sold: 0,
          unit: 'piece',
        };
      }
      map[pid].revenue += s.total_amount;
      map[pid].units_sold += s.quantity_sold;
    });

    return Object.entries(map)
      .map(([product_id, data]) => ({
        product_id,
        product_name: data.product_name,
        category_slug: data.category_slug,
        revenue: Math.round(data.revenue),
        units_sold: Math.round(data.units_sold),
        unit: 'piece' as const,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  },
};
