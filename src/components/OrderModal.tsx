'use client';

import { useState } from 'react';
import { Service } from '@/types';
import { SYRIAN_CITIES } from '@/lib/mockData';
import { X, ShieldCheck, CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface OrderModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export default function OrderModal({ service, isOpen, onClose, onOrderSuccess }: OrderModalProps) {
  const [formData, setFormData] = useState({
    beneficiary_name: '',
    beneficiary_phone: '',
    beneficiary_city: 'دمشق',
    beneficiary_address: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !service) return null;

  const estimatedSyp = (service.price_usd * 14800).toLocaleString('ar-SY');

  const handleSubmit = async (simulatePaid: boolean = false) => {
    if (!formData.beneficiary_name || !formData.beneficiary_phone || !formData.beneficiary_address) {
      setError('يرجى تعبئة اسم المستلم ورقم الهاتف والعنوان بالتفصيل');
      return;
    }

    setError(null);
    if (simulatePaid) {
      setSimulationLoading(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: service.id,
          ...formData,
          simulatePaid
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل في حفظ الطلب');
      }

      if (simulatePaid) {
        // Immediate success in demo mode
        onOrderSuccess(data.order.id);
        onClose();
      } else {
        // Lemon Squeezy integration
        // In real deployment, redirect to Lemon Squeezy checkout with custom data
        const storeUrl = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_URL;
        if (storeUrl) {
          window.location.href = `${storeUrl}?checkout[custom][order_id]=${data.order.id}`;
        } else {
          // If Lemon Squeezy env is not set yet, mark as created and inform user
          alert(`تم إنشاء الطلب برقم #${data.order.id} بنجاح!\n(لتفعيل بوابة Lemon Squeezy، قم بوضع رابط متجرك في .env.local)`);
          onOrderSuccess(data.order.id);
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء معالجة الطلب');
    } finally {
      setLoading(false);
      setSimulationLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-200 bg-emerald-800/60 px-2 py-0.5 rounded">
              تثبيت طلب باقة دعم
            </span>
            <h2 className="text-lg font-bold mt-1 text-white">{service.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-emerald-800/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Summary */}
        <div className="bg-emerald-50/70 border-b border-emerald-100 p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-600">المبلغ الإجمالي بالدولار:</div>
            <div className="text-2xl font-black text-emerald-700">${service.price_usd} USD</div>
          </div>
          <div className="text-left">
            <div className="text-xs text-gray-500">القيمة التقديرية بالداخل:</div>
            <div className="text-sm font-bold text-gray-700">≈ {estimatedSyp} ل.س</div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              اسم المستلم في سوريا <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="مثال: الوالدة أم عمار، أو أحمد الشامي"
              value={formData.beneficiary_name}
              onChange={(e) => setFormData({ ...formData, beneficiary_name: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                رقم هاتف المستلم (سيريتل أو إم تي إن) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="0944123456 أو +9639..."
                dir="ltr"
                value={formData.beneficiary_phone}
                onChange={(e) => setFormData({ ...formData, beneficiary_phone: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition text-right"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                المحافظة / المنطقة <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.beneficiary_city}
                onChange={(e) => setFormData({ ...formData, beneficiary_city: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition bg-white"
              >
                {SYRIAN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              العنوان بالتفصيل (الحي، الشارع، علامة مميزة) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="مثال: الميدان - زقاق الموصلي - بناء الوفاء - طابق ثاني"
              value={formData.beneficiary_address}
              onChange={(e) => setFormData({ ...formData, beneficiary_address: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              ملاحظات خاصة لمزود الخدمة (اختياري)
            </label>
            <textarea
              rows={2}
              placeholder="مثال: يرجى الاتصال قبل الوصول بساعة لتواجد الأهل، أو تفاصيل الروشتة الطبية"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition resize-none"
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
            <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ضمان منصة سَنَد:</span>
            </div>
            <p>يتم تحويل الطلب فور الدفع إلى الفريق الميداني في محافظتك عبر تيليغرام مع توثيق التسليم بالفيديو أو الفاتورة.</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-2.5 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            إلغاء
          </button>

          {/* Quick Demo button for testing presentation */}
          <button
            type="button"
            disabled={simulationLoading || loading}
            onClick={() => handleSubmit(true)}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            title="إنشاء الطلب واحتسابه مدفوعاً فوراً لرؤية النتيجة في لوحة المزود داخل سوريا"
          >
            {simulationLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>محاكاة دفع فوري (للعرض)</span>
          </button>

          {/* Real Checkout with Lemon Squeezy */}
          <button
            type="button"
            disabled={loading || simulationLoading}
            onClick={() => handleSubmit(false)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>دفع آمن (${service.price_usd})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
