'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ShieldCheck, Lock, CreditCard, HeartHandshake } from 'lucide-react';

export default function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-base">
                S
              </div>
              <span className="text-xl font-black text-white">{t('storeName')}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              {lang === 'ar'
                ? 'متجر إلكتروني مخصص لبيع وتوصيل الاحتياجات الأساسية والباقات الحيوية لمرة واحدة فقط. نلتزم بأعلى معايير الشفافية ولا نفرض أي اشتراكات دورية أو رسوم خفية.'
                : 'A dedicated one-time purchase e-commerce platform delivering essential family goods and relief provisions. We strictly operate on a one-off payment model with zero recurring subscriptions.'}
            </p>

            {/* Merchant of Record Notice */}
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs text-slate-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Merchant of Record: </span>
                <span className="text-slate-400">
                  {lang === 'ar'
                    ? 'تتم معالجة جميع عمليات الدفع وتأمينها بواسطة Lemon Squeezy، التاجر الرسمي المسجل لضمان الحماية والأمان الضريبي والمصرفي الكامل.'
                    : 'All online orders and card transactions are processed securely by Lemon Squeezy, our authorized Merchant of Record.'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              {lang === 'ar' ? 'روابط المتجر' : 'Quick Links'}
            </h3>
            <ul className="text-xs space-y-2.5 text-slate-400">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-emerald-400 transition-colors">
                  {t('products')}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
                  {t('dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-emerald-400 transition-colors">
                  {t('signIn')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Pages (Required for Lemon Squeezy Approval) */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              {t('legalNotice')}
            </h3>
            <ul className="text-xs space-y-2.5 text-slate-400">
              <li>
                <Link href="/terms-of-service" className="hover:text-emerald-400 transition-colors">
                  {t('termsTitle')}
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-emerald-400 transition-colors">
                  {t('privacyTitle')}
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-emerald-400 transition-colors">
                  {t('refundTitle')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Payment Icons */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 {t('storeName')}. {t('allRightsReserved')}</p>

          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
              <Lock className="w-3 h-3 text-emerald-400" /> 256-Bit SSL
            </span>
            <span className="text-[11px] bg-slate-800 px-2 py-1 rounded border border-slate-700 font-bold">
              VISA
            </span>
            <span className="text-[11px] bg-slate-800 px-2 py-1 rounded border border-slate-700 font-bold">
              Mastercard
            </span>
            <span className="text-[11px] bg-slate-800 px-2 py-1 rounded border border-slate-700 font-bold">
              Apple Pay
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
