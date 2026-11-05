'use client';

import Link from 'next/link';
import { ShieldCheck, HeartHandshake, PhoneCall, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 mt-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-lg">
                س
              </div>
              <span className="text-xl font-black text-white">منصة سَنَد</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              الحل التقني الأمثل لربط المغتربين السوريين باحتياجات عائلاتهم في الداخل، بدفع دولي آمن وتوصيل ميداني موثق بالصور والتقارير.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>دفع مشفر 256-bit عبر Lemon Squeezy</span>
            </div>
          </div>

          {/* Guarantee & Coverage */}
          <div>
            <h3 className="text-white text-sm font-bold mb-4">التغطية الجغرافية الحالية</h3>
            <ul className="text-xs space-y-2 text-gray-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>دمشق وضواحيها (تسليم خلال 24 ساعة)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>ريف دمشق (صحنايا، جرمانا، قدسيا، التل)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>حلب واللاذقية وطرطوس</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>حمص وحماة والسويداء</span>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white text-sm font-bold mb-4">روابط المنصة</h3>
            <ul className="text-xs space-y-2 text-gray-400">
              <li>
                <Link href="/dashboard/expatriate" className="hover:text-emerald-400 transition-colors">
                  لوحة تحكم المغترب ومتابعة الطلبات
                </Link>
              </li>
              <li>
                <Link href="/dashboard/provider" className="hover:text-emerald-400 transition-colors">
                  بوابة مزودي الخدمة الميدانية (سوريا)
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-emerald-400 transition-colors">
                  تصفح باقات المواد الغذائية والطبية
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-emerald-400 transition-colors">
                  الأسئلة الشائعة وضمانات التسليم
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white text-sm font-bold mb-4">الدعم الفني والطوارئ</h3>
            <p className="text-xs text-gray-400 mb-3">
              فريق العمل الميداني متاح 24/7 للتعامل مع أي استفسارات أو حالات خاصة عبر تيليغرام وواتساب.
            </p>
            <div className="bg-gray-800/80 p-3 rounded-xl border border-gray-700/60 flex items-center gap-3">
              <PhoneCall className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-[11px] text-gray-400">خط الطوارئ للمغتربين</p>
                <p className="text-xs font-bold text-white" dir="ltr">+963 (Field Ops)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 سَنَد (Sanad) - جميع الحقوق محفوظة لخدمة أهلنا في سوريا.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400">
              <HeartHandshake className="w-4 h-4" /> صُنعت بروح التكافل والمسؤولية
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

