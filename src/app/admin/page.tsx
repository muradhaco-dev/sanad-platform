'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  WithdrawalRequest,
  VendorPayoutSummary,
  UserRole,
} from '@/types/store';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Clock,
  DollarSign,
  Building2,
  Phone,
  CreditCard,
  X,
  Loader2,
  FileCheck2,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

export default function AdminPayoutDashboardPage() {
  const { t, lang } = useLanguage();

  // Auth & RBAC State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Data State
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [vendors, setVendors] = useState<VendorPayoutSummary[]>([]);
  const [stats, setStats] = useState({
    pendingCount: 0,
    pendingTotal: 0,
    paidTotal: 0,
    totalRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Settlement Modal State
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // 1. Strict Admin Authentication & Role Verification
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user ?? null;
        setCurrentUser(user);

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          const role = profile?.role || (user.user_metadata?.role as UserRole) || 'customer';
          setUserRole(role);
        } else {
          setUserRole(null);
        }
      } catch (err) {
        console.warn('Error verifying admin role:', err);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAdminAuth();
  }, []);

  // 2. Fetch Admin Payout Requests & Vendor Ledger
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/withdrawals');
      const data = await res.json();
      if (data.success) {
        setWithdrawals(data.withdrawals);
        setVendors(data.vendors);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authChecked && userRole === 'admin') {
      fetchAdminData();
    } else if (authChecked) {
      setLoading(false);
    }
  }, [authChecked, userRole]);

  // Handle Mark as Paid Settlement Action
  const handleOpenSettleModal = (item: WithdrawalRequest) => {
    setSelectedWithdrawal(item);
    setTransactionRef(`CHAM-${Date.now().toString().slice(-6)}`);
    setAdminNotes(
      lang === 'ar'
        ? 'تم تسليم المبلغ نقداً في دمشق وإشعار التاجر'
        : 'Remitted offline in Damascus, verified with receipt.'
    );
  };

  const handleConfirmSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawal) return;

    if (!transactionRef.trim()) {
      alert(lang === 'ar' ? 'يرجى إدخال رقم إشعار الحوالة' : 'Please provide transaction reference');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          withdrawalId: selectedWithdrawal.id,
          status: 'paid',
          transactionRef: transactionRef.trim(),
          adminNotes: adminNotes.trim(),
          settledBy: currentUser?.id,
        }),
      });

      const result = await res.json();
      if (result.success) {
        showToast(
          lang === 'ar'
            ? `تمت تسوية طلب السحب بنجاح واعتماد رقم الإشعار (${transactionRef})`
            : `Payout settled successfully with reference (${transactionRef})`
        );
        setSelectedWithdrawal(null);
        fetchAdminData();
      } else {
        alert(result.error || 'Failed to settle withdrawal');
      }
    } catch (err) {
      alert('Error settling withdrawal');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (statusFilter === 'all') return true;
    return w.status === statusFilter;
  });

  // Strict RBAC Guard: Admin Only
  if (authChecked && userRole !== 'admin') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-slate-50 w-full">
        <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 text-center shadow-lg space-y-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-gray-900">
            {lang === 'ar' ? 'منطقة محظورة - للإدارة فقط' : 'Access Restricted - Admin Only'}
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            {lang === 'ar'
              ? 'هذه اللوحة مخصصة فقط لمدير المنصة في سوريا لتسوية الحوالات اليدوية (Offline Payouts) واعتماد أرقام إشعارات شام كاش.'
              : 'This portal is restricted to platform administrators to settle offline remittances and track vendor ledger liabilities.'}
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
            >
              {lang === 'ar' ? 'العودة للرئيسية' : 'Return Home'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 w-full overflow-x-hidden">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="sticky top-16 z-50 bg-emerald-700 text-white py-2.5 px-4 shadow-lg text-center text-xs font-bold flex items-center justify-center gap-2 animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Header */}
      <div className="bg-slate-900 text-white py-6 sm:py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight">
                  {lang === 'ar' ? 'لوحة إدارة المنصة وتسوية الحوالات' : 'Admin Offline Payout Operations'}
                </h1>
                <span className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                  Syria HQ
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                {lang === 'ar'
                  ? 'إدارة طلبات السحب النقدية، تفاصيل شام كاش / سيريتل كاش، وتأكيد التسليم اليدوي'
                  : 'Manage offline remittance requests, Syrian bank transfers, and manual settlements.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchAdminData}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'تحديث البيانات' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8 w-full">
        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
              {lang === 'ar' ? 'مستحقات معلقة للتسليم في سوريا' : 'Pending Payouts Liability'}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-700">
              ${stats.pendingTotal.toFixed(2)} <span className="text-xs font-normal">USD</span>
            </div>
            <p className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md inline-block font-semibold mt-2">
              {stats.pendingCount} {lang === 'ar' ? 'طلب سحب قيد الانتظار' : 'pending requests'}
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
              {lang === 'ar' ? 'إجمالي الحوالات المسواة كاش' : 'Settled Remittances'}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-800">
              ${stats.paidTotal.toFixed(2)} <span className="text-xs font-normal">USD</span>
            </div>
            <p className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block font-semibold mt-2">
              {lang === 'ar' ? 'تم تسليمها للمزودين بموجب إشعارات' : 'Dispatched with vouchers'}
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
              {lang === 'ar' ? 'عدد المتاجر والمزودين النشطين' : 'Active Syrian Vendors'}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800">{vendors.length}</div>
            <p className="text-[11px] text-slate-500 pt-2 border-t border-gray-100">
              {lang === 'ar' ? 'مستودعات معتمدة ومربوطة بالخريطة' : 'Verified dispatch centers'}
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
              {lang === 'ar' ? 'إجمالي طلبات السحب' : 'Total Payout Requests'}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800">{stats.totalRequests}</div>
            <p className="text-[11px] text-slate-500 pt-2 border-t border-gray-100">
              {lang === 'ar' ? 'سجل الحوالات التاريخية' : 'Historical records'}
            </p>
          </div>
        </div>

        {/* Withdrawal Requests Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{lang === 'ar' ? 'طلبات السحب النقدي والحوالات المطلوبة' : 'Vendor Withdrawal Requests'}</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {lang === 'ar'
                  ? 'عرض أرقام حسابات شام كاش، أسماء المستفيدين، وتأكيد التسليم اليدوي في سوريا'
                  : 'Inspect Cham Cash / Syrian bank details and mark remittances as settled.'}
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {lang === 'ar' ? 'الكل' : 'All'} ({withdrawals.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 ${
                  statusFilter === 'pending'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                {lang === 'ar' ? 'بانتظار التحويل' : 'Pending'} ({stats.pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('paid')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shrink-0 ${
                  statusFilter === 'paid'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                {lang === 'ar' ? 'تم التسليم' : 'Settled'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center space-y-2">
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs text-gray-400">{lang === 'ar' ? 'جاري تحميل السجلات...' : 'Loading requests...'}</p>
            </div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              {lang === 'ar' ? 'لا توجد طلبات سحب مطابقة لهذا الفلتر' : 'No withdrawal requests found.'}
            </div>
          ) : (
            <>
              {/* Mobile Card View for Admin Withdrawals */}
              <div className="block md:hidden space-y-3">
                {filteredWithdrawals.map((w) => (
                  <div key={w.id} className="p-4 rounded-2xl border border-gray-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200/80 pb-2">
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{w.store_name}</div>
                        <div className="text-[11px] text-gray-500">{w.vendor_name}</div>
                      </div>
                      <span className="font-black text-gray-900 text-base">${w.amount.toFixed(2)} USD</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-gray-200 space-y-1 text-xs">
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        {w.payout_method?.method_name || 'Cham Cash'}
                      </span>
                      <p className="font-mono font-bold text-gray-900">{w.payout_method?.account_number}</p>
                      <p className="text-gray-600 font-medium text-[11px]">{w.payout_method?.account_holder_name}</p>
                      {w.payout_method?.notes && (
                        <p className="text-[10px] text-gray-400">{w.payout_method.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        {w.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{lang === 'ar' ? 'تم التسليم كاش' : 'Paid & Settled'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{lang === 'ar' ? 'بانتظار التحويل' : 'Pending Transfer'}</span>
                          </span>
                        )}
                      </div>

                      {w.status === 'pending' ? (
                        <button
                          onClick={() => handleOpenSettleModal(w)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'تأكيد التسليم' : 'Mark as Paid'}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 font-mono">
                          {w.transaction_ref}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table for Admin Withdrawals */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead className="text-[11px] uppercase bg-gray-50 text-gray-500 font-bold border-y border-gray-100">
                    <tr>
                      <th className="py-3 px-4">{lang === 'ar' ? 'المتجر والتاجر' : 'Vendor & Store'}</th>
                      <th className="py-3 px-4">{lang === 'ar' ? 'المبلغ المطلوب' : 'Amount'}</th>
                      <th className="py-3 px-4">{lang === 'ar' ? 'تفاصيل وسيلة الاستلام في سوريا' : 'Syrian Payout Details'}</th>
                      <th className="py-3 px-4">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th className="py-3 px-4">{lang === 'ar' ? 'إشعار الحوالة' : 'Voucher Ref'}</th>
                      <th className="py-3 px-4">{lang === 'ar' ? 'الإجراء' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredWithdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-gray-50/60">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900 text-sm">{w.store_name}</div>
                          <div className="text-gray-500">{w.vendor_name}</div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            {new Date(w.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SY' : 'en-US')}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-black text-gray-900 text-base">${w.amount.toFixed(2)} USD</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 max-w-xs space-y-1">
                            <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                              {w.payout_method?.method_name || 'Cham Cash'}
                            </span>
                            <p className="font-mono font-bold text-gray-900">{w.payout_method?.account_number}</p>
                            <p className="text-gray-600 font-medium text-[11px]">{w.payout_method?.account_holder_name}</p>
                            {w.payout_method?.notes && (
                              <p className="text-[10px] text-gray-400">{w.payout_method.notes}</p>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {w.status === 'paid' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{lang === 'ar' ? 'تم التسليم كاش' : 'Paid & Settled'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>{lang === 'ar' ? 'بانتظار التحويل' : 'Pending Transfer'}</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          {w.transaction_ref ? (
                            <div>
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {w.transaction_ref}
                              </span>
                              {w.admin_notes && (
                                <p className="text-[10px] text-gray-400 font-sans mt-1">{w.admin_notes}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">
                              {lang === 'ar' ? 'لم يسوى بعد' : 'Not settled yet'}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {w.status === 'pending' ? (
                            <button
                              onClick={() => handleOpenSettleModal(w)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                            >
                              <FileCheck2 className="w-3.5 h-3.5" />
                              <span>{lang === 'ar' ? 'تأكيد التسليم' : 'Mark as Paid'}</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{lang === 'ar' ? 'مسوى بالكامل' : 'Settled'}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>

      {/* ================= MODAL: SETTLE / MARK AS PAID ================= */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{lang === 'ar' ? 'تأكيد تسليم الحوالة النقدية في سوريا' : 'Confirm Offline Disbursement'}</span>
              </h3>
              <button
                onClick={() => setSelectedWithdrawal(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vendor & Amount Box */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-emerald-900 font-bold">{selectedWithdrawal.store_name}</span>
                <span className="text-base sm:text-lg font-black text-emerald-800">
                  ${selectedWithdrawal.amount.toFixed(2)} USD
                </span>
              </div>
              <div className="text-xs text-emerald-950 font-medium border-t border-emerald-200/60 pt-2 space-y-0.5">
                <p>
                  <strong>{lang === 'ar' ? 'وسيلة التحويل:' : 'Method:'}</strong> {selectedWithdrawal.payout_method?.method_name}
                </p>
                <p>
                  <strong>{lang === 'ar' ? 'رقم الحساب / المحفظة:' : 'Account #:'}</strong> {selectedWithdrawal.payout_method?.account_number}
                </p>
                <p>
                  <strong>{lang === 'ar' ? 'اسم المستلم:' : 'Beneficiary:'}</strong> {selectedWithdrawal.payout_method?.account_holder_name}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmSettle} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'ar' ? 'رقم إشعار الحوالة / وصل الاستلام *' : 'Voucher / Remittance Reference *'}
                </label>
                <input
                  type="text"
                  required
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="مثال: CHAM-TXN-90214 أو وصل الهرم #88190"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-1 focus:ring-emerald-500 font-mono font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'ar' ? 'ملاحظات الإدارة والتوثيق' : 'Admin Settlement Notes'}
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="ملاحظات التسليم الميداني..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedWithdrawal(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer text-center"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-60"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{lang === 'ar' ? 'تأكيد التسليم وتحديث الرصيد' : 'Confirm Settle (Mark as Paid)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
