import type { Metadata, Viewport } from 'next';
import './globals.css';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import { ToastProvider } from '@/lib/context/ToastContext';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Stock & Sales — Honey & Fruits Sales Management',
  description: 'Mobile-first sales, inventory tracking, and analytics app for Honey and Fruits small business.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FAFAF7',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
