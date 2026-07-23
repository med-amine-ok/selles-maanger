import { Category, Product, Sale } from '@/types/database';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'honey',
    name: 'Honey',
    description: 'Pure raw honey jars from local apiaries.',
    icon: 'amber',
    accent_color: '#D4A24C',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    slug: 'fruits',
    name: 'Fruits',
    description: 'Fresh seasonal farm fruits.',
    icon: 'apple',
    accent_color: '#7FB685',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'a1111111-0000-0000-0000-000000000001',
    category_id: '11111111-1111-1111-1111-111111111111',
    name: 'Wildflower Honey (500g)',
    sku: 'HNY-WILD-500',
    unit: 'piece',
    cost_price: 0,
    selling_price: 1500,
    stock_quantity: 32,
    low_stock_threshold: 8,
    attributes: {},
    is_active: true,
    created_at: new Date(Date.now() - 60 * 86400 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a1111111-0000-0000-0000-000000000002',
    category_id: '11111111-1111-1111-1111-111111111111',
    name: 'Lavender Honey (250g)',
    sku: 'HNY-LAV-250',
    unit: 'piece',
    cost_price: 0,
    selling_price: 1200,
    stock_quantity: 18,
    low_stock_threshold: 5,
    attributes: {},
    is_active: true,
    created_at: new Date(Date.now() - 55 * 86400 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a1111111-0000-0000-0000-000000000003',
    category_id: '11111111-1111-1111-1111-111111111111',
    name: 'Acacia Pure Honey (1kg)',
    sku: 'HNY-ACA-1000',
    unit: 'piece',
    cost_price: 0,
    selling_price: 2800,
    stock_quantity: 3, // Low stock
    low_stock_threshold: 5,
    attributes: {},
    is_active: true,
    created_at: new Date(Date.now() - 50 * 86400 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a1111111-0000-0000-0000-000000000004',
    category_id: '11111111-1111-1111-1111-111111111111',
    name: 'Eucalyptus Dark Honey (500g)',
    sku: 'HNY-EUC-500',
    unit: 'piece',
    cost_price: 0,
    selling_price: 1600,
    stock_quantity: 22,
    low_stock_threshold: 6,
    attributes: {},
    is_active: true,
    created_at: new Date(Date.now() - 40 * 86400 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b2222222-0000-0000-0000-000000000001',
    category_id: '22222222-2222-2222-2222-222222222222',
    name: 'Gala Apples Box',
    sku: 'FRT-APL-GALA',
    unit: 'piece',
    cost_price: 0,
    selling_price: 450,
    stock_quantity: 45,
    low_stock_threshold: 10,
    attributes: {},
    is_active: true,
    created_at: new Date(Date.now() - 60 * 86400 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b2222222-0000-0000-0000-000000000002',
    category_id: '22222222-2222-2222-2222-222222222222',
    name: 'Fresh Strawberries Box',
    sku: 'FRT-STR-500',
    unit: 'piece',
    cost_price: 0,
    selling_price: 600,
    stock_quantity: 28,
    low_stock_threshold: 8,
    attributes: {},
    is_active: true,
    created_at: new Date(Date.now() - 45 * 86400 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b2222222-0000-0000-0000-000000000003',
    category_id: '22222222-2222-2222-2222-222222222222',
    name: 'Fresh Bananas Box',
    sku: 'FRT-BAN-CAV',
    unit: 'piece',
    cost_price: 0,
    selling_price: 350,
    stock_quantity: 60,
    low_stock_threshold: 15,
    attributes: {},
    is_active: true,
    created_at: new Date(Date.now() - 50 * 86400 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b2222222-0000-0000-0000-000000000004',
    category_id: '22222222-2222-2222-2222-222222222222',
    name: 'Golden Mangoes Box',
    sku: 'FRT-MNG-GLD',
    unit: 'piece',
    cost_price: 0,
    selling_price: 850,
    stock_quantity: 14,
    low_stock_threshold: 5,
    attributes: {},
    is_active: true,
    created_at: new Date(Date.now() - 15 * 86400 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const generateInitialSales = (products: Product[]): Sale[] => {
  const sales: Sale[] = [];
  const customers = ['Samir', 'Karim', 'Yacine', 'Amin', 'Leila', 'Fatima'];
  const paymentMethods: ('cash' | 'card' | 'transfer' | 'mobile')[] = ['cash', 'card', 'transfer', 'mobile'];

  const now = Date.now();
  for (let i = 1; i <= 40; i++) {
    const daysAgo = Math.floor((i * 30) / 40);
    const saleDate = new Date(now - (daysAgo * 86400 * 1000 + (i % 6) * 3600 * 1000)).toISOString();
    const product = products[i % products.length];

    const qty = (i % 3) + 1; // Integer quantity pieces
    const unitPrice = product.selling_price;
    const total = qty * unitPrice;

    sales.push({
      id: `s-mock-${1000 + i}`,
      product_id: product.id,
      quantity_sold: qty,
      unit_price_at_sale: unitPrice,
      cost_price_at_sale: 0,
      total_amount: total,
      sale_date: saleDate,
      customer_name: customers[i % customers.length],
      payment_method: paymentMethods[i % paymentMethods.length],
      created_at: saleDate,
      product: product,
    });
  }

  return sales.sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime());
};
