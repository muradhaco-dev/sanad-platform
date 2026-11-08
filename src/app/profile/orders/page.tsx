'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  ShoppingBag,
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Loader2,
  FileText,
  Copy,
  Check,
  Building2,
  AlertCircle
} from 'lucide-react';

interface CustomerOrder {
  id: string;
  order_number: string;
  total_amount: number;
  payment_status: string;
  payment_method?: string;
  receipt_number?: string;
  delivery_address?: string;
  city?: string;
  recipient_name?: string;
  recipient_phone?: string;
  created_at: string;
  items?: {
    id: string;
    product_title: string;
    quantity: number;
    unit_price: number;
    status: string;
    payment_method?: string;
    receipt_number?: string;
  }[];
}

export default function CustomerOrdersPage() {
  const { lang } = useLanguage();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerOrders = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user ?? null;
        setCurrentUser(user);

        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

        if (user) {
          query = query.or(`customer_id.eq.${user.id},user_id.eq.${user.id},customer_email.eq.${user.email}`);
        }

        const { data: ordersData, error: ordersErr } = await query;

        if (!ordersErr && ordersData && ordersData.length > 0) {
          // Fetch order items
          const orderNumbers = ordersData.map((o) => o.order_number);
          const { data: itemsData } = await supabase
            .from('order_items')
            .select('*')
            .in('order_number', orderNumbers);

          const populated = ordersData.map((ord) => ({
            ...ord,
            items: (itemsData || []).filter((i) => i.order_number === ord.order_number),
          }));

          setOrders(populated);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.warn('Error fetching customer orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerOrders();
  }, []);

  const handleCopyReceipt = (text: string, id: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50/70 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 w-full overflow-x-hidden"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shrink-0">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                {lang === 'ar' ? 'مشترياتي وطلباتي السابقة' : 'My Purchases & Orders'}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {lang === 'ar'
                  ? 'سجل الحوالات المحلية ومتابعة حالة التحقق من قبل التجار في سوريا'
                  : 'Track your local remittances and merchant verification in Syria'}
              </p>
            </div>
          </div>

          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
          >
            <span>{lang === 'ar' ? 'تصفح باقات المتجر' : 'Browse Products'}</span>
            {lang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-bold">
              {lang === 'ar' ? 'جاري تحميل سجل الطلبات من قاعدة البيانات...' : 'Loading purchases from Supabase...'}
            </p>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State: No Items Available */
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-dashed border-gray-300 p-8 sm:p-14 text-center space-y-4">
            <Package className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-800">
              {lang === 'ar' ? 'لا توجد عناصر متاحة حالياً' : 'No items available'}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {lang === 'ar'
                ? 'لم يتم العثور على أي طلبات مسجلة في حسابك. يمكنك اختيار باقة لعائلتك في سوريا وإرسال الحوالة المحلية فوراً.'
                : 'No purchase records found in the database. Choose a relief parcel to send directly to your family in Syria.'}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700 transition"
            >
              <span>{lang === 'ar' ? 'تصفح المتجر الآن' : 'Start Shopping'}</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => {
              const isPending =
                ord.payment_status === 'pending_verification' ||
                ord.payment_status === 'pending';

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 p-4 sm:p-6 shadow-xs space-y-4 hover:border-emerald-300 transition"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-gray-100 pb-3 sm:pb-4">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                        {ord.order_number}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>
                          {new Date(ord.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SY' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </span>

                      {ord.payment_method && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          {ord.payment_method}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full border ${
                          isPending
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isPending ? (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{lang === 'ar' ? 'بانتظار التحقق من البائع' : 'Pending Verification'}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{lang === 'ar' ? 'تم التحقق والتنفيذ' : 'Completed'}</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Transfer Receipt Box */}
                  {ord.receipt_number && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-slate-500">{lang === 'ar' ? 'رقم إيصال الحوالة المسجل:' : 'Receipt Number:'}</span>
                        <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200" dir="ltr">
                          {ord.receipt_number}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyReceipt(ord.receipt_number!, ord.id)}
                        className="text-slate-500 hover:text-emerald-700 p-1 flex items-center gap-1 cursor-pointer font-bold text-[11px]"
                      >
                        {copiedId === ord.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">{lang === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{lang === 'ar' ? 'نسخ' : 'Copy'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Items & Delivery Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* Purchased Items */}
                    <div className="md:col-span-2 space-y-2 sm:space-y-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {lang === 'ar' ? 'البنود والطرود:' : 'Order Items:'}
                      </h4>
                      {ord.items && ord.items.length > 0 ? (
                        ord.items.map((it) => (
                          <div
                            key={it.id}
                            className="flex items-center justify-between p-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 text-xs"
                          >
                            <div>
                              <p className="font-bold text-gray-900">{it.product_title}</p>
                              <p className="text-gray-500 text-[11px]">
                                {lang === 'ar' ? 'الكمية:' : 'Qty:'} {it.quantity} × ${it.unit_price} USD
                              </p>
                            </div>
                            <span className="font-black text-gray-900">
                              ${(it.quantity * it.unit_price).toFixed(2)} USD
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold text-gray-800">
                          {lang === 'ar' ? 'سلة غذائية عائلية شاملة' : 'Essential Family Goods Package'}
                        </div>
                      )}
                    </div>

                    {/* Delivery Location & Total */}
                    <div className="space-y-3 bg-emerald-50/40 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-100 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>{lang === 'ar' ? 'عنوان التسليم في سوريا' : 'Delivery Address'}</span>
                        </h4>
                        <p className="text-xs font-medium text-slate-700">
                          {ord.delivery_address || (lang === 'ar' ? 'دمشق، سوريا' : 'Damascus, Syria')}
                        </p>
                        {ord.city && (
                          <p className="text-[11px] text-emerald-800 font-bold mt-1">
                            {lang === 'ar' ? 'المحافظة:' : 'City:'} {ord.city}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-emerald-200/60 flex items-center justify-between">
                        <span className="text-xs text-gray-600 font-bold">{lang === 'ar' ? 'المبلغ الإجمالي:' : 'Total:'}</span>
                        <span className="text-base sm:text-lg font-black text-emerald-800">
                          ${Number(ord.total_amount).toFixed(2)} USD
                        </span>
                      </div>
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
