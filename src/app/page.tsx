'use client';

import { useState, useEffect } from 'react';
import { Service } from '@/types';
import ServiceCard from '@/components/ServiceCard';
import OrderModal from '@/components/OrderModal';
import Link from 'next/link';
import {
  Heart,
  ShieldCheck,
  Zap,
  Globe2,
  Clock,
  ArrowLeft,
  Truck,
  CheckCircle2,
  Users,
  Building2,
  Send
} from 'lucide-react';

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setServices(data.services);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredServices =
    selectedCategory === 'all'
      ? services
      : services.filter((s) => s.category === selectedCategory);

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleOrderSuccess = (orderId: string) => {
    setAlertSuccess(`تم تسجيل طلبك بنجاح برقم #${orderId}. يمكنك متابعته الآن في لوحة التحكم.`);
    setTimeout(() => setAlertSuccess(null), 8000);
  };

  return (
    <div className="min-h-screen bg-gray-50/50" dir="rtl">
      {/* Alert Banner upon order creation */}
      {alertSuccess && (
        <div className="sticky top-16 z-50 bg-emerald-600 text-white py-3 px-4 shadow-md text-center text-sm font-bold flex items-center justify-center gap-2 animate-in slide-in-from-top">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{alertSuccess}</span>
          <Link
            href="/dashboard/expatriate"
            className="underline underline-offset-4 mr-2 bg-emerald-700 hover:bg-emerald-800 px-3 py-1 rounded-lg text-xs"
          >
            الانتقال للوحة المغترب ←
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-700/80 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-200">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>المنصة الأولى المخصصة لاحتياجات العائلات في سوريا</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            سَنَد .. يدك التي تصل لأهلك <br />
            <span className="text-emerald-300">بكل أمان وموثوقية</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-emerald-100/90 leading-relaxed">
            لا داعي للقلق بشأن الحوالات المعقدة أو انقطاع الخدمات. اختر السلة الغذائية، الأدوية، المياه أو وقود التدفئة، وادفع بالدولار ببطاقتك البنكية، ليتولى فريقنا الميداني في سوريا التسليم المباشر.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#services"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-emerald-900 hover:bg-emerald-50 px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all"
            >
              <span>تصفح باقات الاحتياجات</span>
              <ArrowLeft className="w-4 h-4" />
            </a>

            <Link
              href="/dashboard/expatriate"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-700/60 hover:bg-emerald-700 border border-emerald-500/40 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all"
            >
              <Globe2 className="w-4 h-4" />
              <span>لوحة المغترب والطلبات النشطة</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t border-emerald-700/50 mt-10">
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">+1,200</div>
              <div className="text-xs text-emerald-200/80 mt-1">طلب تم تسليمه بنجاح</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">10</div>
              <div className="text-xs text-emerald-200/80 mt-1">محافظات ومدن مشمولة</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">24 ساعة</div>
              <div className="text-xs text-emerald-200/80 mt-1">متوسط وقت التسليم الميداني</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
              <div className="text-xs text-emerald-200/80 mt-1">توثيق بالصور وتأكيد المستلم</div>
            </div>
          </div>
        </div>
      </section>

      {/* Gateway Cards: Choose Your Interface */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expatriate Gateway */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-emerald-500/80 flex flex-col justify-between hover:shadow-2xl transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                  المغترب السوري (خارج الوطن)
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                  👤
                </div>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">لوحة تحكم المغترب</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                تصفح الباقات، تقديم طلب جديد، الدفع بالدولار عبر البطاقة، ومتابعة شريط تقدم التوصيل للأهل في سوريا لحظة بلحظة.
              </p>
            </div>
            <Link
              href="/dashboard/expatriate"
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm shadow transition"
            >
              <span>فتح لوحة تحكم المغترب</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Provider Gateway */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-amber-500/80 flex flex-col justify-between hover:shadow-2xl transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                  مزود الخدمة الميداني (داخل سوريا)
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold">
                  🚚
                </div>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">لوحة تحكم المزود المحلي</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                خاصة بالمزود في دمشق وحلب والمحافظات: استلام الطلبات المدفوعة، الاتصال بالمستلم عبر واتساب أو الهاتف، وتأكيد التسليم.
              </p>
            </div>
            <Link
              href="/dashboard/provider"
              className="w-full inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-bold text-sm shadow transition"
            >
              <span>فتح لوحة مزود الخدمة (سوريا)</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            بساطة وسرعة
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            كيف تعمل منصة سَنَد في 3 خطوات؟
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            صممنا المنصة لتختصر وقتك وتوفر لعائلتك أقصى درجات الاهتمام دون عناء
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xl mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">اختر الباقة وحدد العنوان</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              تصفح السلات التموينية، باقات الأدوية المزمنة، صهاريج المياه، أو وقود التدفئة، وسجل اسم ورقم هاتف الأهل في سوريا.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs relative">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xl mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">ادفع بالدولار بأمان تام</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              الدفع يتم عبر بوابة Lemon Squeezy الدولية ببطاقتك الائتمانية دون الحاجة لأي وساطة أو عمولات غير معلنة.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs relative">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xl mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">التسليم الميداني والتوثيق</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              يصل إشعار آلي فوري عبر تيليغرام لمزود الخدمة المحلي في دمشق أو حلب أو المحافظة المعنية للبدء بالتجهيز والتسليم لباب المنزل.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-gray-200/60">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              الباقات المتوفرة حالياً
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
              باقات الدعم والاحتياجات الأساسية
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              الأسعار بالدولار محددة بدقة وفق تكاليف التجهيز والتوصيل الميداني
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 text-xs">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'food', label: 'سلل غذائية' },
              { id: 'health', label: 'أدوية وصحة' },
              { id: 'water', label: 'مياه شرب' },
              { id: 'energy', label: 'طاقة وتدفئة' },
              { id: 'emergency', label: 'أطفال وطوارئ' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={handleSelectService}
            />
          ))}
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-right">
            <h3 className="text-xl sm:text-2xl font-black">هل لديك طلب خاص أو حاجة لعائلة معينة؟</h3>
            <p className="text-xs sm:text-sm text-emerald-100">
              فريق سَنَد الميداني يمكنه تأمين متطلبات خاصة (أجهزة طبية، بطاريات إنفرتر، صيانة منازل) بالتنسيق المباشر.
            </p>
          </div>
          <Link
            href="/dashboard/expatriate"
            className="inline-flex items-center gap-2 bg-white text-emerald-900 hover:bg-emerald-50 px-5 py-3 rounded-xl font-bold text-xs shadow transition shrink-0"
          >
            <span>تقديم طلب مخصص عبر لوحة المغترب</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Order Modal */}
      <OrderModal
        service={selectedService}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  );
}
