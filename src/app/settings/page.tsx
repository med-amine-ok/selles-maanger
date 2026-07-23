'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { api } from '@/lib/services/api';
import { useToast } from '@/lib/context/ToastContext';
import { Database, Sparkles, Copy, RefreshCw, Check, ShieldCheck, Cpu } from 'lucide-react';

export default function SettingsPage() {
  const isConfigured = isSupabaseConfigured();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [currency, setCurrency] = useState('$');

  const sqlSchemaSnippet = `-- Run this in your Supabase SQL Editor:
-- Table: categories, products, sales, stock_movements
-- Triggers: handle_sale_stock_change, handle_updated_at
-- RPC: get_dashboard_stats, get_revenue_trend, get_category_distribution

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    accent_color TEXT,
    attribute_schema JSONB DEFAULT '{}'::jsonb
);
-- ... (Full SQL schema is available in supabase_schema.sql file)`;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopied(true);
    showToast('SQL Copied 📋', 'Supabase migration script copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all local demo data back to default mock products and 60-day sales history?')) {
      api.resetDemoData();
      showToast('Demo Data Reset 🔄', 'Restored 11 mock products and 60 days of sales history', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#2A2A24]">Application Settings</h2>
        <p className="text-xs sm:text-sm text-[#6B6B63] mt-0.5">
          Configure database connection, preferences, and view category schemas
        </p>
      </div>

      {/* Supabase Connection Status Card */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#2A2A24] text-base">Backend Database Status</h3>
              <p className="text-xs text-[#6B6B63]">
                {isConfigured ? 'Connected to live Supabase PostgreSQL project' : 'Running in Interactive Seeded Demo Mode'}
              </p>
            </div>
          </div>

          <Badge variant={isConfigured ? 'green' : 'amber'}>
            {isConfigured ? 'Live Supabase DB' : 'Demo Mode Active'}
          </Badge>
        </div>

        {!isConfigured && (
          <div className="bg-[#FAFAF7] border border-[#EBEBE6] p-4 rounded-2xl space-y-3 text-xs text-[#6B6B63]">
            <p className="leading-relaxed">
              <strong className="text-[#2A2A24]">How to connect your own Supabase project:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[#2A2A24]">
              <li>Create a project on <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#B5822F] underline">Supabase.com</a></li>
              <li>Execute the <code className="bg-stone-200 px-1 py-0.5 rounded text-[11px]">supabase_schema.sql</code> script in the SQL Editor.</li>
              <li>Copy project URL & anon key into your <code className="bg-stone-200 px-1 py-0.5 rounded text-[11px]">.env.local</code> environment file.</li>
            </ol>
          </div>
        )}
      </Card>

      {/* SQL Migration Exporter */}
      <Card padding="lg" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#2A2A24] text-base">Supabase SQL Schema Script</h3>
            <p className="text-xs text-[#6B6B63]">Includes RLS policies, stock triggers, and RPC functions</p>
          </div>
          <Button onClick={handleCopySQL} variant="outline" size="sm" leftIcon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#D4A24C]" />}>
            {copied ? 'Copied!' : 'Copy SQL'}
          </Button>
        </div>

        <pre className="bg-[#2A2A24] text-amber-200 p-4 rounded-2xl text-xs overflow-x-auto font-mono max-h-40">
          {sqlSchemaSnippet}
        </pre>
      </Card>

      {/* Preferences & Reset */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Attribute Schemas */}
        <Card padding="md" className="space-y-3">
          <h3 className="font-bold text-[#2A2A24] text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#7FB685]" />
            <span>Category Attribute Schemas</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-[#FBF1DD] border border-[#F3E3BE] rounded-xl text-[#B5822F]">
              <span className="font-bold block">🍯 Honey Attributes:</span>
              <span className="text-[11px]">honey_type, jar_size_g, harvest_date, origin_apiary</span>
            </div>

            <div className="p-3 bg-[#E7F3E9] border border-[#CDE5D2] rounded-xl text-[#4F8A5B]">
              <span className="font-bold block">🍎 Fruit Attributes:</span>
              <span className="text-[11px]">variety, origin_farm, harvest_date, is_organic, ripeness</span>
            </div>
          </div>
        </Card>

        {/* Demo Data Reset Action */}
        <Card padding="md" className="space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-[#2A2A24] text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#D4A24C]" />
              <span>Reset Local Demo Data</span>
            </h3>
            <p className="text-xs text-[#6B6B63] mt-1">
              Restore default Honey Jars, Fruits, and 60-day historical sales generator.
            </p>
          </div>

          <Button onClick={handleResetDemoData} variant="secondary" size="sm" className="w-full mt-3">
            Reset Demo Database
          </Button>
        </Card>
      </div>
    </div>
  );
}
