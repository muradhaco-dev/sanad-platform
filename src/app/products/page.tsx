'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { STORE_PRODUCTS } from '@/lib/products';
import LemonCheckoutButton from '@/components/LemonCheckoutButton';
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Check,
  Filter,
  Search,
  Sparkles,
  MapPin,
} from 'lucide-react';

export default function ProductsPage() {
  const { t, lang } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = STORE_PRODUCTS.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const title = lang === 'ar' ? product.title_ar : product.title_en;
    const desc = lang === 'ar' ? product.description_ar : product.description_en;
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{t('oneTimePayment')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              {t('allProductsTitle')}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'ar'
                ? 'جميع الحزم والبضائع تباع بعملية دفع لمرة واحدة دون أي عقود دورية'
                : 'All packages are strictly one-time purchases with zero recurring contracts'}
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute top-3 start-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث عن باقة أو منتج...' : 'Search products...'}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl py-2.5 ps-9 pe-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-xs"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 text-xs">
          {[
            { id: 'all', label: t('filterAll') },
            { id: 'food', label: t('categoryFood') },
            { id: 'health', label: t('categoryHealth') },
            { id: 'energy', label: t('categoryEnergy') },
            { id: 'winter', label: t('categoryWinter') },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition cursor-pointer text-xs shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {filteredProducts.map((product) => {
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
                  {/* Product Image */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                    <img
                      src={product.image_url}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {badge && (
                      <span className="absolute top-3 end-3 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1 rounded-full shadow-xs">
                        {badge}
                      </span>
                    )}
                  </div>

                  <div className="p-4 sm:p-6">
                    {product.location_name && (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md mb-2 w-fit">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{product.location_name}</span>
                      </div>
                    )}

                    <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
                      <Link href={`/products/${product.slug}`}>{title}</Link>
                    </h2>
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
      </div>
    </div>
  );
}
