'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { supabase, signOutUser } from '@/lib/supabaseClient';
import { StoreOrder } from '@/types/store';
import {
  Package,
  Building2,
  User,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  ShoppingBag,
  Loader2,
  FileText,
  Clock,
  Copy,
  Check,
  Smartphone,
  CreditCard
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'methods' | 'account'>('orders');
  const [copiedReceipt, setCopiedReceipt] = useState<string | null>(null);

  // Real orders fetched directly from Supabase instance (No fake data)
  const [orders, setOrders] = useState<StoreOrder[]>([]);

  useEffect(() => {
    const syncRoleAndRedirect = async (sessionUser: any): Promise<boolean> => {
      if (typeof window === 'undefined' || !sessionUser) return false;

      // Check if a role was selected before Google login
      const storedRole =
        localStorage.getItem('sanad_selected_role') ||
        localStorage.getItem('selected_role') ||
        localStorage.getItem('sanad_signup_role');

      if (storedRole) {
        const targetRole = storedRole === 'vendor' ? 'vendor' : 'customer';

        try {
          // 1. Update user's role in the 'profiles' table in Supabase
          const { error: profileErr } = await supabase.from('profiles').upsert({
            id: sessionUser.id,
            email: sessionUser.email,
            role: targetRole,
            full_name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0],
            updated_at: new Date().toISOString(),
          });

          if (profileErr) {
            console.warn('Profile upsert warning:', profileErr);
          }

          // 2. Update auth user metadata
          await supabase.auth.updateUser({
            data: { role: targetRole },
          });

          // 3. Clear localStorage as required
          localStorage.removeItem('sanad_selected_role');
          localStorage.removeItem('selected_role');
          localStorage.removeItem('sanad_signup_role');

          // If vendor, route directly to vendor dashboard
          if (targetRole === 'vendor') {
            router.push('/vendor');
            return true;
          }
        } catch (err) {
          console.error('Error updating role in profiles table:', err);
        }
      } else {
        // If no pending role in localStorage, check their existing role from profiles table
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', sessionUser.id)
            .single();

          if (profile?.role === 'vendor') {
            router.push('/vendor');
            return true;
          }
        } catch (err) {
          console.warn('Could not check existing profile role:', err);
        }
      }

      return false;
    };

    const fetchOrders = async (sessionUser: any) => {
      try {
        const isRedirecting = await syncRoleAndRedirect(sessionUser);
        if (isRedirecting) return;

        const { data: dbOrders, error } = await supabase
          .from('orders')
          .select('*')
          .or(`customer_id.eq.${sessionUser.id},user_id.eq.${sessionUser.id},customer_email.eq.${sessionUser.email}`)
          .order('created_at', { ascending: false });

        if (!error && dbOrders) {
          const mapped: StoreOrder[] = dbOrders.map((o: any) => ({
            id: o.id,
            order_number: o.order_number,
            user_email: o.customer_email || sessionUser.email,
            product_id: o.product_id || '',
            product_title_en: o.product_title || 'Syrian Relief Parcel',
            product_title_ar: o.product_title || 'طرد وسلة إغاثة سورية',
            amount_usd: Number(o.total_amount) || 0,
            payment_method: o.payment_method || 'الهرم للحوالات',
            receipt_number: o.receipt_number || '',
            recipient_name: o.recipient_name || o.customer_name || 'الأهل في سوريا',
            recipient_phone: o.recipient_phone || o.customer_phone || '',
            delivery_city: o.city || 'دمشق',
            delivery_address: o.delivery_address || 'دمشق، سوريا',
            status: o.payment_status === 'completed' ? 'completed' : 'pending_verification',
            created_at: o.created_at,
          }));
          setOrders(mapped);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.warn('Failed to load orders from Supabase:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/auth/login');
      } else {
        setUser(session.user);
        fetchOrders(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/auth/login');
      } else {
        setUser(session.user);
        fetchOrders(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleCopy = (text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedReceipt(text);
      setTimeout(() => setCopiedReceipt(null), 2500);
    }
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
              {lang === 'ar' ? 'لوحة تحكم المشتري والمغترب' : 'Customer & Expat Dashboard'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {user?.email} • {lang === 'ar' ? 'متابعة الطلبات الموجهة للأهل في سوريا' : 'Track orders sent to family in Syria'}
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
            onClick={() => setActiveTab('methods')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'methods'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{lang === 'ar' ? 'طرق التحويل المعتمدة في سوريا' : 'Supported Syrian Rails'}</span>
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

        {/* Tab 1: Orders History */}
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
                const isPending = order.status === 'pending_verification';

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                        📦
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                          <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-bold">
                            {order.order_number}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(order.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SY' : 'en-US')}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold">${order.amount_usd} USD</span>
                        </div>

                        {/* Remittance & Recipient Details */}
                        <div className="pt-1 text-xs text-slate-600 flex flex-wrap items-center gap-2">
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 font-mono font-bold px-2 py-0.5 rounded">
                            {lang === 'ar' ? 'رقم الإشعار:' : 'Receipt:'} {order.receipt_number}
                          </span>
                          <span className="text-slate-400">|</span>
                          <span>
                            {lang === 'ar' ? 'المستلم:' : 'Recipient:'} <strong className="text-slate-800">{order.recipient_name}</strong> ({order.delivery_city})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${
                          isPending
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {isPending
                            ? lang === 'ar' ? 'قيد تحقق التاجر' : 'Pending Verification'
                            : lang === 'ar' ? 'تم التسليم للأهل' : 'Delivered to Family'}
                        </span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCopy(order.receipt_number)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
                      >
                        {copiedReceipt === order.receipt_number ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{lang === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{lang === 'ar' ? 'نسخ الإشعار' : 'Copy'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Syrian Supported Payment Rails */}
        {activeTab === 'methods' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <span>{lang === 'ar' ? 'قنوات الدفع والتحويل المحلي المعتمدة في سوريا' : 'Supported Syrian Transfer Rails'}</span>
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                  {lang === 'ar'
                    ? 'منصة سَنَد تعتمد على شبكات التحويل الرسمية والمحلية مباشرة بين المغترب والتاجر السوري بدون وسطاء أجانب أو بطاقات ائتمان بنكية.'
                    : 'Sanad connects Syrian expats directly with local merchants through domestic licensed remittance rails.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                {[
                  { name: 'شام كاش (Cham Cash)', type: 'محفظة رقمية سورية', desc: 'تحويل مباشر وفوري عبر تطبيق شام كاش', active: true },
                  { name: 'سيريتل كاش (Syriatel Cash)', type: 'دفع عبر الجوال *580#', desc: 'متاح على مدار الساعة عبر رقم هاتف التاجر', active: true },
                  { name: 'شركة الهرم للحوالات (Al-Haram)', type: 'حوالات نقدية رسمية', desc: 'استلام عبر كافة الفروع بالهوية الشخصية', active: true },
                  { name: 'شركة الفؤاد للحوالات (Al-Fouad)', type: 'حوالات نقدية داخلية', desc: 'إشعار ورقي ورقم كود استلام فوري', active: true },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">{item.name}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">نشط</span>
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-800">{item.type}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Account */}
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
                  <div className="text-slate-500 mt-0.5">{lang === 'ar' ? 'مشتري / مغترب سوري' : 'Syrian Expat Buyer'}</div>
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
