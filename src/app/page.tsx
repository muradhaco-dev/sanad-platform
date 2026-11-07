'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { STORE_PRODUCTS } from '@/lib/products';
import LemonCheckoutButton from '@/components/LemonCheckoutButton';
import AboutUsSection from '@/components/AboutUsSection';
import {
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
  Sparkles,
  Lock,
  Truck,
  Heart,
  RotateCcw
} from 'lucide-react';

export default function HomePage() {
  const { t, lang } = useLanguage();

  const featuredProducts = STORE_PRODUCTS.filter((p) => p.is_featured);

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
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-white px-6 py-3.5 sm:py-4 rounded-xl font-bold text-sm transition cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>{t('orders')}</span>
            </Link>
          </div>

          {/* Quick Trust Highlights */}
          <div className="pt-8 sm:pt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 border-t border-slate-800/80 mt-8 sm:mt-12 text-xs text-slate-400">
            <div className="flex items-center justify-center gap-2 py-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{lang === 'ar' ? 'بدون أي اشتراكات دورية' : 'Zero Recurring Subscriptions'}</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-1">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{lang === 'ar' ? 'تاجر مسجل رسمي (Lemon Squeezy)' : 'Authorized Merchant of Record'}</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-1">
              <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{lang === 'ar' ? 'توصيل ميداني مباشر خلال 24 ساعة' : 'Direct 24-48h Field Fulfillment'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars / Conversion Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md sm:shadow-lg space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg sm:text-xl">
              1
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">{t('feature1Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('feature1Desc')}</p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md sm:shadow-lg space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg sm:text-xl">
              2
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">{t('feature2Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('feature2Desc')}</p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md sm:shadow-lg space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg sm:text-xl">
              3
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">{t('feature3Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('feature3Desc')}</p>
          </div>
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>{t('oneTimePayment')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('featuredProducts')}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'ar'
                ? 'اختر الباقة المطلوبة واطلبها بضغطة زر واحدة وآمنة'
                : 'Select your package and checkout with a single transparent payment'}
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

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {featuredProducts.map((product) => {
            const title = lang === 'ar' ? product.title_ar : product.title_en;
            const desc = lang === 'ar' ? product.description_ar : product.description_en;
            const badge = lang === 'ar' ? product.badge_ar : product.badge_en;
            const items = lang === 'ar' ? product.items_ar : product.items_en;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-100">
                    <img
                      src={product.image_url}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {badge && (
                      <span className="absolute top-3 end-3 sm:top-4 sm:end-4 bg-emerald-600 text-white text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1 rounded-full shadow-md">
                        {badge}
                      </span>
                    )}
                  </div>

                  <div className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
                      <Link href={`/products/${product.slug}`}>{title}</Link>
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                      {desc}
                    </p>

                    <div className="border-t border-slate-100 pt-3 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-700 mb-1">
                        {t('whatsIncluded')}:
                      </div>
                      {items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-600">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 bg-slate-50/70 border-t border-slate-100 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-xl sm:text-2xl font-black text-slate-900">${product.price_usd} USD</div>
                      <div className="text-[10px] text-emerald-700 font-bold">{t('oneTimePayment')}</div>
                    </div>
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-xs font-bold text-slate-600 hover:text-emerald-700 underline underline-offset-4"
                    >
                      {t('details')} →
                    </Link>
                  </div>

                  {/* Lemon Squeezy One-Time Checkout Overlay */}
                  <LemonCheckoutButton
                    productId={product.id}
                    productName={title}
                    priceUSD={product.price_usd}
                    variantId={product.lemon_variant_id}
                  />
                </div>
              </div>
            );
          })}
        </div>
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
                ? 'شراء آمن ومضمون 100% مع ضمان استرداد الأموال'
                : '100% Risk-Free Guarantee with Full Purchase Protection'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {lang === 'ar'
                ? 'جميع الطلبات محمية بواسطة Lemon Squeezy (Merchant of Record). في حال تعذر التوصيل الميداني، يُعاد المبلغ بالكامل لبطاقتك في غضون أيام عمل قليلة.'
                : 'All transactions are backed by Lemon Squeezy Merchant of Record with a 14-day refund policy. If field fulfillment cannot be completed, you receive a full refund directly to your original card.'}
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
