'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Building2,
  Sparkles
} from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPriceUSD, totalItems, clearCart } = useCart();
  const { lang, t } = useLanguage();
  const router = useRouter();

  const estimatedSyp = (totalPriceUSD * 14800).toLocaleString('ar-SY');

  return (
    <div
      className="min-h-screen bg-slate-50/60 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 w-full overflow-x-hidden"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{lang === 'ar' ? 'حقيبة التبرع والشراء العائلي' : 'Expat Shopping Cart'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {lang === 'ar' ? 'سلة المشتريات' : 'Your Shopping Cart'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'ar'
                ? 'راجع المنتجات والباقات المختارة قبل الانتقال لصفحة التحويل المحلي وإدخال رقم الإشعار.'
                : 'Review your selected packages before proceeding to local remittance checkout.'}
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition font-bold self-start sm:self-auto cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'تفريغ السلة بالكامل' : 'Clear Entire Cart'}</span>
            </button>
          )}
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 sm:p-16 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <ShoppingBag className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-lg font-black text-slate-800">
              {lang === 'ar' ? 'سلة المشتريات فارغة حالياً' : 'Your shopping cart is empty'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              {lang === 'ar'
                ? 'لم تقم بإضافة أي باقات بعد. يمكنك تصفح المنتجات المتوفرة من التجار المحليين في سوريا وإضافتها لسلتك.'
                : 'Browse our multi-vendor Syrian marketplace to add essential food, medical, or energy parcels.'}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black transition shadow-md hover:shadow-lg"
            >
              <span>{lang === 'ar' ? 'تصفح باقات المتجر الآن' : 'Browse Store Packages'}</span>
              {lang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
            
            {/* Items Column (2/3) */}
            <div className="lg:col-span-2 space-y-3.5">
              {items.map((item) => {
                const product = item.product;
                const title = lang === 'ar' ? product.title_ar : product.title_en || product.title_ar;
                const itemTotal = product.price_usd * item.quantity;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={title}
                          className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 font-black flex items-center justify-center shrink-0 text-base">
                          سَنَد
                        </div>
                      )}

                      <div className="space-y-1">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900">{title}</h3>
                        <p className="text-xs text-slate-500">
                          {lang === 'ar' ? 'التاجر المعتمد:' : 'Vendor:'}{' '}
                          <span className="font-semibold text-emerald-800">
                            {product.vendor_name || 'مستودعات الشام والمحافظات'}
                          </span>
                        </p>
                        <div className="text-sm font-black text-emerald-700 pt-0.5">
                          ${product.price_usd} <span className="text-xs text-slate-400 font-normal">USD</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 border border-slate-200 rounded-xl bg-slate-50/70 p-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-2xs"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold text-xs text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total for Item */}
                      <div className="text-end min-w-[70px]">
                        <div className="text-sm font-mono font-black text-slate-900">
                          ${itemTotal.toFixed(2)}
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(product.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        title={lang === 'ar' ? 'حذف' : 'Remove'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Column (1/3) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
              <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
                {lang === 'ar' ? 'ملخص الفاتورة' : 'Order Summary'}
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>{lang === 'ar' ? 'عدد الباقات' : 'Total Items'}</span>
                  <span className="font-bold text-slate-900">{totalItems}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>{lang === 'ar' ? 'عمولة المنصة' : 'Platform Fee'}</span>
                  <span className="font-bold text-emerald-700">$0.00 (إنساني مجاني)</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-sm font-black text-slate-900">{lang === 'ar' ? 'المبلغ المطلوب' : 'Total Due'}</span>
                  <div className="text-end">
                    <span className="text-2xl font-black text-emerald-700">${totalPriceUSD.toFixed(2)} USD</span>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      ≈ {estimatedSyp} <span className="text-[10px]">ل.س</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remittance badge */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>{lang === 'ar' ? 'قنوات التحويل المدعومة' : 'Supported Rails'}</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {lang === 'ar'
                    ? 'الهرم للحوالات • الفؤاد • سيريتل كاش • شام كاش'
                    : 'Al-Haram, Al-Fouad, Syriatel Cash, Cham Cash'}
                </p>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>{lang === 'ar' ? 'المتابعة للدفع وإدخال رقم الإشعار' : 'Proceed to Checkout'}</span>
                {lang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
