'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { VendorPayoutSummary } from '@/types/store';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Building2,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  RefreshCw,
  Loader2,
  FileCheck2
} from 'lucide-react';

export default function AdminPayoutDashboardPage() {
  const { t, lang } = useLanguage();

  const [vendors, setVendors] = useState<VendorPayoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Settle modal state
  const [settlingVendor, setSettlingVendor] = useState<VendorPayoutSummary | null>(null);
  const [payoutNote, setPayoutNote] = useState('');

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/payouts');
      const data = await res.json();
      if (data.success) {
        setVendors(data.vendors);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleSettleSubmit = async () => {
    if (!settlingVendor) return;
    setActionLoading(settlingVendor.vendor_id);

    try {
      const res = await fetch('/api/admin/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: settlingVendor.vendor_id,
          payout_note: payoutNote || 'تم تسليم المبلغ كاش بموجب إشعار حوالة داخلية في سوريا',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setVendors(data.vendors);
        setSuccessToast(`تمت تسوية مبلغ $${data.settledAmount} USD للمزود (${settlingVendor.store_name}) بنجاح!`);
        setTimeout(() => setSuccessToast(null), 6000);
        setSettlingVendor(null);
        setPayoutNote('');
      } else {
        alert(data.error || 'Failed to settle balance');
      }
    } catch (err) {
      alert('Error connecting to server');
    } finally {
      setActionLoading(null);
    }
  };

  const totalPlatformGross = vendors.reduce((sum, v) => sum + v.total_gross_sales, 0);
  const totalPlatformCommissions = vendors.reduce((sum, v) => sum + v.total_platform_fees, 0);
  const totalPendingPayouts = vendors.reduce((sum, v) => sum + v.pending_balance, 0);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Toast Alert */}
      {successToast && (
        <div className="sticky top-16 z-50 bg-emerald-700 text-white py-3 px-4 shadow-lg text-center text-xs font-bold flex items-center justify-center gap-2 animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Admin Top Banner */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>{t('adminPortal')} • منصة سَنَد للتجارة متعددة البائعين</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t('adminDashboardTitle')}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {t('adminDashboardSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchVendors}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث الأرصدة</span>
            </button>

            <Link
              href="/vendor"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition"
            >
              <span>{t('vendorPortal')}</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Metric Cards: Platform Revenue & Payouts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-400">إجمالي مبيعات الماركت بليس</div>
            <div className="text-2xl font-black text-slate-900 mt-1">${totalPlatformGross.toFixed(2)} USD</div>
            <div className="text-[11px] text-slate-500 mt-0.5">مبيعات المغتربين المدفوعة بالكامل</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-400">صافي إيرادات عمولة المنصة (10%)</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">${totalPlatformCommissions.toFixed(2)} USD</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">أرباح سَنَد الصافية المقتطعة</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border-2 border-amber-400 shadow-xs bg-amber-50/20">
            <div className="text-xs font-bold text-amber-800 flex items-center justify-between">
              <span>المستحقات المعلقة الواجب تسليمها كاش</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            </div>
            <div className="text-2xl font-black text-amber-700 mt-1">${totalPendingPayouts.toFixed(2)} USD</div>
            <div className="text-[11px] text-amber-800 font-semibold mt-0.5">
              ≈ {(totalPendingPayouts * 14800).toLocaleString('ar-SY')} ل.س بانتظار الحوالة
            </div>
          </div>
        </div>

        {/* Vendors Balances Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('allVendorsSummary')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                يمكن لمدير المنصة اعتماد الحوالات الميدانية المسلّمة للمزودين داخل دمشق وحلب والمحافظات
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4 text-start">{t('vendorStoreCol')}</th>
                  <th className="py-3.5 px-4 text-start">{t('locationPhoneCol')}</th>
                  <th className="py-3.5 px-4 text-start">{t('grossSalesCol')}</th>
                  <th className="py-3.5 px-4 text-start">{t('commissionCol')}</th>
                  <th className="py-3.5 px-4 text-start">{t('pendingPayoutCol')}</th>
                  <th className="py-3.5 px-4 text-start">{t('settledCol')}</th>
                  <th className="py-3.5 px-4 text-center">{t('action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.map((vendor) => (
                  <tr key={vendor.vendor_id} className="hover:bg-slate-50/70 transition">
                    {/* Store & Vendor Name */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 text-sm">{vendor.store_name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        المسؤول: {vendor.vendor_name} ({vendor.vendor_id})
                      </div>
                    </td>

                    {/* Location & Phone */}
                    <td className="py-4 px-4 text-slate-600">
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{vendor.city}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5" dir="ltr">
                        {vendor.phone}
                      </div>
                    </td>

                    {/* Gross Sales */}
                    <td className="py-4 px-4 font-bold text-slate-900">
                      ${vendor.total_gross_sales.toFixed(2)}
                    </td>

                    {/* Platform Fee */}
                    <td className="py-4 px-4 text-emerald-700 font-semibold">
                      ${vendor.total_platform_fees.toFixed(2)}
                    </td>

                    {/* Pending Balance */}
                    <td className="py-4 px-4">
                      {vendor.pending_balance > 0 ? (
                        <div>
                          <span className="text-sm font-black text-amber-600">
                            ${vendor.pending_balance.toFixed(2)}
                          </span>
                          <div className="text-[10px] text-amber-700 font-semibold">
                            ≈ {(vendor.pending_balance * 14800).toLocaleString('ar-SY')} ل.س
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-bold">$0.00</span>
                      )}
                    </td>

                    {/* Settled to date */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-blue-700">
                        ${vendor.settled_balance.toFixed(2)}
                      </span>
                      {vendor.last_settled_at && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          آخر تسوية: {new Date(vendor.last_settled_at).toLocaleDateString('ar-SY')}
                        </div>
                      )}
                    </td>

                    {/* Action Button: Settle / Paid in Syria */}
                    <td className="py-4 px-4 text-center">
                      {vendor.pending_balance > 0 ? (
                        <button
                          disabled={actionLoading === vendor.vendor_id}
                          onClick={() => {
                            setSettlingVendor(vendor);
                            setPayoutNote(`حوالة مكتب الفؤاد / الهرم ${vendor.city} - تم التسليم للمندوب كاش`);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>{t('markAsSettledBtn')}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                          لا توجد مستحقات معلقة
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Settle Payout Modal */}
      {settlingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                تسوية حوالة أرباح ميدانية
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1">
                تأكيد تسليم المستحقات للمزود: {settlingVendor.store_name}
              </h3>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <div className="text-xs text-emerald-800">المبلغ الإجمالي المعتمد للصرف كاش:</div>
              <div className="text-2xl font-black text-emerald-700 mt-0.5">
                ${settlingVendor.pending_balance.toFixed(2)} USD
              </div>
              <div className="text-xs font-bold text-emerald-900 mt-0.5">
                ≈ {(settlingVendor.pending_balance * 14800).toLocaleString('ar-SY')} ليرة سورية
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم إشعار الحوالة / ملاحظة التسليم في سوريا:
              </label>
              <textarea
                rows={2}
                value={payoutNote}
                onChange={(e) => setPayoutNote(e.target.value)}
                placeholder={t('payoutNotePlaceholder')}
                className="w-full text-xs border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSettlingVendor(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={actionLoading === settlingVendor.vendor_id}
                onClick={handleSettleSubmit}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                {actionLoading === settlingVendor.vendor_id && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>تأكيد التسليم وتصفير الرصيد</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
