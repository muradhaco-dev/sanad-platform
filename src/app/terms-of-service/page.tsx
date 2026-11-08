'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function TermsOfServicePage() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs">
        {/* Header */}
        <div className="border-b border-slate-100 pb-8 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-3 border border-emerald-200">
            <FileText className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'وثيقة قانونية رسمية' : 'Official Legal Agreement'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {lang === 'ar' ? 'شروط وأحكام الخدمة' : 'Terms of Service'}
          </h1>
          <p className="text-xs text-slate-500 mt-2 font-mono">
            {lang === 'ar' ? 'آخر تحديث: 1 نوفمبر 2026' : 'Last Updated: November 1, 2026'}
          </p>
        </div>

        {/* Content Body */}
        {lang === 'ar' ? (
          <div className="space-y-8 text-sm text-slate-700 leading-relaxed" dir="rtl">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">1. المقدمة ونطاق الاتفاقية</h2>
              <p>
                أهلاً بكم في منصة ومتجر <strong>سَنَد (Sanad Store)</strong>. تحدد هذه الشروط والأحكام القواعد واللوائح المنظمة لاستخدامك لموقعنا الإلكتروني وشرائك للمنتجات المعروضة. من خلال الوصول إلى هذا الموقع أو إتمام أي عملية شراء، فإنك توافق صراحة على الالتزام الكامل بهذه الشروط.
              </p>
            </section>

            <section className="space-y-3 bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100">
              <h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>2. نموذج الشراء لمرة واحدة حصراً (بدون اشتراكات دورية)</span>
              </h2>
              <p className="text-slate-700">
                يعمل متجر سَنَد بنظام <strong>الشراء لمرة واحدة فقط (Strictly One-Time Purchases)</strong>. جميع الأسعار المعلنة هي دفعات نهائية لمرة واحدة لكل طلب فردي. <strong>لا نقوم تحت أي ظرف بتقديم اشتراكات متكررة، ولا توجد أي رسوم شهرية أو تجديد تلقائي دوري</strong> على بطاقاتك الائتمانية.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">3. شبكة الحوالات والمدفوعات المحلية المباشرة</h2>
              <p>
                تتم جميع المعاملات المالية عبر شبكات الحوالات والتحويل المالي المحلية المعتمدة في سوريا (الهرم للحوالات، شركة الفؤاد، سيريتل كاش، وشام كاش) بين المشتري المغترب والتاجر المحلي مباشرة. يتم إدخال رقم إشعار الحوالة الصادر من شركة الصرافة للتحقق والمطابقة قبل تجهيز السلع وتسليمها للأهل.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">4. تسعير المنتجات والعملة</h2>
              <p>
                جميع الأسعار معروضة بالدولار الأمريكي (USD) ما لم ينص على خلاف ذلك. نحتفظ بالحق في تعديل أسعار المنتجات في أي وقت لمواكبة التغيرات في أسعار التوريد، ولكن أي تعديل لن يؤثر على الطلبات التي تم تأكيد دفعها بالفعل.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">5. الشحن والتسليم الميداني</h2>
              <p>
                يلتزم فريقنا بتجهيز وشحن باقات الاحتياجات والبضائع إلى عناوين المستلمين المحددة خلال الإطار الزمني المعلن (عادة بين 24 إلى 48 ساعة من تاريخ تأكيد الدفع). في حال حدوث أي قوة قاهرة تعيق التوصيل الميداني الفوري، يتم إخطار العميل وتنسيق موعد بديل أو استرداد المبلغ.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">6. حدود المسؤولية والقانون المعمول به</h2>
              <p>
                إلى أقصى حد يسمح به القانون المعمول به، لا تتحمل المنصة أي مسؤولية عن أي أضرار غير مباشرة أو عرضية ناتجة عن استخدام المنتجات بعد استلامها بحالة سليمة ومطابقة للمواصفات. تخضع هذه الشروط وتفسر وفقاً للقوانين والأنظمة المعمول بها للتجارة الدولية وحماية المستهلك.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-100 pt-6">
              <h2 className="text-lg font-bold text-slate-900">7. معلومات الاتصال والاستفسارات</h2>
              <p>
                لأي أسئلة أو استفسارات تتعلق بهذه الشروط، يرجى التواصل مع فريق الامتثال القانوني عبر البريد الإلكتروني:
                <br />
                <span className="font-mono text-emerald-700 font-bold">support@sanadstore.com</span>
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-8 text-sm text-slate-700 leading-relaxed" dir="ltr">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">1. Agreement to Terms</h2>
              <p>
                Welcome to <strong>Sanad Store</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). These Terms of Service constitute a legally binding agreement made between you and Sanad Store concerning your access to and use of our e-commerce platform and the one-time products offered on this website. By placing an order, you agree to be bound by these Terms.
              </p>
            </section>

            <section className="space-y-3 bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100">
              <h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>2. Strictly One-Time Purchases (No Recurring Subscriptions)</span>
              </h2>
              <p className="text-slate-700">
                All offerings on Sanad Store are sold exclusively on a <strong>single one-time payment basis</strong>. We do not sell monthly SaaS subscriptions, recurring memberships, or automatic renewal contracts. When you complete checkout, you are charged only once for the selected product and delivery.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">3. Direct Local Remittance Processing</h2>
              <p>
                All transactions are conducted directly between expatriate buyers and verified local merchants in Syria via approved remittance rails (Al-Haram, Al-Fouad, Syriatel Cash, and Cham Cash). Buyers provide the official transfer voucher number upon checkout for verification prior to dispatch.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">4. Pricing, Currency & Orders</h2>
              <p>
                All prices are stated in United States Dollars (USD) unless explicitly shown otherwise. We reserve the right to correct pricing errors and adjust prices to reflect logistics changes prior to order confirmation. Once your payment is approved, your order total is locked and guaranteed.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">5. Fulfillment & Delivery</h2>
              <p>
                Upon payment confirmation, orders are dispatched for physical field delivery to the recipient address provided during checkout within 24 to 48 hours. Delivery verification is recorded with photo confirmation and direct recipient acknowledgment.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">6. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Sanad Store and its affiliates shall not be liable for any indirect, incidental, consequential, or punitive damages arising from the delivery or use of the products.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-100 pt-6">
              <h2 className="text-lg font-bold text-slate-900">7. Contact Information</h2>
              <p>
                If you have questions regarding these Terms of Service, please reach out to our team at:
                <br />
                <span className="font-mono text-emerald-700 font-bold">support@sanadstore.com</span>
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
