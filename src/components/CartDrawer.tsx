'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, totalPriceUSD, totalItems } = useCart();
  const { lang } = useLanguage();
  const router = useRouter();

  if (!isCartOpen) return null;

  const estimatedSyp = (totalPriceUSD * 14800).toLocaleString('ar-SY');

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className={`fixed inset-y-0 ${lang === 'ar' ? 'left-0' : 'right-0'} max-w-full flex pl-0`}>
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-s border-slate-200 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">
                  {lang === 'ar' ? 'سلة المشتريات' : 'Shopping Cart'}
                </h2>
                <p className="text-xs text-slate-500">
                  {totalItems}{' '}
                  {lang === 'ar' ? (totalItems === 1 ? 'عنصر' : 'عناصر') : totalItems === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  {lang === 'ar' ? 'السلة فارغة حالياً' : 'Your cart is empty'}
                </h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  {lang === 'ar'
                    ? 'لم تقم بإضافة أي باقات أو منتجات بعد. تصفح المتجر واختر ما يناسب عائلتك في سوريا.'
                    : 'Explore our catalog and choose packages to send to your family in Syria.'}
                </p>
                <Link
                  href="/products"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                >
                  <span>{lang === 'ar' ? 'تصفح الباقات والمنتجات' : 'Browse Products'}</span>
                  {lang === 'ar' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const product = item.product;
                const title = lang === 'ar' ? product.title_ar : product.title_en || product.title_ar;
                const itemTotal = product.price_usd * item.quantity;

                return (
                  <div
                    key={product.id}
                    className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-start gap-3 relative group"
                  >
                    {/* Thumbnail */}
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={title}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 font-black flex items-center justify-center shrink-0 text-sm">
                        سَنَد
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                          {title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer shrink-0"
                          title={lang === 'ar' ? 'حذف من السلة' : 'Remove'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs font-black text-emerald-700">
                        ${product.price_usd} <span className="text-[10px] text-slate-400 font-normal">USD</span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg bg-white p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, item.quantity - 1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center font-bold text-xs text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, item.quantity + 1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-xs font-mono font-bold text-slate-800">
                          ${itemTotal.toFixed(2)} USD
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Checkout Action */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-white space-y-3.5 shadow-lg">
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between text-xs text-slate-500">
                  <span>{lang === 'ar' ? 'المجموع الإجمالي:' : 'Subtotal:'}</span>
                  <span className="font-mono text-sm font-bold text-slate-700">${totalPriceUSD.toFixed(2)} USD</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-black text-slate-900">{lang === 'ar' ? 'الإجمالي للدفع:' : 'Total Payable:'}</span>
                  <div className="text-end">
                    <span className="text-xl font-black text-emerald-700">${totalPriceUSD.toFixed(2)} USD</span>
                    <div className="text-[11px] text-slate-500 font-mono">
                      ≈ {estimatedSyp} <span className="text-[10px]">ل.س</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supported Remittance Badge */}
              <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{lang === 'ar' ? 'الدفع بحوالة محلية: الهرم • الفؤاد • سيريتل • شام كاش' : 'Direct Syrian Remittance • No Foreign Cards Required'}</span>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={handleCheckoutClick}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>{lang === 'ar' ? 'المتابعة لإتمام الطلب والدفع' : 'Proceed to Checkout'}</span>
                {lang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
