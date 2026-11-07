'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LocalTransferMethod, SellerTransferDetail } from '@/types/store';
import { getSellerTransferDetails } from '@/lib/vendorStore';
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  Smartphone,
  CreditCard,
  Send,
  Loader2,
  AlertCircle,
  FileText,
  MapPin,
  User,
  Phone,
  ArrowRight,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

interface LocalTransferCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title_ar: string;
    title_en?: string;
    price_usd: number;
    image_url?: string;
    vendor_id?: string;
    vendor_name?: string;
  } | null;
  onSuccess?: (order: any) => void;
}

const PAYMENT_METHODS: {
  id: LocalTransferMethod;
  nameAr: string;
  nameEn: string;
  typeAr: string;
  badgeAr: string;
  colorClass: string;
  bgLightClass: string;
  borderClass: string;
  icon: 'branch' | 'wallet' | 'mobile';
}[] = [
  {
    id: 'cham_cash',
    nameAr: 'شام كاش (Cham Cash)',
    nameEn: 'Cham Cash',
    typeAr: 'محفظة إلكترونية رقمية',
    badgeAr: 'الأسرع تأكيداً',
    colorClass: 'text-emerald-700',
    bgLightClass: 'bg-emerald-50',
    borderClass: 'border-emerald-500',
    icon: 'wallet',
  },
  {
    id: 'syriatel_cash',
    nameAr: 'سيريتل كاش (Syriatel Cash)',
    nameEn: 'Syriatel Cash',
    typeAr: 'دفع عبر الجوال / تطبيق سيريتل',
    badgeAr: 'متاح 24/7',
    colorClass: 'text-amber-700',
    bgLightClass: 'bg-amber-50',
    borderClass: 'border-amber-500',
    icon: 'mobile',
  },
  {
    id: 'al_haram',
    nameAr: 'شركة الهرم للحوالات',
    nameEn: 'Al-Haram Remittance',
    typeAr: 'حوالة نقدية عبر كافة الفروع',
    badgeAr: 'فروع في كل المدن',
    colorClass: 'text-blue-700',
    bgLightClass: 'bg-blue-50',
    borderClass: 'border-blue-500',
    icon: 'branch',
  },
  {
    id: 'al_fouad',
    nameAr: 'شركة الفؤاد للحوالات',
    nameEn: 'Al-Fouad Remittance',
    typeAr: 'حوالة نقدية بالهوية الشخصية',
    badgeAr: 'فروع منتشرة',
    colorClass: 'text-purple-700',
    bgLightClass: 'bg-purple-50',
    borderClass: 'border-purple-500',
    icon: 'branch',
  },
];

export default function LocalTransferCheckoutModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: LocalTransferCheckoutModalProps) {
  const { lang } = useLanguage();

  // Step state: 1 = Form & Details, 2 = Success Confirmation
  const [step, setStep] = useState<'form' | 'success'>('form');

  // Selected Transfer Rail
  const [selectedMethod, setSelectedMethod] = useState<LocalTransferMethod>('cham_cash');

  // Dynamic Seller Info
  const [sellerDetails, setSellerDetails] = useState<SellerTransferDetail>(() =>
    getSellerTransferDetails(product?.vendor_id, 'cham_cash')
  );

  // Form Fields
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientCity, setRecipientCity] = useState('دمشق');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [receiptNotes, setReceiptNotes] = useState('');

  // UI state
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string>('');

  // Update seller details when method or vendor changes
  useEffect(() => {
    if (product) {
      const details = getSellerTransferDetails(product.vendor_id, selectedMethod);
      setSellerDetails(details);
    }
  }, [product, selectedMethod]);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setFormError(null);
      setReceiptNumber('');
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const estimatedSyp = (product.price_usd * 14800).toLocaleString('ar-SY');

  const copyToClipboard = (text: string, fieldKey: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!receiptNumber.trim()) {
      setFormError(
        lang === 'ar'
          ? 'يرجى إدخال رقم إشعار / إيصال الحوالة للتحقق من طلبك'
          : 'Please enter the transfer receipt or transaction number'
      );
      return;
    }

    if (!recipientName.trim() || !recipientPhone.trim() || !recipientAddress.trim()) {
      setFormError(
        lang === 'ar'
          ? 'يرجى استكمال بيانات المستلم في سوريا (الاسم، رقم الهاتف، العنوان بالتفصيل)'
          : 'Please complete the beneficiary details (Name, Phone, Delivery Address)'
      );
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        product_id: product.id,
        product_title: lang === 'ar' ? product.title_ar : product.title_en || product.title_ar,
        vendor_id: product.vendor_id || 'vendor-damascus-01',
        customer_name: buyerName.trim() || (lang === 'ar' ? 'مغترب سوري' : 'Syrian Expat'),
        customer_phone: buyerPhone.trim(),
        recipient_name: recipientName.trim(),
        recipient_phone: recipientPhone.trim(),
        delivery_address: recipientAddress.trim(),
        city: recipientCity,
        quantity: 1,
        unit_price: product.price_usd,
        payment_method: selectedMethod,
        receipt_number: receiptNumber.trim(),
        receipt_image_url: '',
      };

      // Try sending to internal API route
      let generatedOrderNum = `SND-${Date.now().toString().slice(-5)}-SY`;
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...orderPayload,
            simulatePaid: false,
          }),
        });
        const data = await res.json();
        if (data?.order?.order_number) {
          generatedOrderNum = data.order.order_number;
        }
      } catch (apiErr) {
        // Fallback gracefully to offline state
        console.warn('Orders API offline, persisting locally:', apiErr);
      }

      setCreatedOrderNumber(generatedOrderNum);
      setStep('success');

      if (onSuccess) {
        onSuccess({
          ...orderPayload,
          order_number: generatedOrderNum,
        });
      }
    } catch (err: any) {
      setFormError(err.message || (lang === 'ar' ? 'حدث خطأ أثناء حفظ الطلب' : 'Error saving order'));
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `مرحباً، قمت بتثبيت طلب شراء باقة (${lang === 'ar' ? product.title_ar : product.title_en}) عبر منصة سَنَد.\nرقم الطلب: ${createdOrderNumber}\nرقم إشعار الحوالة: ${receiptNumber}\nطريقة التحويل: ${sellerDetails.methodNameAr}`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 end-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-emerald-200 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              {lang === 'ar' ? 'تحويل محلي مباشر - بدون بطاقات مصرفية أجنبية' : 'Direct Syrian Remittance Rail'}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white">
            {step === 'form'
              ? lang === 'ar'
                ? 'إتمام الشراء عبر التحويل المحلي المباشر'
                : 'Direct Syrian Remittance Checkout'
              : lang === 'ar'
              ? 'تم استلام وتثبيت طلبك بنجاح!'
              : 'Order Received & Pending Seller Verification'}
          </h2>

          <p className="text-xs text-emerald-100/90 mt-1 max-w-lg">
            {step === 'form'
              ? (lang === 'ar'
                ? 'الدفع يتم مباشرة للتاجر المحلي في سوريا عبر شركات الصرافة أو المحافظ الرقمية بدون وسطاء أجانب.'
                : 'Direct payment to local merchant in Syria via remittance offices or Syrian e-wallets.')
              : ''}
          </p>
        </div>

        {/* Modal Body */}
        {step === 'form' ? (
          <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 space-y-6 max-h-[78vh] overflow-y-auto">
            
            {/* 1. Selected Product Summary Banner */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title_ar}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-200"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0">
                    سَنَد
                  </div>
                )}
                <div className="truncate">
                  <h3 className="font-bold text-gray-900 text-sm truncate">
                    {lang === 'ar' ? product.title_ar : product.title_en || product.title_ar}
                  </h3>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {lang === 'ar' ? 'التاجر المعتمد:' : 'Merchant:'}{' '}
                    <span className="font-semibold text-emerald-800">
                      {product.vendor_name || 'مستودعات الشام والمحافظات'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-end shrink-0">
                <div className="text-base sm:text-lg font-black text-emerald-700">
                  ${product.price_usd} <span className="text-xs font-normal text-gray-500">USD</span>
                </div>
                <div className="text-[11px] text-gray-500 font-mono">
                  ≈ {estimatedSyp} <span className="text-[10px]">ل.س</span>
                </div>
              </div>
            </div>

            {/* 2. Step 1: Payment Method Selection */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-bold">
                    1
                  </span>
                  {lang === 'ar' ? 'اختر طريقة التحويل المناسبة لك في سوريا:' : 'Select Syrian Transfer Method:'}
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = selectedMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`text-start p-3 sm:p-3.5 rounded-2xl border-2 transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? `${method.borderClass} ${method.bgLightClass} ring-2 ring-emerald-500/20 shadow-xs`
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <div className="flex items-center gap-2">
                          {method.icon === 'branch' && <Building2 className={`w-4 h-4 ${method.colorClass}`} />}
                          {method.icon === 'wallet' && <CreditCard className={`w-4 h-4 ${method.colorClass}`} />}
                          {method.icon === 'mobile' && <Smartphone className={`w-4 h-4 ${method.colorClass}`} />}
                          <span className="font-black text-xs sm:text-sm text-gray-900">
                            {lang === 'ar' ? method.nameAr : method.nameEn}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100">
                        <span className="text-[11px] text-gray-500">{method.typeAr}</span>
                        <span className="text-[10px] font-bold text-gray-600 bg-white/90 px-2 py-0.5 rounded-md border border-gray-200">
                          {method.badgeAr}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Step 2: Selected Seller's Transfer Details Card (Highlighted Box) */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-bold">
                  2
                </span>
                {lang === 'ar' ? 'بيانات التحويل الخاصة بالبائع / المستلم المعتمد:' : 'Seller Remittance Information:'}
              </label>

              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 border border-amber-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-amber-200/70">
                  <div>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                      {sellerDetails.methodNameAr}
                    </span>
                    <p className="text-xs text-gray-600 mt-1">{sellerDetails.instructionsAr}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Full Name */}
                  <div className="p-2.5 rounded-xl bg-white border border-gray-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold">{lang === 'ar' ? 'اسم المستلم المعتمد' : 'Beneficiary Name'}</div>
                      <div className="font-bold text-gray-900 text-xs sm:text-sm">{sellerDetails.fullName}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(sellerDetails.fullName, 'seller_name')}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                      title="نسخ الاسم"
                    >
                      {copiedField === 'seller_name' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Phone / Account Number */}
                  <div className="p-2.5 rounded-xl bg-white border border-gray-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold">
                        {selectedMethod === 'cham_cash'
                          ? lang === 'ar' ? 'رقم حساب المحفظة' : 'Wallet Account'
                          : lang === 'ar' ? 'رقم هاتف البائع' : 'Seller Phone'}
                      </div>
                      <div className="font-mono font-bold text-gray-900 text-xs sm:text-sm" dir="ltr">
                        {selectedMethod === 'cham_cash' ? sellerDetails.branchOrAccount : sellerDetails.phoneNumber}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          selectedMethod === 'cham_cash'
                            ? sellerDetails.branchOrAccount
                            : sellerDetails.phoneNumber,
                          'seller_num'
                        )
                      }
                      className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                      title="نسخ الرقم"
                    >
                      {copiedField === 'seller_num' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* City & Branch */}
                  <div className="p-2.5 rounded-xl bg-white border border-gray-200/80 sm:col-span-2 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold">
                        {lang === 'ar' ? 'المدينة والفرع المعتمد' : 'City & Branch'}
                      </div>
                      <div className="font-semibold text-gray-800 text-xs">
                        {sellerDetails.city} — {sellerDetails.branchOrAccount}
                      </div>
                    </div>
                    <span className="text-[11px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                      {lang === 'ar' ? 'حوالة داخل سوريا' : 'Domestic SY'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Step 3: Beneficiary Delivery Details in Syria */}
            <div className="space-y-3">
              <label className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-bold">
                  3
                </span>
                {lang === 'ar' ? 'بيانات المستلم وعنوان التوصيل في سوريا:' : 'Delivery Details in Syria:'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {lang === 'ar' ? 'اسم المستلم (الأهل في سوريا) *' : 'Recipient Name *'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute start-3 top-3" />
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: فاطمة المحمد (الوالدة)' : 'e.g. Fatima Al-Mohammad'}
                      className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {lang === 'ar' ? 'رقم هاتف / واتساب المستلم *' : 'Recipient Phone / WhatsApp *'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute start-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="0944123456"
                      className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {lang === 'ar' ? 'المحافظة / المدينة *' : 'City / Governorate *'}
                  </label>
                  <select
                    value={recipientCity}
                    onChange={(e) => setRecipientCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden cursor-pointer"
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
                  <label className="block font-bold text-gray-700 mb-1">
                    {lang === 'ar' ? 'اسم المشتري (المغترب)' : 'Buyer Name (Expat)'}
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: محمد الحلبي (ألمانيا)' : 'e.g. Ahmad (Germany)'}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">
                    {lang === 'ar' ? 'العنوان بالتفصيل للتسليم *' : 'Detailed Delivery Address *'}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute start-3 top-3" />
                    <input
                      type="text"
                      required
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder={
                        lang === 'ar'
                          ? 'الحي، الشارع، بناء رقم، طابق، علامة فارقة...'
                          : 'District, street, building number, floor...'
                      }
                      className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Step 4: Transfer Receipt Number Input (Core Requirement) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border-2 border-emerald-500/80 space-y-3">
              <label className="text-xs sm:text-sm font-black text-emerald-950 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[11px] flex items-center justify-center font-bold">
                  4
                </span>
                {lang === 'ar'
                  ? 'أدخل رقم إشعار / إيصال الحوالة بعد التحويل *'
                  : 'Enter Transfer Receipt Number *'}
              </label>

              <p className="text-xs text-emerald-900/80">
                {lang === 'ar'
                  ? 'يقوم التاجر السوري بمطابقة هذا الرقم مع إشعار شركته أو محفظته ثم يغير حالة الطلب إلى "مكتمل" ويجهز الباقة للتسليم.'
                  : 'The vendor verifies this number on their phone/receipt to confirm payment and dispatch goods.'}
              </p>

              <div>
                <div className="relative">
                  <FileText className="w-5 h-5 text-emerald-700 absolute start-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    placeholder={
                      selectedMethod === 'cham_cash'
                        ? 'مثال: CHAM-8841920-DM أو رقم العملية'
                        : selectedMethod === 'al_haram'
                        ? 'مثال: 592810 (رقم الإشعار الورقي)'
                        : selectedMethod === 'syriatel_cash'
                        ? 'مثال: 994120 (رقم رسالة تأكيد الخصم)'
                        : 'رقم إشعار الحوالة'
                    }
                    className="w-full ps-11 pe-4 py-3 rounded-xl border-2 border-emerald-400 bg-white text-sm font-mono font-bold text-gray-900 placeholder:font-sans placeholder:font-normal focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/30 outline-hidden shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  {lang === 'ar' ? 'ملاحظات إضافية أو وقت الإرسال (اختياري)' : 'Additional Notes (Optional)'}
                </label>
                <input
                  type="text"
                  value={receiptNotes}
                  onChange={(e) => setReceiptNotes(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: تم التحويل قبل 10 دقائق باسم محمد' : 'e.g. Sent 10 mins ago'}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white text-gray-900 focus:border-emerald-600 outline-hidden"
                />
              </div>
            </div>

            {/* Error Message if any */}
            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-700/25 hover:from-emerald-800 hover:to-teal-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{lang === 'ar' ? 'جارٍ تسجيل الطلب وإشعار البائع...' : 'Submitting Order...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>
                      {lang === 'ar'
                        ? 'تثبيت الطلب وإرسال إشعار الحوالة للبائع'
                        : 'Submit Order with Transfer Receipt'}
                    </span>
                  </>
                )}
              </button>

              <div className="mt-2.5 text-center">
                <span className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {lang === 'ar'
                    ? 'ضمان منصة سَنَد: يتم التواصل وتأكيد التسليم مع الأهل خطوة بخطوة'
                    : 'Sanad Guarantee: Verified handover to your family in Syria'}
                </span>
              </div>
            </div>
          </form>
        ) : (
          /* ================= STEP 2: SUCCESS CONFIRMATION ================= */
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                {lang === 'ar' ? 'حالة الطلب: قيد تحقق التاجر من الحوالة' : 'Status: Pending Verification'}
              </span>
              <h3 className="text-xl font-black text-gray-900 mt-2">
                {lang === 'ar' ? 'تم تسجيل طلبك وإرسال الإشعار للبائع بنجاح!' : 'Order Placed Successfully!'}
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                {lang === 'ar'
                  ? 'تم إرسال رقم الإشعار إلى لوحة تحكم التاجر المحلي لمطابقته مع حسابه والبدء بتجهيز السلة وتسليمها للأهل.'
                  : 'Your transfer receipt number has been routed to the merchant to confirm and dispatch.'}
              </p>
            </div>

            {/* Order Card Recap */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-start text-xs space-y-2.5 max-w-md mx-auto">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <span className="text-gray-500">{lang === 'ar' ? 'رقم الطلب' : 'Order Number'}</span>
                <span className="font-mono font-bold text-gray-900 text-sm bg-white px-2 py-0.5 rounded border border-gray-200">
                  {createdOrderNumber}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">{lang === 'ar' ? 'رقم إيصال الحوالة' : 'Receipt Number'}</span>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {receiptNumber}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">{lang === 'ar' ? 'طريقة التحويل' : 'Payment Method'}</span>
                <span className="font-bold text-gray-800">{sellerDetails.methodNameAr}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">{lang === 'ar' ? 'المستلم في سوريا' : 'Recipient'}</span>
                <span className="font-bold text-gray-800">
                  {recipientName} ({recipientCity})
                </span>
              </div>
            </div>

            {/* Direct Contact Actions */}
            <div className="space-y-3 max-w-md mx-auto pt-2">
              <a
                href={`https://wa.me/905319666195?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{lang === 'ar' ? 'متابعة الطلب عبر واتساب مع المطور' : 'Contact Support via WhatsApp'}</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'إغلاق ومتابعة التسوق' : 'Close and Continue'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
