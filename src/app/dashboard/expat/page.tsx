import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// تهيئة عميل Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export default async function ExpatDashboard() {

  // دالة الخادم (Server Action) لإنشاء الطلب وتوجيه المستخدم لبوابة Plisio
  async function handlePayment(formData: FormData) {
    'use server';

    const serviceName = (formData.get('service_name') as string) || "باقة سَنَد الأساسية (سلة غذائية)";
    const priceUSD = 50;
    const beneficiaryName = (formData.get('beneficiary_name') as string) || "عائلة سَنَد في سوريا";
    const beneficiaryPhone = (formData.get('beneficiary_phone') as string) || "+963944123456";
    const beneficiaryCity = (formData.get('beneficiary_city') as string) || "دمشق";
    const beneficiaryAddress = (formData.get('beneficiary_address') as string) || "دمشق - الميدان";
    const notes = (formData.get('notes') as string) || "طلب عبر بوابة USDT (Plisio)";

    let orderId = `ord-${Date.now().toString().slice(-6)}`;

    // 1. تسجيل الطلب في Supabase بحالة قيد الانتظار
    if (supabase) {
      try {
        // جلب أول خدمة متوفرة لربط المفتاح الأجنبي بشكل صحيح
        const { data: serviceData } = await supabase
          .from('services')
          .select('id')
          .limit(1)
          .single();

        const serviceId = serviceData?.id;

        if (serviceId) {
          const { data: newOrder, error } = await supabase
            .from('orders')
            .insert([
              {
                service_id: serviceId,
                status: 'pending_payment',
                total_usd: priceUSD,
                beneficiary_name: beneficiaryName,
                beneficiary_phone: beneficiaryPhone,
                beneficiary_city: beneficiaryCity,
                beneficiary_address: beneficiaryAddress,
                notes: notes
              }
            ])
            .select('id')
            .single();

          if (!error && newOrder?.id) {
            orderId = newOrder.id;
          }
        }
      } catch (err) {
        console.warn('Supabase insert warning, proceeding with generated orderId:', err);
      }
    }

    // 2. طلب رابط الفاتورة من Plisio API (USDT على شبكة TRC-20)
    const apiKey = process.env.PLISIO_API_KEY;
    if (!apiKey) {
      throw new Error("مفتاح PLISIO_API_KEY غير موجود في متغيرات البيئة");
    }

    const plisioUrl = `https://api.plisio.net/api/v1/invoices/new?source_currency=USD&source_amount=${priceUSD}&order_name=${encodeURIComponent(serviceName)}&order_number=${orderId}&currency=USDT_TRX&api_key=${apiKey}`;

    const response = await fetch(plisioUrl, { cache: 'no-store' });
    const data = await response.json();

    if (data.status === 'success' && data.data?.invoice_url) {
      // 3. توجيه المغترب مباشرة إلى صفحة الدفع الخاصة بـ Plisio
      redirect(data.data.invoice_url);
    } else {
      console.error("Plisio Error:", data);
      throw new Error(`لم نتمكن من إنشاء رابط الدفع: ${JSON.stringify(data)}`);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border border-gray-100">
        <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black text-2xl mx-auto mb-3 shadow-md shadow-emerald-200">
          س
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-1">منصة سَنَد - بوابة المغترب</h1>
        <p className="text-xs text-gray-500 mb-6">الدفع الآمن بالعملات الرقمية (USDT TRC-20) والتوصيل لأهلك في سوريا</p>

        <div className="border border-emerald-100 bg-gradient-to-b from-emerald-50/60 to-white rounded-2xl p-6 mb-6 text-right">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-emerald-900">الباقة الأساسية (سلة غذائية عائلية)</h2>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              USDT (TRC-20)
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-black text-gray-900">$50</span>
            <span className="text-xs text-gray-500">USD</span>
            <span className="text-xs font-semibold text-emerald-700 mr-2">≈ 740,000 ليرة سورية</span>
          </div>

          <ul className="text-xs text-gray-600 mb-6 space-y-2 border-t border-emerald-100/80 pt-3">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>توصيل ميداني مباشر خلال 24 ساعة لكافة المحافظات</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>مواد تموينية متكاملة (أرز، سكر، زيت، برغل، سمنة، معلبات)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>إشعار فوري عبر تيليغرام للمزود وتقرير تسليم للأهل</span>
            </li>
          </ul>

          <form action={handlePayment} className="space-y-3">
            <div className="space-y-2 text-right">
              <label className="block text-xs font-bold text-gray-700">بيانات المستلم في سوريا (اختياري / سريع):</label>
              <input
                type="text"
                name="beneficiary_name"
                defaultValue="الأهل في دمشق"
                placeholder="اسم المستلم"
                className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
              <input
                type="tel"
                name="beneficiary_phone"
                defaultValue="+963944123456"
                placeholder="رقم الهاتف السوري"
                dir="ltr"
                className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 outline-none text-right"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
            >
              <span>طلب الباقة والدفع فوراً (50 USDT)</span>
              <span>←</span>
            </button>
          </form>
        </div>

        <p className="text-[11px] text-gray-400">
          🔒 تتم معالجة المعاملة المشفرة بأمان عبر بوابة Plisio الدولية دون كشف هوية المغترب
        </p>
      </div>
    </div>
  );
}
