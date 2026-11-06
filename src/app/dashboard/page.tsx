'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { supabase, signOutUser } from '@/lib/supabaseClient';
import { StoreOrder, SavedPaymentCard } from '@/types/store';
import {
  Package,
  CreditCard,
  User,
  ShieldCheck,
  ExternalLink,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  LogOut,
  ShoppingBag,
  Loader2,
  FileText
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'cards' | 'account'>('orders');

  // Realistic sample order history for one-time purchases
  const [orders, setOrders] = useState<StoreOrder[]>([
    {
      id: 'ord-8921',
      order_number: 'LS-90184-SANAD',
      user_email: '',
      product_id: 'prod-family-nutrition-box',
      product_title_en: 'Comprehensive Family Nutrition Box',
      product_title_ar: 'السلة الغذائية العائلية الشاملة',
      amount_usd: 55,
      status: 'completed',
      created_at: '2026-11-02T14:30:00Z',
      receipt_url: 'https://app.lemonsqueezy.com/my-orders',
      lemon_order_id: 'ls_ord_8921'
    },
    {
      id: 'ord-8945',
      order_number: 'LS-90220-SANAD',
      user_email: '',
      product_id: 'prod-chronic-care-medical-kit',
      product_title_en: 'Chronic Care & Senior Medical Kit',
      product_title_ar: 'باقة الرعاية الصحية وأدوية كبار السن',
      amount_usd: 42,
      status: 'processing',
      created_at: '2026-11-05T09:15:00Z',
      receipt_url: 'https://app.lemonsqueezy.com/my-orders',
      lemon_order_id: 'ls_ord_8945'
    }
  ]);

  // Saved Payment Methods
  const [savedCards, setSavedCards] = useState<SavedPaymentCard[]>([
    {
      id: 'card-1',
      brand: 'visa',
      last4: '4242',
      exp_month: 8,
      exp_year: 2028,
      is_default: true
    },
    {
      id: 'card-2',
      brand: 'mastercard',
      last4: '8831',
      exp_month: 11,
      exp_year: 2027,
      is_default: false
    }
  ]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/auth/login');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/auth/login');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleOpenLemonCustomerPortal = () => {
    // In production, fetch customer portal URL from Lemon Squeezy API or use their direct portal
    window.open('https://app.lemonsqueezy.com/my-orders', '_blank');
  };

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Dashboard Top Banner */}
      <div className="bg-white border-b border-slate-200/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('verifiedEmail')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('dashboardTitle')}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {user?.email} • {t('dashboardSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('shopNow')}</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>{t('signOut')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t('tabOrders')} ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cards')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'cards'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{t('tabPaymentMethods')}</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'account'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t('tabAccount')}</span>
          </button>
        </div>

        {/* Tab 1: Orders History (One-Time Purchases) */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">{t('noOrdersYet')}</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{t('noOrdersDesc')}</p>
                <Link
                  href="/products"
                  className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t('shopNow')}</span>
                </Link>
              </div>
            ) : (
              orders.map((order) => {
                const title = lang === 'ar' ? order.product_title_ar : order.product_title_en;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                        📦
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                          <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            {order.order_number}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(order.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SY' : 'en-US', {
                              dateStyle: 'medium',
                            })}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold">${order.amount_usd} USD ({t('oneTimePayment')})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                          order.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{order.status === 'completed' ? (lang === 'ar' ? 'تم التسليم' : 'Delivered') : (lang === 'ar' ? 'قيد التجهيز' : 'Processing')}</span>
                      </span>

                      <button
                        onClick={handleOpenLemonCustomerPortal}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'الفاتورة' : 'Receipt'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Saved Payment Methods & Cards */}
        {activeTab === 'cards' && (
          <div className="space-y-6">
            {/* Info Notice about Lemon Squeezy Merchant of Record */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    <span>{t('manageCardsLemon')}</span>
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                    {t('manageCardsDesc')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenLemonCustomerPortal}
                  className="shrink-0 inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <span>{t('openCustomerPortal')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Saved Cards Cards List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                {savedCards.map((card) => (
                  <div
                    key={card.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center font-bold text-xs uppercase text-slate-700 shadow-xs">
                        {card.brand}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 font-mono">
                          •••• •••• •••• {card.last4}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Expires {card.exp_month}/{card.exp_year}
                          {card.is_default && (
                            <span className="ms-2 text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded text-[10px]">
                              {lang === 'ar' ? 'افتراضية' : 'Default'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenLemonCustomerPortal}
                      className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
                    >
                      {lang === 'ar' ? 'تعديل' : 'Edit'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{t('savedCardsNotice')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Account & Security */}
        {activeTab === 'account' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 max-w-xl">
            <h3 className="text-base font-bold text-slate-900">{t('tabAccount')}</h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">{t('emailLabel')}</div>
                  <div className="text-slate-500 font-mono mt-0.5">{user?.email}</div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[11px] font-bold">
                  {t('verifiedEmail')}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">{lang === 'ar' ? 'نوع الحساب' : 'Account Type'}</div>
                  <div className="text-slate-500 mt-0.5">{lang === 'ar' ? 'مشتري لمرة واحدة (One-Time Customer)' : 'One-Time Customer'}</div>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-[11px] font-bold">
                  Active
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
