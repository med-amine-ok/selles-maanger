# 🍯 Stock & Sales — Honey & Fruits Management Web App

A boutique, mobile-first sales and inventory management application designed for small business owners selling **Honey** and **Fruits**. 

---

## 🌟 Key Features

- 📱 **Mobile-First Native App Experience**: Bottom tab bar, floating gold **Quick Sell FAB button**, responsive bottom sheet dialogs, large touch targets, no horizontal scrolling.
- 🍯 **Honey & Fruit Specific Category Attributes**: Dynamic JSONB schema fields (Honey: `honey_type`, `jar_size_g`, `harvest_date`, `origin_apiary`; Fruits: `variety`, `origin_farm`, `harvest_date`, `is_organic`, `ripeness`).
- ⚡ **Instant Sell Flow**: Record sales in seconds, edit price/discounts on the fly, validate stock availability, and automatically deduct inventory stock via Postgres DB triggers or local state engine.
- 🔄 **Sales History & Stock Restoration**: Reverse-chronological transaction log with filters, CSV export, and deletion (which automatically restores stock into inventory!).
- 📊 **Analytics Dashboard**: Real-time stats (Total Revenue, Total Profit, Units Sold, Stock Value, Low Stock Alerts) with time-range filtering (**Today / This Week / This Month / This Year / All Time / Custom**) and interactive Recharts charts.
- ⚡ **Dual Data Layer**: Works out-of-the-box with **Supabase PostgreSQL** or an **interactive seeded local demo mode** (pre-populated with 11 products and 60 days of sales history).

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + Custom Boutique Design Tokens (Honey Gold `#D4A24C`, Soft Green `#7FB685`, Off-white `#FAFAF7`)
- **Backend / Database**: Supabase (PostgreSQL + RLS + Triggers + RPC Aggregations)
- **Data Fetching & State**: TanStack React Query v5
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Icons & Motion**: Lucide React + Framer Motion

---

## 🚀 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser (or open Chrome DevTools in Mobile Device Mode 390px).

---

## 🗄 Connecting to Your Supabase Project

1. Create a new project at [Supabase.com](https://supabase.com).
2. Open the **SQL Editor** in Supabase and run the provided `supabase_schema.sql` script. This sets up all tables, indexes, triggers, RPC aggregation functions, RLS policies, and seed mock data.
3. Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
```

4. Restart `npm run dev`. The app will automatically connect to your live Supabase database!
