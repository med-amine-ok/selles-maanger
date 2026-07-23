-- ====================================================================
-- STOCK & SALES MANAGEMENT SYSTEM — SUPABASE DATABASE SCHEMA (DZD EDITION)
-- Product Categories: Honey & Fruits
-- Currency: DZD (Algerian Dinar) | Quantity: Integer Pieces
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. TABLES DEFINITION
-- --------------------------------------------------------------------

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    accent_color TEXT,
    attribute_schema JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    unit TEXT NOT NULL DEFAULT 'piece',
    cost_price NUMERIC(12, 0) NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
    selling_price NUMERIC(12, 0) NOT NULL CHECK (selling_price >= 0),
    stock_quantity NUMERIC(10, 0) NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_threshold NUMERIC(10, 0) NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
    attributes JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales Table
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity_sold NUMERIC(10, 0) NOT NULL CHECK (quantity_sold > 0),
    unit_price_at_sale NUMERIC(12, 0) NOT NULL CHECK (unit_price_at_sale >= 0),
    total_amount NUMERIC(12, 0) GENERATED ALWAYS AS (quantity_sold * unit_price_at_sale) STORED,
    cost_price_at_sale NUMERIC(12, 0) DEFAULT 0,
    sale_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    customer_name TEXT,
    payment_method TEXT DEFAULT 'cash', -- 'cash', 'card', 'transfer', 'mobile'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock Movements Audit Table
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('sale', 'restock', 'correction', 'sale_cancellation')),
    quantity_delta NUMERIC(10, 0) NOT NULL,
    reason TEXT,
    sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 2. INDEXES FOR HIGH-PERFORMANCE QUERIES
-- --------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

CREATE INDEX IF NOT EXISTS idx_sales_product_id ON public.sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON public.sales(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON public.stock_movements(product_id);

-- --------------------------------------------------------------------
-- 3. TRIGGERS & AUTOMATION
-- --------------------------------------------------------------------

-- Auto-update updated_at timestamp on products
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger Function: Deduct Stock on Sale INSERT (AFTER INSERT so NEW.id exists in sales table)
CREATE OR REPLACE FUNCTION public.handle_sale_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Deduct stock from products table
    UPDATE public.products
    SET stock_quantity = stock_quantity - NEW.quantity_sold
    WHERE id = NEW.product_id;

    -- Record stock movement audit
    INSERT INTO public.stock_movements (product_id, type, quantity_delta, reason, sale_id)
    VALUES (NEW.product_id, 'sale', -NEW.quantity_sold, 'Sale recorded in DZD: #' || NEW.id, NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sale_insert ON public.sales;
CREATE TRIGGER trg_sale_insert
    AFTER INSERT ON public.sales
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_sale_insert();

-- Trigger Function: Restore Stock on Sale DELETE / Refund
CREATE OR REPLACE FUNCTION public.handle_sale_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Restore stock back to products table
    UPDATE public.products
    SET stock_quantity = stock_quantity + OLD.quantity_sold
    WHERE id = OLD.product_id;

    -- Record stock movement audit
    INSERT INTO public.stock_movements (product_id, type, quantity_delta, reason, sale_id)
    VALUES (OLD.product_id, 'sale_cancellation', OLD.quantity_sold, 'Sale refunded: #' || OLD.id, OLD.id);

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sale_delete ON public.sales;
CREATE TRIGGER trg_sale_delete
    AFTER DELETE ON public.sales
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_sale_delete();

-- --------------------------------------------------------------------
-- 4. DASHBOARD AGGREGATION RPC FUNCTIONS
-- --------------------------------------------------------------------

-- Overall Dashboard Stats (DZD)
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(
    p_start_date TIMESTAMPTZ DEFAULT '1970-01-01 00:00:00+00',
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON AS $$
DECLARE
    v_revenue NUMERIC(12, 0);
    v_cost NUMERIC(12, 0);
    v_profit NUMERIC(12, 0);
    v_units NUMERIC(10, 0);
    v_stock_value NUMERIC(12, 0);
    v_low_stock_count INT;
    v_result JSON;
BEGIN
    SELECT 
        COALESCE(SUM(s.total_amount), 0),
        COALESCE(SUM(s.quantity_sold * s.cost_price_at_sale), 0),
        COALESCE(SUM(s.quantity_sold), 0)
    INTO v_revenue, v_cost, v_units
    FROM public.sales s
    WHERE s.sale_date >= p_start_date AND s.sale_date <= p_end_date;

    v_profit := v_revenue - v_cost;

    SELECT 
        COALESCE(SUM(p.stock_quantity * p.selling_price), 0),
        COUNT(*) FILTER (WHERE p.stock_quantity <= p.low_stock_threshold)
    INTO v_stock_value, v_low_stock_count
    FROM public.products p
    WHERE p.is_active = TRUE;

    v_result := json_build_object(
        'total_revenue', v_revenue,
        'total_cost', v_cost,
        'total_profit', v_profit,
        'units_sold', v_units,
        'current_stock_value', v_stock_value,
        'low_stock_count', v_low_stock_count
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Daily Revenue Trend (DZD)
CREATE OR REPLACE FUNCTION public.get_revenue_trend(
    p_start_date TIMESTAMPTZ DEFAULT (NOW() - INTERVAL '30 days'),
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    date_label TEXT,
    revenue NUMERIC(12, 0),
    profit NUMERIC(12, 0),
    sales_count INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TO_CHAR(DATE_TRUNC('day', s.sale_date), 'YYYY-MM-DD') AS date_label,
        COALESCE(SUM(s.total_amount), 0) AS revenue,
        COALESCE(SUM(s.total_amount - (s.quantity_sold * s.cost_price_at_sale)), 0) AS profit,
        COUNT(*)::INT AS sales_count
    FROM public.sales s
    WHERE s.sale_date >= p_start_date AND s.sale_date <= p_end_date
    GROUP BY DATE_TRUNC('day', s.sale_date)
    ORDER BY DATE_TRUNC('day', s.sale_date) ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Category Distribution (Honey vs Fruits DZD Revenue)
CREATE OR REPLACE FUNCTION public.get_category_distribution(
    p_start_date TIMESTAMPTZ DEFAULT '1970-01-01 00:00:00+00',
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    category_slug TEXT,
    category_name TEXT,
    accent_color TEXT,
    revenue NUMERIC(12, 0),
    units_sold NUMERIC(10, 0)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.slug AS category_slug,
        c.name AS category_name,
        c.accent_color,
        COALESCE(SUM(s.total_amount), 0) AS revenue,
        COALESCE(SUM(s.quantity_sold), 0) AS units_sold
    FROM public.categories c
    LEFT JOIN public.products p ON p.category_id = c.id
    LEFT JOIN public.sales s ON s.product_id = p.id AND s.sale_date >= p_start_date AND s.sale_date <= p_end_date
    GROUP BY c.id, c.slug, c.name, c.accent_color;
END;
$$ LANGUAGE plpgsql STABLE;

-- --------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public manage categories" ON public.categories FOR ALL USING (true);

CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public manage products" ON public.products FOR ALL USING (true);

CREATE POLICY "Allow public read sales" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Allow public manage sales" ON public.sales FOR ALL USING (true);

CREATE POLICY "Allow public read stock_movements" ON public.stock_movements FOR SELECT USING (true);
CREATE POLICY "Allow public insert stock_movements" ON public.stock_movements FOR INSERT WITH CHECK (true);
