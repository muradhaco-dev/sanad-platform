'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Globe, ShieldCheck, Truck, ShoppingBag, Home } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
        {/* Top micro banner */}
        <div className="bg-emerald-800 text-white text-xs py-1.5 px-4 text-center flex flex-wrap items-center justify-center gap-2 font-medium">
          <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300 shrink-0" />
          <span>منصة سَنَد: جسر المحبة والأمان بين المغترب السوري وأهله في الوطن</span>
          <span className="bg-emerald-900/90 px-2 py-0.5 rounded text-[11px] font-mono">
            سعر الصرف: 1$ ≈ 14,800 ل.س
          </span>
        </div>

        <nav className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform">
              س
            </div>
            <div>
              <div className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-1">
                <span>سَنَد</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">SANAD</span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium hidden sm:block">خدمة العائلة في سوريا</p>
            </div>
          </Link>

          {/* Quick Direct Switchers - Visible on ALL screen sizes */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/"
              className={`p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                pathname === '/'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              title="الرئيسية"
            >
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">الرئيسية</span>
            </Link>

            {/* Expatriate Dashboard Button */}
            <Link
              href="/dashboard/expatriate"
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                pathname.includes('/expatriate')
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>لوحة المغترب</span>
            </Link>

            {/* Provider Dashboard Button */}
            <Link
              href="/dashboard/provider"
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                pathname.includes('/provider')
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-amber-700" />
              <span>لوحة المزود (سوريا)</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Floating Demo Navigation Bar for complete clarity */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 shadow-md flex items-center justify-between border-b border-slate-800">
        <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-gray-200">وضع التجربة الحية (Demo):</span>
            <span className="text-gray-400 hidden sm:inline">انتقل مباشرة بين واجهة المغترب وواجهة مزود الخدمة داخل سوريا:</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/expatriate"
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                pathname.includes('/expatriate')
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-gray-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              👤 فتح لوحة المغترب
            </Link>

            <Link
              href="/dashboard/provider"
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                pathname.includes('/provider')
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-amber-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              🚚 فتح لوحة المزود (سوريا)
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
