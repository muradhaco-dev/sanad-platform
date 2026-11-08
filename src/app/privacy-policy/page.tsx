'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ShieldCheck, Lock, Eye } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs">
        {/* Header */}
        <div className="border-b border-slate-100 pb-8 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold mb-3 border border-blue-200">
            <Lock className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'حماية البيانات والخصوصية' : 'Data Privacy & Security'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {lang === 'ar' ? 'سياسة الخصوصية وحماية البيانات' : 'Privacy Policy'}
          </h1>
          <p className="text-xs text-slate-500 mt-2 font-mono">
            {lang === 'ar' ? 'سارية المفعول من: 1 نوفمبر 2026' : 'Effective Date: November 1, 2026'}
          </p>
        </div>

        {/* Content Body */}
        {lang === 'ar' ? (
          <div className="space-y-8 text-sm text-slate-700 leading-relaxed" dir="rtl">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">1. نظرة عامة والالتزام بالخصوصية</h2>
              <p>
                نحن في <strong>متجر سَنَد (Sanad Store)</strong> نولي خصوصية بياناتك اهتماماً بالغاً. توضح هذه السياسة كيفية جمع واستخدام وتأمين معلوماتك الشخصية عند تصفحك للموقع أو إتمامك لطلب شراء منتج لمرة واحدة.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">2. المعلومات التي نقوم بجمعها</h2>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                <li><strong>بيانات الحساب:</strong> البريد الإلكتروني، الاسم، وحالة التحقق من البريد (OTP).</li>
                <li><strong>بيانات التوصيل:</strong> اسم المستلم في سوريا، رقم الهاتف المباشر، والمحافظة والعنوان السكني الدقيق.</li>
                <li><strong>سجل الطلبات:</strong> أرقام الطلبات، تاريخ الشراء، قيمة الفاتورة، وحالة التوصيل.</li>
              </ul>
            </section>

            <section className="space-y-3 bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
              <h2 className="text-lg font-bold text-blue-950 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>3. أمان الحوالات والمدفوعات المحلية المباشرة</span>
              </h2>
              <p className="text-slate-700">
                <strong>تتم جميع الحوالات المالية بشكل مباشر ومستقل</strong> عبر شبكات الحوالات المحلية المعتمدة في سوريا (الهرم للحوالات، شركة الفؤاد، سيريتل كاش، وشام كاش). لا يتم تخزين أو طلب أي بيانات بطاقات ائتمانية أجنبية على خوادم المنصة.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">4. كيفية استخدام المعلومات</h2>
              <p>نستخدم البيانات التي نجمعها للأغراض التالية فقط:</p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                <li>معالجة وتنفيذ طلبات الشراء لمرة واحدة وتنسيق التوصيل الميداني مع المستلم.</li>
                <li>إرسال فواتير الشراء وإشعارات تحديث مراحل التسليم عبر البريد الإلكتروني.</li>
                <li>التحقق من الهوية عبر رمز البريد (OTP) لحماية الحساب من التسجيلات الوهمية.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">5. حقوقك في حماية البيانات (GDPR & CCPA)</h2>
              <p>
                يحق لك في أي وقت طلب نسخة من بياناتك الشخصية المسجلة لدينا، أو طلب تعديلها أو حذفها نهائياً من سجلاتنا بمجرد إرسال طلب إلى بريد الدعم.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-100 pt-6">
              <h2 className="text-lg font-bold text-slate-900">6. التواصل مع مسؤول الخصوصية</h2>
              <p>
                إذا كان لديك أي استفسار حول سياسة الخصوصية، يرجى مراسلتنا على:
                <br />
                <span className="font-mono text-emerald-700 font-bold">privacy@sanadstore.com</span>
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-8 text-sm text-slate-700 leading-relaxed" dir="ltr">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">1. Commitment to Privacy</h2>
              <p>
                At <strong>Sanad Store</strong> (&quot;we&quot;, &quot;our&quot;), we respect your privacy and are committed to safeguarding your personal data. This policy outlines how we collect, use, and secure your information when you browse our site or purchase one-time products.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">2. Information We Collect</h2>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                <li><strong>Account Data:</strong> Email address, name, and OTP verification status.</li>
                <li><strong>Delivery Details:</strong> Recipient name, destination phone number, city, and street address.</li>
                <li><strong>Order History:</strong> Product purchased, transaction date, amount paid, and fulfillment tracking ID.</li>
              </ul>
            </section>

            <section className="space-y-3 bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
              <h2 className="text-lg font-bold text-blue-950 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>3. Direct Local Remittance Security</span>
              </h2>
              <p className="text-slate-700">
                <strong>We never collect or store foreign credit card credentials.</strong> All transactions are conducted via direct, verifiable local remittances within Syria (Al-Haram, Al-Fouad, Syriatel Cash, and Cham Cash) directly between expat buyers and Syrian sellers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">4. How We Use Your Data</h2>
              <p>We process your data strictly to:</p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                <li>Fulfill and dispatch one-time purchased packages to the beneficiary.</li>
                <li>Send transactional receipts, order updates, and delivery verification notices.</li>
                <li>Authenticate your account via email OTP to prevent fraud and spam.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">5. Your Privacy Rights (GDPR & CCPA)</h2>
              <p>
                You retain full rights to request access to, rectification of, or erasure of your personal data stored within our systems at any time.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-100 pt-6">
              <h2 className="text-lg font-bold text-slate-900">6. Contact Our Privacy Officer</h2>
              <p>
                For questions or deletion requests, contact us at:
                <br />
                <span className="font-mono text-emerald-700 font-bold">privacy@sanadstore.com</span>
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
