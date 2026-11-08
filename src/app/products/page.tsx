'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useCart } from '@/lib/CartContext';
import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/types/store';
import {
  ShoppingBag,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  Check,
  Search,
  Sparkles,
  Loader2,
  Package
} from 'lucide-react';

export default function ProductsPage() {
  const { t, lang } = useLanguage();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch directly from Supabase instance ONLY
  useEffect(() => {
    const fetchProducts = async () => {
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
        console.warn('Error querying Supabase products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Dynamic category tabs based on predefined filters + any custom categories added by vendors
  const availableCategories = useMemo(() => {
    const baseCats = [
      { id: 'all', label: t('filterAll') },
      { id: 'food', label: t('categoryFood') },
      { id: 'health', label: t('categoryHealth') },
      { id: 'energy', label: t('categoryEnergy') },
      { id: 'winter', label: t('categoryWinter') },
    ];
    const knownKeys = new Set(['all', 'food', 'health', 'energy', 'winter', 'غذائي وتمويني', 'صحي ورعاية طبية', 'طاقة ومحروقات', 'مستلزمات شتوية وتدفئة']);
    const customCats: { id: string; label: string }[] = [];
    
    products.forEach((p) => {
      if (p.category && !knownKeys.has(p.category) && !customCats.some((c) => c.id === p.category)) {
        customCats.push({ id: p.category, label: p.category });
      }
    });

    return [...baseCats, ...customCats];
  }, [products, t]);

  const filteredProducts = products.filter((product) => {
    let matchesCategory = selectedCategory === 'all';
    if (!matchesCategory) {
      if (product.category === selectedCategory) {
        matchesCategory = true;
      } else if (selectedCategory === 'food' && (product.category === 'food' || product.category?.includes('غذاء') || product.category?.includes('غذائ') || product.category?.includes('تموين'))) {
        matchesCategory = true;
      } else if (selectedCategory === 'health' && (product.category === 'health' || product.category?.includes('صح') || product.category?.includes('دواء') || product.category?.includes('طب'))) {
        matchesCategory = true;
      } else if (selectedCategory === 'energy' && (product.category === 'energy' || product.category?.includes('طاق') || product.category?.includes('محروق') || product.category?.includes('شمس'))) {
        matchesCategory = true;
      } else if (selectedCategory === 'winter' && (product.category === 'winter' || product.category?.includes('شت') || product.category?.includes('تدفئ'))) {
        matchesCategory = true;
      }
    }

    const title = lang === 'ar' ? product.title_ar : product.title_en || product.title_ar;
    const desc = lang === 'ar' ? product.description_ar : product.description_en || '';
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      className="min-h-screen bg-slate-50/60 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 w-full overflow-x-hidden"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{lang === 'ar' ? 'منتجات حقيقية من قاعدة بيانات Supabase' : 'Real-time Supabase Catalog'}</span>
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
          {availableCategories.map((cat) => (
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

        {/* Loading State */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-xs font-bold">{lang === 'ar' ? 'جارٍ جلب المنتجات من Supabase...' : 'Loading items from Supabase...'}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 sm:p-16 text-center space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">
              {lang === 'ar' ? 'لا توجد عناصر متاحة حالياً' : 'No items available'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {lang === 'ar'
                ? 'لم يتم العثور على أي منتجات في قاعدة البيانات. يمكن للتجار إضافة منتجات جديدة عبر لوحة التاجر.'
                : 'No products found matching your criteria in the Supabase database.'}
            </p>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {filteredProducts.map((product) => {
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
                      {product.category && (
                        <span className="absolute top-3 start-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                          {product.category}
                        </span>
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

                    {/* Actions: Add to Cart & Buy Now */}
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
      </div>
    </div>
  );
}
