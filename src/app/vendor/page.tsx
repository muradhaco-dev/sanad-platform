'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Product, VendorLedgerEntry } from '@/types/store';
import {
  Store,
  Wallet,
  Plus,
  Trash2,
  Package,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';

export default function VendorDashboardPage() {
  const { t, lang } = useLanguage();

  const [activeTab, setActiveTab] = useState<'products' | 'wallet'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalGross: 0,
    totalFees: 0,
    pendingBalance: 0,
    settledBalance: 0,
    entries: [] as VendorLedgerEntry[],
  });

  // Add Product Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    price_usd: '',
    category: 'food',
    image_url: '',
  });

  const vendorId = 'vendor-damascus-01'; // Default active vendor for showcase

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, ledgerRes] = await Promise.all([
        fetch(`/api/vendor/products?vendorId=${vendorId}`),
        fetch(`/api/vendor/ledger?vendorId=${vendorId}`),
      ]);

      const prodData = await prodRes.json();
      const ledgerData = await ledgerRes.json();

      if (prodData.success) {
        setProducts(prodData.products);
      }
      if (ledgerData.success) {
        setStats(ledgerData.stats);
      }
    } catch (err) {
      console.error('Error fetching vendor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      const res = await fetch('/api/vendor/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          vendor_id: vendorId,
          vendor_name: 'مستودعات الشام الغذائية (دمشق)',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setFormData({
          title_en: '',
          title_ar: '',
          description_en: '',
          description_ar: '',
          price_usd: '',
          category: 'food',
          image_url: '',
        });
        fetchData();
      } else {
        alert(data.error || 'Failed to create product');
      }
    } catch (err) {
      alert('Error connecting to server');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm(t('deleteProductConfirm'))) return;

    try {
      const res = await fetch(`/api/vendor/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      alert('Error deleting product');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Vendor Top Banner */}
      <div className="bg-white border-b border-slate-200/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 mb-1">
              <Store className="w-4 h-4" />
              <span>مستودعات الشام الغذائية • دمشق (Vendor ID: #{vendorId})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('vendorDashboardTitle')}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {t('vendorDashboardSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addNewProductBtn')}</span>
            </button>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('adminPortal')}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Metric Cards: Wallet & Balances */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Gross Sales */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-400">{t('totalGrossSales')}</div>
            <div className="text-2xl font-black text-slate-900 mt-1">${stats.totalGross.toFixed(2)}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">من إجمالي مبيعات المغتربين</div>
          </div>

          {/* Platform Commission */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-400">{t('platformCommissionDeducted')}</div>
            <div className="text-2xl font-black text-rose-600 mt-1">-${stats.totalFees.toFixed(2)}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">رسوم المنصة وتجهيز الدفع</div>
          </div>

          {/* Pending Balance for Payout */}
          <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500 shadow-xs bg-emerald-50/20">
            <div className="text-xs font-bold text-emerald-800 flex items-center justify-between">
              <span>{t('pendingBalancePayout')}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">${stats.pendingBalance.toFixed(2)}</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              ≈ {(stats.pendingBalance * 14800).toLocaleString('ar-SY')} ل.س كاش
            </div>
          </div>

          {/* Settled Balance */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-400">{t('settledBalanceTotal')}</div>
            <div className="text-2xl font-black text-blue-700 mt-1">${stats.settledBalance.toFixed(2)}</div>
            <div className="text-[11px] text-blue-600 font-semibold mt-0.5">تم تسليمها كاش سابقاً</div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'products'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t('tabProductManagement')} ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'wallet'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>{t('tabWalletLedger')}</span>
          </button>
        </div>

        {/* Tab 1: Product Management */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => {
                const title = lang === 'ar' ? prod.title_ar : prod.title_en;
                const desc = lang === 'ar' ? prod.description_ar : prod.description_en;

                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-40 rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <img src={prod.image_url} alt={title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {prod.category}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Active
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mb-1">{title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{desc}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                      <div className="text-lg font-black text-slate-900">${prod.price_usd} USD</div>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Wallet & Ledger */}
        {activeTab === 'wallet' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">{t('recentTransactions')}</h3>
                <p className="text-xs text-slate-500">حركات مبيعات المتجر، عمولة المنصة، وحالة التسليم الميداني</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 text-start">رقم الطلب</th>
                    <th className="py-3 px-4 text-start">المنتج / الباقة</th>
                    <th className="py-3 px-4 text-start">المبلغ الإجمالي</th>
                    <th className="py-3 px-4 text-start">عمولة المنصة (10%)</th>
                    <th className="py-3 px-4 text-start">صافي المستحق للمزود</th>
                    <th className="py-3 px-4 text-start">حالة الصرف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{entry.order_id}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{entry.product_title}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">${entry.gross_amount.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-rose-600 font-semibold">-${entry.platform_fee.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-black text-emerald-700">${entry.net_vendor_amount.toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        {entry.status === 'settled' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">
                              <CheckCircle2 className="w-3 h-3 text-blue-600" />
                              <span>تم التسليم كاش</span>
                            </span>
                            {entry.payout_note && (
                              <div className="text-[10px] text-slate-400 mt-0.5">{entry.payout_note}</div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            <span>معلق (بانتظار الصرف)</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="text-base font-bold">{t('createProductModalTitle')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('titleArLabel')} *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: سلة مواد تموينية فاخرة"
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('titleEnLabel')} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium Food Supply Bundle"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('priceLabel')} *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    step="0.01"
                    placeholder="45"
                    value={formData.price_usd}
                    onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('categoryLabel')}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 bg-white outline-none focus:border-emerald-600"
                  >
                    <option value="food">غذائي (Food)</option>
                    <option value="health">صحي (Health)</option>
                    <option value="energy">طاقة وإنارة (Energy)</option>
                    <option value="winter">شتوي (Winter)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('imageUrlLabel')}</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('descArLabel')}</label>
                <textarea
                  rows={2}
                  placeholder="تفاصيل المحتويات والمواصفات..."
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow"
                >
                  {modalLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{t('saveProductBtn')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
