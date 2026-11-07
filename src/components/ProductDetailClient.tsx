'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Product } from '@/types/store';
import LemonCheckoutButton from '@/components/LemonCheckoutButton';
import {
  ShieldCheck,
  Check,
  Truck,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  PackageCheck,
  Lock,
  Sparkles,
  Store,
  MapPin,
} from 'lucide-react';

export default function ProductDetailClient({ product }: { product: Product }) {
  const { t, lang } = useLanguage();

  const title = lang === 'ar' ? product.title_ar : product.title_en;
  const desc = lang === 'ar' ? product.description_ar : product.description_en;
  const badge = lang === 'ar' ? product.badge_ar : product.badge_en;
  const items = lang === 'ar' ? product.items_ar : product.items_en;
  const specs = lang === 'ar' ? product.specs_ar : product.specs_en;

  return (
    <div className="min-h-screen bg-slate-50/60 py-6 sm:py-12 px-3 sm:px-6 lg:px-8 w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Breadcrumb Back Link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-700 transition"
        >
          {lang === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{lang === 'ar' ? 'العودة لجميع المنتجات' : 'Back to all products'}</span>
        </Link>

        {/* Main Product Showcase Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs sm:shadow-sm overflow-hidden p-4 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
            {/* Left Column: Image */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-4/3 sm:aspect-16/10 lg:aspect-4/3">
              <img
                src={product.image_url}
                alt={title}
                className="w-full h-full object-cover"
              />
              {badge && (
                <span className="absolute top-3 end-3 sm:top-4 sm:end-4 bg-emerald-600 text-white text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {badge}
                </span>
              )}
            </div>

            {/* Right Column: Details & Checkout */}
            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('oneTimePayment')}</span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                  {title}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {desc}
                </p>

                {/* Vendor & Store Dispatch Location */}
                {(product.vendor_name || product.location_name) && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-amber-700 shrink-0" />
                      <div>
                        <span className="font-bold text-amber-950">{product.vendor_name || 'تاجر محلي معتمد'}</span>
                        {product.location_name && (
                          <p className="text-[11px] text-amber-900/80 flex items-center gap-1 mt-0.5 font-medium">
                            <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
                            <span>{product.location_name}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    {product.latitude && product.longitude && (
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded-md font-mono text-amber-800 border border-amber-200 shrink-0 self-start sm:self-auto">
                        GPS: {product.latitude.toFixed(2)}, {product.longitude.toFixed(2)}
                      </span>
                    )}
                  </div>
                )}

                {/* Price Display */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500 font-semibold">{t('price')}</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">${product.price_usd} USD</div>
                  </div>
                  <div className="text-end">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                      <Check className="w-3.5 h-3.5" />
                      <span>{t('inStock')}</span>
                    </span>
                    <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1">{t('oneTimePayment')}</div>
                  </div>
                </div>

                {/* Primary Checkout Button via Syrian Local Remittance */}
                <div className="pt-2">
                  <LemonCheckoutButton
                    productId={product.id}
                    productName={title}
                    priceUSD={product.price_usd}
                    productImage={product.image_url}
                    vendorId={product.vendor_id}
                    vendorName={product.vendor_name}
                  />
                  <p className="text-[11px] text-center text-slate-400 mt-2 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {lang === 'ar'
                        ? 'تحويل محلي مباشر • الهرم • الفؤاد • سيريتل • شام كاش'
                        : 'Direct Syrian Remittance • No Foreign Bank Cards Required'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('fastDelivery')}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('satisfactionGuarantee')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown: What's Included & Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* What's Included */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-600" />
              <span>{t('whatsIncluded')}</span>
            </h2>
            <ul className="space-y-3">
              {items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Specifications Table */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>{t('specifications')}</span>
            </h2>
            <div className="divide-y divide-slate-100 text-xs">
              {Object.entries(specs).map(([key, value], idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-600 shrink-0">{key}</span>
                  <span className="text-slate-900 font-semibold text-end">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
