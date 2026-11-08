'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  Code2,
  Mail,
  Phone,
  MessageSquare,
  Sparkles,
  Heart,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Terminal,
} from 'lucide-react';

export default function AboutUsSection() {
  const { lang, t } = useLanguage();

  const developerInfo = {
    nameAr: 'محمد حجو',
    nameEn: 'Mohamad Haco',
    roleAr: 'مطور ومبرمج المنصة (Full-Stack Software Engineer)',
    roleEn: 'Full-Stack Software Engineer & Platform Developer',
    phone: '00905319666195',
    phoneDisplay: '+90 531 966 61 95',
    whatsappLink: 'https://wa.me/905319666195',
    email: 'muradhaco@gmail.com',
  };

  return (
    <section id="about" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{lang === 'ar' ? 'من نحن • رسالة المنصة وفريق التطوير' : 'About Us • Mission & Developer'}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {lang === 'ar' ? 'سَنَد: جسر العطاء والأمان لعائلتك في سوريا' : 'Sanad: Reliable Family Essentials for Syria'}
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {lang === 'ar'
            ? 'انطلقت منصة "سَنَد" استجابةً للحاجة الملحة للمغتربين السوريين حول العالم في إرسال السلل الغذائية والمستلزمات الطبية والاحتياجات الأساسية لعائلاتهم داخل سوريا، بأسلوب شفاف 100% يعتمد على الشراء لمرة واحدة فقط دون أي عقود أو اشتراكات دورية خفية.'
            : 'Sanad was built to empower expatriates worldwide to directly support their loved ones across Syrian governorates with vital nutrition packages, medicine, and energy essentials through a transparent, one-time payment architecture with zero subscriptions.'}
        </p>
      </div>

      {/* Grid: Platform Core Values & Developer Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Platform Mission Highlights (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                <Heart className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {lang === 'ar' ? 'رؤيتنا ومبادئ المنصة' : 'Our Purpose & Core Values'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'ar' ? 'الشفافية الكاملة والاعتمادية الميدانية' : 'Full transparency & verified delivery'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start gap-3.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-0.5">
                    {lang === 'ar' ? 'شراء لمرة واحدة فقط (Zero Subscriptions)' : '100% One-Time Purchases'}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {lang === 'ar'
                      ? 'لا توجد خصومات شهرية أو تجديد تلقائي. يدفع العميل قيمة الطرد لمرة واحدة فقط بكل أمان ووضوح.'
                      : 'No monthly subscriptions or recurring fees. Pay once with complete peace of mind.'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start gap-3.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-0.5">
                    {lang === 'ar' ? 'شبكة تحويلات محلية رسمية ومباشرة' : 'Direct Syrian Remittance Rails'}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {lang === 'ar'
                      ? 'دعم قنوات التحويل الرسمية في سوريا: شركة الهرم، الفؤاد، سيريتل كاش، وشام كاش بدون وسطاء دوليين أو بطاقات بنكية معقدة.'
                      : 'Licensed Syrian domestic remittance rails: Al-Haram, Al-Fouad, Syriatel Cash, and Cham Cash with direct vendor handover.'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start gap-3.5">
                <Code2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-0.5">
                    {lang === 'ar' ? 'بنية تقنية متعددة التجار في سوريا' : 'Multi-Vendor Syrian Marketplace'}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {lang === 'ar'
                      ? 'ربط مباشر مع مستودعات الشام والمحافظات، مع تحديد الإحداثيات الجغرافية وتسوية الحوالات النقدية عبر شام كاش.'
                      : 'Direct integration with local warehouses across Syrian cities with GPS dispatch coordinates and offline Cham Cash settlements.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Syrian Solidarity Callout */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>🇸🇾 {lang === 'ar' ? 'مخصص لخدمة أهلنا في كافة المحافظات السورية' : 'Serving families across all Syrian governorates'}</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              {lang === 'ar' ? 'منصة سَنَد 2026' : 'Sanad 2026'}
            </span>
          </div>
        </div>

        {/* Right Column: Lead Developer Profile Card (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/40 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-6 relative z-10">
            {/* Developer Badge */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                <Terminal className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'فريق البرمجة والتطوير' : 'Lead Software Engineer'}</span>
              </span>

              <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg font-mono">
                Full-Stack
              </span>
            </div>

            {/* Developer Name & Title */}
            <div>
              <div className="flex items-center gap-3.5 mb-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-900/50 shrink-0">
                  م
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {lang === 'ar' ? developerInfo.nameAr : developerInfo.nameEn}
                  </h3>
                  <p className="text-xs text-emerald-400 font-medium">
                    {lang === 'ar' ? developerInfo.roleAr : developerInfo.roleEn}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mt-3">
                {lang === 'ar'
                  ? 'تم تصميم وبرمجة بنية منصة "سَنَد" بالكامل لتوفير تجربة مستخدم سريعة، آمنة، ومتوافقة بنسبة 100% مع الهواتف الذكية وتعدد التجار، وربط بوابات الدفع وقواعد بيانات Supabase الحديثة.'
                  : 'Engineered the full architecture of Sanad with modern Next.js 16, Supabase RLS security, multi-vendor ledger, and responsive mobile-first UI.'}
              </p>
            </div>

            {/* Clickable Contact Methods List */}
            <div className="space-y-2.5 pt-2">
              {/* Phone Link */}
              <a
                href={`tel:${developerInfo.phone}`}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition group cursor-pointer"
                title={lang === 'ar' ? 'اتصال هاتفي مباشر' : 'Direct Call'}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 text-start">
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      {lang === 'ar' ? 'رقم الهاتف المباشر' : 'Direct Phone'}
                    </div>
                    <div className="text-xs font-mono font-bold text-white tracking-wide truncate" dir="ltr">
                      {developerInfo.phone}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0">
                  {lang === 'ar' ? 'اتصال' : 'Call'}
                </span>
              </a>

              {/* WhatsApp Link */}
              <a
                href={developerInfo.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-950/60 hover:bg-emerald-950 border border-emerald-800/60 transition group cursor-pointer"
                title={lang === 'ar' ? 'محادثة مباشرة عبر واتساب' : 'Chat via WhatsApp'}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 text-start">
                    <div className="text-[10px] text-emerald-300/80 font-medium uppercase tracking-wider">
                      WhatsApp
                    </div>
                    <div className="text-xs font-mono font-bold text-white tracking-wide truncate" dir="ltr">
                      {developerInfo.phone}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-400/30 shrink-0 flex items-center gap-1">
                  <span>{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </a>

              {/* Email Link */}
              <a
                href={`mailto:${developerInfo.email}?subject=Sanad%20Platform%20Inquiry`}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition group cursor-pointer"
                title={lang === 'ar' ? 'إرسال بريد إلكتروني' : 'Send Email'}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 text-start">
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                    </div>
                    <div className="text-xs font-mono font-bold text-white tracking-wide truncate">
                      {developerInfo.email}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 shrink-0">
                  {lang === 'ar' ? 'إرسال' : 'Email'}
                </span>
              </a>
            </div>
          </div>

          {/* Quick Action Footer */}
          <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400">
              {lang === 'ar' ? 'متاح للاستفسارات والتعاون التقني' : 'Available for inquiries & development'}
            </span>
            <a
              href={`mailto:${developerInfo.email}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition underline underline-offset-4"
            >
              <span>{lang === 'ar' ? 'تواصل الآن' : 'Get in Touch'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
