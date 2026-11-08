'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useCart } from '@/lib/CartContext';
import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/types/store';
import AboutUsSection from '@/components/AboutUsSection';
import {
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Truck,
  Building2,
  Loader2,
  PackageCheck
} from 'lucide-react';

export default function HomePage() {
  const { t, lang } = useLanguage();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupabaseProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setProducts(data as Product[]);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.warn('Error fetching products from Supabase:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSupabaseProducts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-12 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]"></div>

        <div className="relative max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          {/* Hero Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] sm:text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t('heroBadge')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight">
            {t('heroTitle')}
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed px-1">
            {t('heroSubtitle')}
          </p>

          {/* Hero CTA buttons */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto sm:max-w-none">
            <Link
              href="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-black px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <span>{t('shopNow')}</span>
              {lang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>

            <Link
              href="/cart"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-white px-6 py-3.5 sm:py-4 rounded-xl font-bold text-sm transition cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'ar' ? 'سلة المشتريات' : 'Shopping Cart'}</span>
            </Link>
          </div>

          {/* Quick Trust Highlights */}
          <div className="pt-8 sm:pt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 border-t border-slate-800/80 mt-8 sm:mt-12 text-xs text-slate-400">
            <div className="flex items-center justify-center gap-2 py-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{lang === 'ar' ? 'تحويل محلي مباشر بدون اشتراكات' : 'Direct Domestic Syrian Transfer'}</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-1">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{lang === 'ar' ? 'حوالات رسمية: الهرم، الفؤاد، سيريتل، شام كاش' : 'Licensed Syrian Remittances'}</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-1">
              <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{lang === 'ar' ? 'توصيل ميداني مباشر ليد الأهل في سوريا' : 'Direct Field Fulfillment to Family'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section - strictly from Supabase */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{lang === 'ar' ? 'منتجات حقيقية من قاعدة البيانات' : 'Verified Supabase Catalog'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('featuredProducts')}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'ar'
                ? 'الباقات المعروضة مباشرة من مستودعات التجار المحليين في سوريا'
                : 'Direct goods dispatched by local vendors across Syria'}
            </p>
          </div>

          <Link
            href="/products"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 underline underline-offset-4 self-start sm:self-auto"
          >
            <span>{t('viewAll')}</span>
            {lang === 'ar' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-xs font-bold">{lang === 'ar' ? 'جارٍ تحميل المنتجات من قاعدة البيانات...' : 'Loading items from Supabase...'}</p>
          </div>
        ) : products.length === 0 ? (
          /* Empty State: No Items Available */
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 sm:p-16 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">
              {lang === 'ar' ? 'لا توجد عناصر متاحة حالياً' : 'No items available'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {lang === 'ar'
                ? 'قاعدة البيانات فارغة حالياً. يمكن للتجار المسجلين إضافة باقاتهم عبر لوحة تحكم التاجر.'
                : 'No products are currently published in the database. Vendors can add products from the Vendor Dashboard.'}
            </p>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {products.map((product) => {
              const title = lang === 'ar' ? product.title_ar : product.title_en || product.title_ar;
              const desc = lang === 'ar' ? product.description_ar : product.description_en || product.description_ar;
              const productSlug = product.slug || product.id;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-100 flex items-center justify-center">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-black text-xl">
                          سَنَد
                        </div>
                      )}
                      <span className="absolute top-3 end-3 bg-emerald-600 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                        {lang === 'ar' ? 'متوفر' : 'Available'}
                      </span>
                    </div>

                    <div className="p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
                        <Link href={`/products/${productSlug}`}>{title}</Link>
                      </h3>
                      {desc && (
                        <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                          {desc}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 bg-slate-50/70 border-t border-slate-100 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-xl sm:text-2xl font-black text-slate-900">${product.price_usd} USD</div>
                        <div className="text-[10px] text-emerald-700 font-bold">{t('oneTimePayment')}</div>
                      </div>
                      <Link
                        href={`/products/${productSlug}`}
                        className="text-xs font-bold text-slate-600 hover:text-emerald-700 underline underline-offset-4"
                      >
                        {t('details')} →
                      </Link>
                    </div>

                    {/* Add to Cart & Checkout Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{lang === 'ar' ? 'أضف للسلة' : 'Add to Cart'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          addToCart(product);
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'شراء الآن' : 'Buy Now'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 shadow-2xl border border-emerald-800/40">
          <div className="space-y-3 text-center md:text-start max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{t('satisfactionGuarantee')}</span>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black">
              {lang === 'ar'
                ? 'تحويل محلي آمن ومباشر 100% بين المغتربين والداخل السوري'
                : '100% Direct Local Remittance Flow to Syria'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {lang === 'ar'
                ? 'ندعم قنوات التحويل الرسمية في سوريا: شركة الهرم، شركة الفؤاد، محفظة سيريتل كاش، وشام كاش. يتم تسليم السلال والاحتياجات الأساسية ليد الأهل مباشرة بعد تحقق التاجر من رقم الإشعار.'
                : 'We support licensed Syrian remittance rails: Al-Haram, Al-Fouad, Syriatel Cash, and Cham Cash. Provisions are dispatched directly to your family in Syria once the local merchant verifies your transfer.'}
            </p>
          </div>

          <Link
            href="/products"
            className="w-full sm:w-auto text-center shrink-0 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 px-8 py-3.5 sm:py-4 rounded-xl font-black text-sm shadow-lg hover:shadow-xl transition cursor-pointer"
          >
            <span>{t('shopNow')}</span>
          </Link>
        </div>
      </section>

      {/* About Us & Developer Section */}
      <AboutUsSection />
    </div>
  );
}
