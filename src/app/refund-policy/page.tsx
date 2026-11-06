'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RefundPolicyPage() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs">
        {/* Header */}
        <div className="border-b border-slate-100 pb-8 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold mb-3 border border-amber-200">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'ضمان رضا العميل' : 'Customer Guarantee'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {lang === 'ar' ? 'سياسة الاسترداد والإلغاء' : 'Refund & Return Policy'}
          </h1>
          <p className="text-xs text-slate-500 mt-2 font-mono">
            {lang === 'ar' ? 'سارية المفعول من: 1 نوفمبر 2026' : 'Effective Date: November 1, 2026'}
          </p>
        </div>

        {/* Content Body */}
        {lang === 'ar' ? (
          <div className="space-y-8 text-sm text-slate-700 leading-relaxed" dir="rtl">
            <section className="space-y-3 bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100">
              <h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>1. ضمان الشراء لمرة واحدة وعدم وجود اشتراكات</span>
              </h2>
              <p className="text-slate-700">
                نظراً لأن جميع منتجاتنا تباع بنظام <strong>الدفع لمرة واحدة فقط (One-Time Payments)</strong>، فلن تحتاج أبداً لإلغاء أي اشتراك، ولن يتم فرض أي دفعات متكررة على بطاقتك تحت أي ظرف.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">2. الأهلية لاسترداد الأموال (خلال 14 يوماً)</h2>
              <p>يحق لك طلب استرداد كامل المبلغ المدفوع في الحالات التالية:</p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                <li>إذا تعذر على فريقنا الميداني الوصول للمستلم أو تسليم الباقة خلال 5 أيام عمل من تاريخ الدفع.</li>
                <li>إذا تم إلغاء الطلب من قبل المشتري قبل خروج الباقة مع مندوب التوصيل الميداني.</li>
                <li>في حال وصول أي مادة تالفة أو غير مطابقة للمواصفات المعلنة (يتم تعويضها فوراً أو استرداد قيمتها).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">3. كيفية تقديم طلب الاسترداد</h2>
              <p>
                لطلب استرداد الأموال، كل ما عليك هو إرسال بريد إلكتروني إلى فريق الدعم على:
                <br />
                <span className="font-mono text-emerald-700 font-bold">refunds@sanadstore.com</span>
                <br />
                مع ذكر رقم الطلب (Order ID) والبريد الإلكتروني المستخدم أثناء الدفع.
              </p>
            </section>

            <section className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">4. مدة معالجة وتحويل المبلغ المسترد</h2>
              <p className="text-slate-600">
                بمجرد الموافقة على طلب الاسترداد، تتم معالجة المبلغ عبر <strong>Lemon Squeezy</strong> ويُعاد تلقائياً إلى بطاقتك الائتمانية أو حسابك البنكي الأصلي في غضون <strong>3 إلى 7 أيام عمل</strong> وفقاً للبنك المصدر لبطاقتك.
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-8 text-sm text-slate-700 leading-relaxed" dir="ltr">
            <section className="space-y-3 bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100">
              <h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>1. One-Time Purchase Guarantee (No Subscriptions)</span>
              </h2>
              <p className="text-slate-700">
                Because all items on Sanad Store are sold on a <strong>strict one-time payment model</strong>, you will never need to worry about recurring charges or canceling subscriptions. You only pay for what you explicitly choose to buy.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">2. Refund Eligibility (14-Day Window)</h2>
              <p>We provide a 100% money-back guarantee under the following circumstances:</p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                <li>If we are unable to fulfill and deliver the package within 5 business days of purchase confirmation.</li>
                <li>If an order cancellation request is received prior to field packaging and dispatch.</li>
                <li>If any delivered item arrives damaged, defective, or inconsistent with stated specifications.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">3. How to Request a Refund</h2>
              <p>
                To initiate a refund claim, please email our support team at:
                <br />
                <span className="font-mono text-emerald-700 font-bold">refunds@sanadstore.com</span>
                <br />
                Include your Lemon Squeezy Order Number and purchase email address.
              </p>
            </section>

            <section className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">4. Processing & Timeline</h2>
              <p className="text-slate-600">
                Approved refunds are processed through our Merchant of Record, <strong>Lemon Squeezy</strong>, and credited back to the original payment method within <strong>3 to 7 business days</strong> depending on your banking institution.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
