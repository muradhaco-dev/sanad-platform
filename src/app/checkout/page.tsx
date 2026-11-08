'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { supabase } from '@/lib/supabaseClient';
import {
  ShieldCheck,
  Building2,
  FileText,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

const LOCAL_PAYMENT_METHODS = [
  'الهرم للحوالات',
  'الفؤاد',
  'سيريتل كاش',
  'شام كاش',
] as const;

type LocalPaymentMethod = typeof LOCAL_PAYMENT_METHODS[number];

interface VendorTransferInfo {
  name: string;
  phone: string;
  city: string;
  accountOrBranch: string;
  notes: string;
}

export default function CheckoutPage() {
  const { items, totalPriceUSD, totalItems, clearCart } = useCart();
  const { lang, t } = useLanguage();
  const router = useRouter();

  // Current Auth User
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form State
  const [selectedMethod, setSelectedMethod] = useState<LocalPaymentMethod>('الهرم للحوالات');
  const [receiptNumber, setReceiptNumber] = useState('');
  
  // Beneficiary in Syria
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientCity, setRecipientCity] = useState('دمشق');
  const [recipientAddress, setRecipientAddress] = useState('');
  
  // Expat Buyer Info
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // Load user session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user;
      if (user) {
        setCurrentUser(user);
        setBuyerEmail(user.email || '');
        if (user.user_metadata?.full_name) {
          setBuyerName(user.user_metadata.full_name);
        }
      }
    });
  }, []);

  // Compute dynamic Vendor details based on selected method and products in cart
  const getVendorDetails = (method: LocalPaymentMethod): VendorTransferInfo => {
    // Check if cart has a vendor with specific city/name
    const firstVendorName = items[0]?.product?.vendor_name || '';
    const isAleppo = firstVendorName.includes('حلب') || recipientCity === 'حلب';

    const vendorFullName = isAleppo ? 'أحمد كمال الحلبي' : 'محمد رضوان الشامي';
    const vendorPhone = isAleppo ? '0933556778' : '0944112233';
    const city = isAleppo ? 'حلب' : 'دمشق';

    switch (method) {
      case 'الهرم للحوالات':
        return {
          name: vendorFullName,
          phone: vendorPhone,
          city: city,
          accountOrBranch: isAleppo ? 'فرع الجميلية - حلب' : 'فرع البرامكة - دمشق',
          notes: 'قم بإرسال الحوالة عبر أقرب فرع لشركة الهرم باسم المستلم الموضح، ثم دوّن رقم إشعار الحوالة الورقي أدناه.',
        };
      case 'الفؤاد':
        return {
          name: vendorFullName,
          phone: vendorPhone,
          city: city,
          accountOrBranch: isAleppo ? 'فرع الفرقان - حلب' : 'فرع الحلبوني - دمشق',
          notes: 'أرسل الحوالة عبر فروع شركة الفؤاد بالاسم والمدينة أعلاه، وأدخل رقم كود الحوالة لتأكيد الطلب.',
        };
      case 'سيريتل كاش':
        return {
          name: vendorFullName,
          phone: isAleppo ? '0933556778' : '0933887711',
          city: city,
          accountOrBranch: 'محفظة سيريتل كاش (*580#)',
          notes: 'حول المبلغ المطلوب إلى رقم سيريتل كاش أعلاه، ثم اكتب رقم رسالة تأكيد العملية أدناه.',
        };
      case 'شام كاش':
      default:
        return {
          name: vendorFullName,
          phone: vendorPhone,
          city: city,
          accountOrBranch: isAleppo ? 'CHAM-7721-0348' : 'CHAM-9844-0129',
          notes: 'افتح تطبيق شام كاش وحول المبلغ المباشر إلى رقم الحساب أعلاه، ثم الصق رقم المعاملة أدناه.',
        };
    }
  };

  const vendorInfo = getVendorDetails(selectedMethod);
  const estimatedSyp = (totalPriceUSD * 14800).toLocaleString('ar-SY');

  const copyToClipboard = (text: string, key: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedField(key);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  // Submit and save Order directly to Supabase
  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (items.length === 0) {
      setErrorMsg(lang === 'ar' ? 'سلة المشتريات فارغة!' : 'Your cart is empty!');
      return;
    }

    if (!receiptNumber.trim()) {
      setErrorMsg(
        lang === 'ar'
          ? 'يرجى إدخال رقم إشعار / إيصال الحوالة للتحقق من طلبك'
          : 'Please enter the transfer receipt number'
      );
      return;
    }

    if (!recipientName.trim() || !recipientPhone.trim() || !recipientAddress.trim()) {
      setErrorMsg(
        lang === 'ar'
          ? 'يرجى إكمال بيانات المستلم في سوريا (الاسم، الهاتف، العنوان بالتفصيل)'
          : 'Please fill in beneficiary delivery details in Syria'
      );
      return;
    }

    setSubmitting(true);

    try {
      const orderNumber = `SND-${Date.now().toString().slice(-5)}-SY`;
      const customerEmail = buyerEmail.trim() || currentUser?.email || 'guest@sanad.ngo';
      const customerName = buyerName.trim() || currentUser?.user_metadata?.full_name || 'مغترب سوري';

      // 1. Save Main Order to Supabase
      const { data: newOrder, error: orderErr } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_id: currentUser?.id || null,
          user_id: currentUser?.id || null,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: buyerPhone.trim(),
          delivery_address: recipientAddress.trim(),
          city: recipientCity,
          total_amount: totalPriceUSD,
          payment_status: 'pending_verification', // Status: Pending Verification as requested
          payment_method: selectedMethod,
          receipt_number: receiptNumber.trim(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderErr) {
        console.error('Order insert error:', orderErr);
        throw new Error(orderErr.message || 'فشل في حفظ الطلب بقاعدة البيانات');
      }

      // 2. Save Each Order Item to Supabase
      const orderId = newOrder?.id;
      const orderItemsPayload = items.map((item) => ({
        order_id: orderId,
        order_number: orderNumber,
        product_id: item.product.id,
        vendor_id: item.product.vendor_id || 'c023d987-5e1c-4bda-ba62-8af979caa15c', // Link to real vendor or default
        product_title: lang === 'ar' ? item.product.title_ar : item.product.title_en || item.product.title_ar,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: buyerPhone.trim() || recipientPhone.trim(),
        delivery_address: recipientAddress.trim(),
        city: recipientCity,
        quantity: item.quantity,
        unit_price: item.product.price_usd,
        total_price: item.product.price_usd * item.quantity,
        platform_fee: 0,
        net_vendor_amount: item.product.price_usd * item.quantity,
        status: 'pending_verification', // Pending Verification
        payment_method: selectedMethod,
        receipt_number: receiptNumber.trim(),
        created_at: new Date().toISOString(),
      }));

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(orderItemsPayload);

      if (itemsErr) {
        console.warn('Items insert warning:', itemsErr);
      }

      // 3. Clear the Cart and Show Success State
      clearCart();
      setCompletedOrder({
        order_number: orderNumber,
        total_amount: totalPriceUSD,
        method: selectedMethod,
        receipt_number: receiptNumber.trim(),
        recipientName,
        recipientCity,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ الطلب في قاعدة البيانات');
    } finally {
      setSubmitting(false);
    }
  };

  // If order was successfully confirmed, show the confirmation screen
  if (completedOrder) {
    const whatsappMsg = encodeURIComponent(
      `مرحباً، قمت بتثبيت طلب تحويل محلي عبر منصة سَنَد.\nرقم الطلب: ${completedOrder.order_number}\nالمبلغ: $${completedOrder.total_amount} USD\nرقم إيصال الحوالة: ${completedOrder.receipt_number}\nطريقة التحويل: ${completedOrder.method}\nالمستلم في سوريا: ${completedOrder.recipientName} (${completedOrder.recipientCity})`
    );

    return (
      <div
        className="min-h-screen bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8 w-full overflow-x-hidden"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
              {lang === 'ar' ? 'حالة الطلب: قيد التحقق (Pending Verification)' : 'Status: Pending Verification'}
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-2">
              {lang === 'ar' ? 'تم تسجيل وتأكيد طلبك بنجاح!' : 'Order Confirmed Successfully!'}
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {lang === 'ar'
                ? 'تم إرسال رقم الإشعار إلى لوحة التاجر لمطابقته وتجهيز الطرد لتسليمه للأهل.'
                : 'Your order and receipt number have been logged in Supabase for merchant verification.'}
            </p>
          </div>

          {/* Order Details Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-start text-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">{lang === 'ar' ? 'رقم الطلب' : 'Order Number'}</span>
              <span className="font-mono font-black text-slate-900 text-sm bg-white px-2 py-0.5 rounded border border-slate-200">
                {completedOrder.order_number}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">{lang === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}</span>
              <span className="font-black text-emerald-700 text-sm">${completedOrder.total_amount} USD</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">{lang === 'ar' ? 'طريقة التحويل' : 'Payment Rail'}</span>
              <span className="font-bold text-slate-800">{completedOrder.method}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">{lang === 'ar' ? 'رقم إيصال الحوالة' : 'Receipt Number'}</span>
              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {completedOrder.receipt_number}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">{lang === 'ar' ? 'المستلم في سوريا' : 'Recipient'}</span>
              <span className="font-bold text-slate-800">
                {completedOrder.recipientName} ({completedOrder.recipientCity})
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <a
              href={`https://wa.me/905319666195?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{lang === 'ar' ? 'متابعة الطلب عبر واتساب مع الدعم' : 'Follow up via WhatsApp'}</span>
            </a>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/profile/orders"
                className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
              >
                {lang === 'ar' ? 'عرض طلباتي' : 'My Orders'}
              </Link>
              <Link
                href="/products"
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                {lang === 'ar' ? 'متابعة التسوق' : 'Shop More'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal Checkout Form
  return (
    <div
      className="min-h-screen bg-slate-50/60 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 w-full overflow-x-hidden"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-200/80 pb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{lang === 'ar' ? 'تحويل محلي مباشر 100%' : '100% Direct Syrian Remittance'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {lang === 'ar' ? 'إتمام الشراء وتثبيت الطلب' : 'Complete Your Order'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'ar'
              ? 'اختر طريقة التحويل المحلية، طابق بيانات التاجر، ثم أدخل رقم إيصال الحوالة لتثبيت طلبك في قاعدة البيانات.'
              : 'Select local remittance rail, verify seller transfer details, and enter receipt number to confirm.'}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 sm:p-12 text-center space-y-4">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h2 className="text-base font-bold text-slate-800">
              {lang === 'ar' ? 'لا توجد منتجات في السلة لإتمام الشراء' : 'No items in cart to checkout'}
            </h2>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
            >
              <span>{lang === 'ar' ? 'تصفح الباقات المتوفرة' : 'Browse Available Packages'}</span>
              {lang === 'ar' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleConfirmOrder} className="space-y-6">
            
            {/* Cart Items Summary Box */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'ar' ? 'الباقات المختارة في السلة' : 'Cart Packages'}</span>
                </h2>
                <Link
                  href="/cart"
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  {lang === 'ar' ? 'تعديل السلة' : 'Edit Cart'}
                </Link>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {items.map((item) => {
                  const title = lang === 'ar' ? item.product.title_ar : item.product.title_en || item.product.title_ar;
                  return (
                    <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="truncate">
                        <span className="font-bold text-slate-800">{title}</span>
                        <span className="text-slate-400 ms-2 font-mono">× {item.quantity}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 shrink-0">
                        ${(item.product.price_usd * item.quantity).toFixed(2)} USD
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-sm font-black text-slate-900">{lang === 'ar' ? 'المبلغ الإجمالي للدفع:' : 'Total Due:'}</span>
                <div className="text-end">
                  <span className="text-xl sm:text-2xl font-black text-emerald-700">${totalPriceUSD.toFixed(2)} USD</span>
                  <div className="text-xs text-slate-500 font-mono">
                    ≈ {estimatedSyp} <span className="text-[10px]">ل.س</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 1: Select Local Payment Method Dropdown */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                  1
                </span>
                <h2 className="text-sm sm:text-base font-black text-slate-900">
                  {lang === 'ar' ? 'اختر طريقة التحويل المحلية (Step 1)' : 'Select Local Payment Method (Step 1)'}
                </h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'ar' ? 'طريقة التحويل المعتمدة *' : 'Local Payment Method *'}
                </label>
                <div className="relative">
                  <Building2 className="w-5 h-5 text-emerald-600 absolute start-3.5 top-3.5 pointer-events-none" />
                  <select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value as LocalPaymentMethod)}
                    className="w-full ps-11 pe-4 py-3 rounded-2xl border-2 border-emerald-500/80 bg-emerald-50/20 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
                  >
                    {LOCAL_PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m} className="bg-white text-slate-900 font-semibold py-1">
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* STEP 2: Display Selected Vendor's Local Transfer Details */}
            <div className="bg-white rounded-3xl border border-amber-300 p-5 sm:p-6 shadow-xs space-y-4 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                    2
                  </span>
                  <h2 className="text-sm sm:text-base font-black text-slate-900">
                    {lang === 'ar' ? 'بيانات تحويل التاجر المعتمد (Step 2)' : 'Vendor Local Transfer Details (Step 2)'}
                  </h2>
                </div>
                <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {selectedMethod}
                </span>
              </div>

              <p className="text-xs text-slate-600">
                {vendorInfo.notes}
              </p>

              {/* Highlighted Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Name */}
                <div className="p-3 rounded-2xl bg-white border border-amber-200 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'ar' ? 'اسم المستلم المعتمد' : 'Vendor Name'}</div>
                    <div className="font-black text-slate-900 text-xs sm:text-sm">{vendorInfo.name}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(vendorInfo.name, 'vendor_name')}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                    title="نسخ الاسم"
                  >
                    {copiedField === 'vendor_name' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Phone */}
                <div className="p-3 rounded-2xl bg-white border border-amber-200 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'ar' ? 'رقم الهاتف / الحساب' : 'Phone / Account'}</div>
                    <div className="font-mono font-black text-slate-900 text-xs sm:text-sm" dir="ltr">{vendorInfo.phone}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(vendorInfo.phone, 'vendor_phone')}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                    title="نسخ الرقم"
                  >
                    {copiedField === 'vendor_phone' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* City & Branch */}
                <div className="p-3 rounded-2xl bg-white border border-amber-200 sm:col-span-2 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'ar' ? 'المدينة والفرع / رقم المحفظة' : 'City & Branch'}</div>
                    <div className="font-semibold text-slate-800 text-xs">{vendorInfo.city} — {vendorInfo.accountOrBranch}</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {lang === 'ar' ? 'تسليم فوري' : 'Direct'}
                  </span>
                </div>
              </div>
            </div>

            {/* STEP 3: Transfer Receipt Number Input */}
            <div className="bg-white rounded-3xl border-2 border-emerald-500 p-5 sm:p-6 shadow-md space-y-4 bg-emerald-50/20">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-black flex items-center justify-center shrink-0">
                  3
                </span>
                <h2 className="text-sm sm:text-base font-black text-slate-900">
                  {lang === 'ar' ? 'أدخل رقم إيصال الحوالة (Step 3)' : 'Enter Transfer Receipt Number (Step 3)'}
                </h2>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === 'ar'
                  ? 'بعد تحويل المبلغ عبر الطريقة المحددة أعلاه، اكتب هنا رقم إشعار الحوالة الورقي أو رقم المعاملة للتحقق منها وتأكيد طلبك.'
                  : 'Enter the voucher / transaction reference number provided by the remittance office or e-wallet app.'}
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  {lang === 'ar' ? 'رقم إيصال الحوالة / رقم العملية *' : 'Transfer Receipt Number *'}
                </label>
                <div className="relative">
                  <FileText className="w-5 h-5 text-emerald-700 absolute start-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    placeholder={
                      selectedMethod === 'الهرم للحوالات'
                        ? 'مثال: 592810 (رقم الإشعار الورقي)'
                        : selectedMethod === 'سيريتل كاش'
                        ? 'مثال: 994120 (رقم إشعار الرسالة)'
                        : selectedMethod === 'شام كاش'
                        ? 'مثال: CHAM-8841920-DM'
                        : 'رقم إيصال الحوالة'
                    }
                    className="w-full ps-11 pe-4 py-3.5 rounded-2xl border-2 border-emerald-500 bg-white text-sm font-mono font-black text-slate-900 placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Recipient in Syria Delivery Info */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'ar' ? 'بيانات المستلم وعنوان التوصيل في سوريا' : 'Beneficiary & Delivery Address in Syria'}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'اسم المستلم في سوريا *' : 'Recipient Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: فاطمة المحمد (الوالدة)' : 'e.g. Fatima Al-Mohammad'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'رقم هاتف / واتساب المستلم *' : 'Recipient Phone / WhatsApp *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="0944123456"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'المحافظة / المدينة *' : 'Governorate / City *'}
                  </label>
                  <select
                    value={recipientCity}
                    onChange={(e) => setRecipientCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:border-emerald-600 focus:outline-none cursor-pointer"
                  >
                    <option value="دمشق">دمشق وريفها</option>
                    <option value="حلب">حلب وريفها</option>
                    <option value="حمص">حمص</option>
                    <option value="اللاذقية">اللاذقية</option>
                    <option value="حماة">حماة</option>
                    <option value="طرطوس">طرطوس</option>
                    <option value="درعا">درعا</option>
                    <option value="إدلب">إدلب</option>
                    <option value="السويداء">السويداء</option>
                    <option value="دير الزور">دير الزور</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'اسم المشتري (المغترب)' : 'Buyer Name (Expat)'}
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: محمد الحلبي (ألمانيا)' : 'e.g. Ahmad (Germany)'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'ar' ? 'العنوان بالتفصيل للتسليم *' : 'Detailed Delivery Address *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder={lang === 'ar' ? 'الحي، الشارع، بناء رقم، طابق، علامة فارقة...' : 'District, street, building number, floor...'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 4: Confirm Order Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-black text-base shadow-lg shadow-emerald-700/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{lang === 'ar' ? 'جارٍ تسجيل الطلب في قاعدة البيانات...' : 'Saving Order to Supabase...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{lang === 'ar' ? 'تأكيد الطلب وحفظ إشعار الحوالة (Confirm Order)' : 'Confirm Order & Save Receipt'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
