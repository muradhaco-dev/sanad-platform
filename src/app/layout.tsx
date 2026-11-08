import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { CartProvider } from '@/lib/CartContext';
import CartDrawer from '@/components/CartDrawer';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Sanad Store | Premium One-Time Essentials & Goods',
  description: 'Clean, transparent one-time purchase e-commerce platform. Buy essential family packages, emergency medical kits, and power supplies with zero subscriptions.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#059669',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white overflow-x-hidden">
        <LanguageProvider>
          <CartProvider>
            <Suspense fallback={null}>
              <Navbar />
            </Suspense>
            <CartDrawer />
            <main className="flex-1 w-full max-w-full overflow-x-hidden">
              <Suspense fallback={null}>
                {children}
              </Suspense>
            </main>
            <Footer />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
