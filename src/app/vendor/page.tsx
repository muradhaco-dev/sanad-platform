'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  Product,
  VendorOrderItem,
  VendorPayoutMethod,
  WithdrawalRequest,
  UserRole,
} from '@/types/store';
import VendorLocationPicker from '@/components/VendorLocationPicker';
import {
  Store,
  Package,
  ShoppingBag,
  Wallet,
  ArrowDownToLine,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertCircle,
  MapPin,
  Building2,
  Phone,
  CreditCard,
  X,
  Loader2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function VendorDashboardPage() {
  const { t, lang } = useLanguage();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'wallet' | 'withdrawals'>('products');

  // Auth & RBAC State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Vendor Data State
  const [vendorId, setVendorId] = useState<string>('vendor-damascus-01');
  const [vendorName, setVendorName] = useState<string>('مستودعات الشام الغذائية (دمشق)');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    price_usd: '',
    category: 'food' as 'food' | 'health' | 'energy' | 'winter',
    image_url: '',
    latitude: 33.5138,
    longitude: 36.2765,
    location_name: 'دمشق، كفرسوسة والبرامكة',
  });

  // Orders State
  const [orders, setOrders] = useState<VendorOrderItem[]>([]);
  const [orderUpdatingId, setOrderUpdatingId] = useState<string | null>(null);

  // Wallet & Withdrawals State
  const [walletStats, setWalletStats] = useState({
    totalGrossSales: 0,
    totalPlatformFees: 0,
    totalNetEarnings: 0,
    totalPaidWithdrawals: 0,
    totalPendingWithdrawals: 0,
    availableBalance: 0,
  });
  const [payoutMethods, setPayoutMethods] = useState<VendorPayoutMethod[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);

  // Payout Method Modal State
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [methodForm, setMethodForm] = useState({
    method_name: 'Cham Cash (شام كاش)',
    account_number: '',
    account_holder_name: '',
    phone_number: '',
    notes: '',
  });

  // Withdrawal Request Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethodId, setWithdrawMethodId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // 1. Initial Authentication & Role Verification
  useEffect(() => {
    const checkAuthAndRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user ?? null;
        setCurrentUser(user);

        if (user) {
          // Fetch strict role from Supabase profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, full_name, store_name')
            .eq('id', user.id)
            .single();

          const role = profile?.role || (user.user_metadata?.role as UserRole) || 'customer';
          setUserRole(role);

          if (role === 'vendor' || role === 'admin') {
            setVendorId(user.id);
            if (profile?.store_name) {
              setVendorName(profile.store_name);
            } else if (profile?.full_name) {
              setVendorName(profile.full_name);
            }
          }
        } else {
          setUserRole(null);
        }
      } catch (err) {
        console.warn('Error during vendor auth check:', err);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuthAndRole();
  }, []);

  // 2. Fetch all Vendor Dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes, methodRes, withRes] = await Promise.all([
        fetch(`/api/vendor/products?vendorId=${vendorId}`),
        fetch(`/api/vendor/orders?vendorId=${vendorId}`),
        fetch(`/api/vendor/payout-methods?vendorId=${vendorId}`),
        fetch(`/api/vendor/withdrawals?vendorId=${vendorId}`),
      ]);

      const [prodData, orderData, methodData, withData] = await Promise.all([
        prodRes.json(),
        orderRes.json(),
        methodRes.json(),
        withRes.json(),
      ]);

      if (prodData.success) setProducts(prodData.products);
      if (orderData.success) setOrders(orderData.orders);
      if (methodData.success) {
        setPayoutMethods(methodData.methods);
        if (methodData.methods.length > 0 && !withdrawMethodId) {
          setWithdrawMethodId(methodData.methods[0].id);
        }
      }
      if (withData.success) {
        setWithdrawals(withData.withdrawals);
        setWalletStats(withData.wallet);
      }
    } catch (err) {
      console.error('Error loading vendor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authChecked && (userRole === 'vendor' || userRole === 'admin')) {
      fetchDashboardData();
    } else if (authChecked) {
      setLoading(false);
    }
  }, [authChecked, userRole, vendorId]);

  // Product Actions: Add or Edit
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      title_en: '',
      title_ar: '',
      description_en: '',
      description_ar: '',
      price_usd: '',
      category: 'food',
      image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
      latitude: 33.5138,
      longitude: 36.2765,
      location_name: 'دمشق، كفرسوسة والبرامكة',
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductForm({
      title_en: prod.title_en,
      title_ar: prod.title_ar,
      description_en: prod.description_en,
      description_ar: prod.description_ar,
      price_usd: prod.price_usd.toString(),
      category: prod.category,
      image_url: prod.image_url,
      latitude: prod.latitude || 33.5138,
      longitude: prod.longitude || 36.2765,
      location_name: prod.location_name || 'دمشق، المركز الرئيسي',
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title_en || !productForm.title_ar || !productForm.price_usd) {
      alert('يرجى إدخال اسم المنتج باللغتين وسعر البيع');
      return;
    }

    setActionLoading(true);
    try {
      if (editingProductId) {
        // Edit existing product
        const res = await fetch('/api/vendor/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingProductId,
            ...productForm,
            price_usd: parseFloat(productForm.price_usd),
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast(lang === 'ar' ? 'تم تحديث بيانات المنتج بنجاح!' : 'Product updated successfully!');
          setIsProductModalOpen(false);
          fetchDashboardData();
        } else {
          alert(data.error || 'Failed to update product');
        }
      } else {
        // Create new product
        const res = await fetch('/api/vendor/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...productForm,
            price_usd: parseFloat(productForm.price_usd),
            vendor_id: vendorId,
            vendor_name: vendorName,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast(lang === 'ar' ? 'تمت إضافة المنتج ونشره في المتجر فوراً!' : 'Product created and published instantly!');
          setIsProductModalOpen(false);
          fetchDashboardData();
        } else {
          alert(data.error || 'Failed to add product');
        }
      }
    } catch (err) {
      alert('Error connecting to server');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/vendor/products?id=${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(lang === 'ar' ? 'تم حذف المنتج من المتجر' : 'Product deleted successfully');
        fetchDashboardData();
      }
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  // Order Actions: Update Status
  const handleUpdateOrderStatus = async (itemId: string, newStatus: 'paid' | 'processing' | 'shipped' | 'delivered') => {
    setOrderUpdatingId(itemId);
    try {
      const res = await fetch('/api/vendor/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(lang === 'ar' ? `تم تحديث حالة الطلب إلى: ${newStatus}` : `Order status updated to: ${newStatus}`);
        fetchDashboardData();
      }
    } catch (err) {
      alert('Error updating order');
    } finally {
      setOrderUpdatingId(null);
    }
  };

  // Payout Method Actions
  const handleAddPayoutMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!methodForm.account_number || !methodForm.account_holder_name) {
      alert('يرجى إدخال رقم الحساب/المحفظة واسم صاحب الحساب');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/vendor/payout-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendorId,
          ...methodForm,
          is_default: payoutMethods.length === 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(lang === 'ar' ? 'تمت إضافة وسيلة استلام الحوالة بنجاح!' : 'Payout method saved successfully!');
        setIsMethodModalOpen(false);
        setMethodForm({
          method_name: 'Cham Cash (شام كاش)',
          account_number: '',
          account_holder_name: '',
          phone_number: '',
          notes: '',
        });
        fetchDashboardData();
      }
    } catch (err) {
      alert('Error saving payout method');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePayoutMethod = async (methodId: string) => {
    if (!confirm(lang === 'ar' ? 'هل أنت متأكد من حذف وسيلة الدفع؟' : 'Delete payout method?')) return;
    try {
      const res = await fetch(`/api/vendor/payout-methods?id=${methodId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(lang === 'ar' ? 'تم حذف وسيلة الاستلام' : 'Payout method deleted');
        fetchDashboardData();
      }
    } catch (err) {
      alert('Failed to delete payout method');
    }
  };

  // Request Withdrawal Action
  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (!amountNum || amountNum <= 0) {
      alert(lang === 'ar' ? 'يرجى إدخال مبلغ صحيح' : 'Please enter a valid amount');
      return;
    }
    if (amountNum > walletStats.availableBalance) {
      alert(
        lang === 'ar'
          ? `المبلغ المطلوب ($${amountNum}) أكبر من الرصيد المتاح للسحب ($${walletStats.availableBalance.toFixed(2)})`
          : `Amount exceeds available balance ($${walletStats.availableBalance.toFixed(2)})`
      );
      return;
    }
    if (!withdrawMethodId) {
      alert(lang === 'ar' ? 'يرجى اختيار وسيلة استلام الحوالة' : 'Please select a payout method');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/vendor/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendorId,
          amount: amountNum,
          payout_method_id: withdrawMethodId,
          vendor_name: vendorName,
          store_name: vendorName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          lang === 'ar'
            ? 'تم تقديم طلب السحب بنجاح! سيتم تحويل المبلغ كاش أو عبر وسيلة الدفع المحددة في سوريا'
            : 'Withdrawal requested! Payout will be dispatched offline in Syria.'
        );
        setIsWithdrawModalOpen(false);
        setWithdrawAmount('');
        fetchDashboardData();
      } else {
        alert(data.error || 'Withdrawal failed');
      }
    } catch (err) {
      alert('Error requesting withdrawal');
    } finally {
      setActionLoading(false);
    }
  };

  // Unauthenticated or Non-Vendor Guard
  if (authChecked && userRole !== 'vendor' && userRole !== 'admin') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-900">
            {lang === 'ar' ? 'بوابة التجار والمزودين المعتمدين' : 'Authorized Vendors Only'}
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            {lang === 'ar'
              ? 'هذه اللوحة مخصصة فقط للتجار المعتمدين لإدارة المنتجات وموقع المستودعات ورصيد المبيعات وطلبات السحب (شام كاش / سيريتل كاش / الهرم).'
              : 'This portal is strictly reserved for verified vendors to manage products, dispatch locations, earnings, and Syrian offline payout requests.'}
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              href="/auth/signup"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition"
            >
              {lang === 'ar' ? 'سجل الآن كتاجر أو مزود محلي' : 'Sign Up as a Verified Vendor'}
            </Link>
            <Link
              href="/auth/login"
              className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs transition"
            >
              {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="sticky top-16 z-50 bg-emerald-700 text-white py-3 px-4 shadow-lg text-center text-xs font-bold flex items-center justify-center gap-2 animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-amber-700/60 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{vendorName}</h1>
                <span className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  {lang === 'ar' ? 'تاجر نشط ومعتمد' : 'Active Verified Vendor'}
                </span>
              </div>
              <p className="text-xs text-amber-200/80 mt-1 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'ar' ? 'إدارة المنتجات، موقع المستودع، الطلبات، ورصيد شام كاش' : 'Products, GPS Coordinates, Orders, and Wallet'}</span>
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenAddProduct}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{lang === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}</span>
            </button>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition cursor-pointer"
            >
              <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'ar' ? 'طلب سحب رصيد' : 'Request Payout'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 sm:gap-4 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'products'
                ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إدارة المنتجات والمستودعات' : 'Products & Location'}</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-gray-100 text-gray-700 rounded-full font-bold">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{lang === 'ar' ? 'الطلبات الواردة والمدفوعة' : 'Incoming Paid Orders'}</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full font-bold">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'wallet'
                ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>{lang === 'ar' ? 'المحفظة والأرباح' : 'Wallet & Earnings'}</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-600 text-white rounded-full font-bold">
              ${walletStats.availableBalance.toFixed(0)}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'withdrawals'
                ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>{lang === 'ar' ? 'سحب الرصيد وطرق الدفع السورية' : 'Syrian Payouts & Methods'}</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded-full font-bold">
              {withdrawals.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-gray-500">
              {lang === 'ar' ? 'جاري تحميل بيانات المتجر والمحفظة...' : 'Loading vendor dashboard...'}
            </p>
          </div>
        ) : (
          <>
            {/* TAB 1: PRODUCTS MANAGEMENT */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                  <div>
                    <h2 className="text-base font-black text-gray-900">
                      {lang === 'ar' ? 'قائمة منتجات المتجر' : 'Your Store Catalog'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {lang === 'ar'
                        ? 'المنتجات التي تضيفها تصبح متاحة للعملاء للشراء فوراً مع تحديد موقع المستودع الجغرافي'
                        : 'Products go live on the store immediately with exact dispatch coordinates.'}
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddProduct}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'إضافة منتج جديد' : 'Add Product'}</span>
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center space-y-3">
                    <Package className="w-12 h-12 text-gray-300 mx-auto" />
                    <h3 className="text-sm font-bold text-gray-700">
                      {lang === 'ar' ? 'لا توجد منتجات مسجلة بعد' : 'No products listed yet'}
                    </h3>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      {lang === 'ar'
                        ? 'ابدأ بإضافة أول منتج لتلقي طلبات الشراء من المغتربين لعائلاتهم في سوريا.'
                        : 'Start adding your products to receive direct orders from expats.'}
                    </p>
                    <button
                      onClick={handleOpenAddProduct}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      {lang === 'ar' ? 'إضافة منتج الآن' : 'Add First Product'}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative h-44 bg-gray-100 overflow-hidden">
                            <img
                              src={prod.image_url}
                              alt={prod.title_ar}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-black text-emerald-800 shadow-xs">
                              ${prod.price_usd} USD
                            </div>
                            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                              {prod.category}
                            </div>
                          </div>

                          <div className="p-4 space-y-2.5">
                            <div>
                              <h3 className="font-bold text-gray-900 text-sm line-clamp-1">
                                {lang === 'ar' ? prod.title_ar : prod.title_en}
                              </h3>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                {lang === 'ar' ? prod.description_ar : prod.description_en}
                              </p>
                            </div>

                            {/* Location Badge */}
                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] text-gray-600 font-medium">
                              <span className="flex items-center gap-1 text-slate-800 truncate">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate">{prod.location_name || 'دمشق'}</span>
                              </span>
                              {prod.latitude && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {prod.latitude.toFixed(2)}, {prod.longitude?.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-4 pt-0 border-t border-gray-100 flex items-center justify-between gap-2 mt-3">
                          <Link
                            href={`/products/${prod.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 hover:text-emerald-700 transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{lang === 'ar' ? 'عرض بالمتجر' : 'View in Store'}</span>
                          </Link>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-emerald-700 transition cursor-pointer"
                              title="تعديل المنتج"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="حذف المنتج"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: INCOMING ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-black text-gray-900">
                      {lang === 'ar' ? 'الطلبات الواردة والمدفوعة من العملاء' : 'Incoming Customer Paid Orders'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {lang === 'ar'
                        ? 'تم دفع ثمن هذه الطلبات بالكامل ومطابقة حصتك في المحفظة بعد حسم عمولة المنصة 10%'
                        : 'These orders are fully paid online. Net earnings are deposited in your wallet.'}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'ar' ? 'دفع مؤكد بنسبة 100%' : '100% Guaranteed Payment'}</span>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center space-y-3">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
                    <h3 className="text-sm font-bold text-gray-700">
                      {lang === 'ar' ? 'لا توجد طلبات جديدة حالياً' : 'No incoming orders yet'}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {lang === 'ar' ? 'ستظهر هنا الطلبات فور قيام العميل بالشراء والدفع' : 'Paid orders will show up here.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded-md">
                              {order.order_number}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(order.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SY' : 'en-US')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-600">
                              {lang === 'ar' ? 'حالة التجهيز:' : 'Status:'}
                            </span>
                            <select
                              value={order.status}
                              disabled={orderUpdatingId === order.id}
                              onChange={(e) =>
                                handleUpdateOrderStatus(
                                  order.id,
                                  e.target.value as 'paid' | 'processing' | 'shipped' | 'delivered'
                                )
                              }
                              className="text-xs font-bold border border-gray-300 rounded-lg px-2.5 py-1 bg-white text-gray-800 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                            >
                              <option value="paid">{lang === 'ar' ? 'مدفوع - جديد' : 'Paid - New'}</option>
                              <option value="processing">{lang === 'ar' ? 'قيد التجهيز والتغليف' : 'Processing'}</option>
                              <option value="shipped">{lang === 'ar' ? 'تم التسليم للشحن' : 'Shipped'}</option>
                              <option value="delivered">{lang === 'ar' ? 'تم التسليم للعميل' : 'Delivered'}</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          {/* Item Details */}
                          <div className="space-y-1">
                            <span className="text-gray-400 font-medium">{lang === 'ar' ? 'المنتج المطلوب:' : 'Product:'}</span>
                            <p className="font-bold text-gray-900 text-sm">{order.product_title}</p>
                            <p className="text-gray-500">
                              {lang === 'ar' ? 'الكمية:' : 'Qty:'} <span className="font-bold">{order.quantity}</span> × ${order.unit_price} USD
                            </p>
                          </div>

                          {/* Customer & Address */}
                          <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-gray-400 font-medium">{lang === 'ar' ? 'المستفيد وعنوان التسليم:' : 'Recipient & Address:'}</span>
                            <p className="font-bold text-gray-900">{order.customer_name}</p>
                            <p className="text-gray-600 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span dir="ltr">{order.customer_phone || '+963 944 123 456'}</span>
                            </p>
                            <p className="text-gray-500 flex items-start gap-1">
                              <MapPin className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                              <span>{order.delivery_address || 'دمشق'}</span>
                            </p>
                          </div>

                          {/* Financial Breakdown */}
                          <div className="space-y-1.5 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 flex flex-col justify-center">
                            <div className="flex justify-between text-gray-600">
                              <span>{lang === 'ar' ? 'إجمالي الطلب:' : 'Gross Amount:'}</span>
                              <span className="font-bold">${order.total_price.toFixed(2)} USD</span>
                            </div>
                            <div className="flex justify-between text-rose-600">
                              <span>{lang === 'ar' ? 'عمولة المنصة (10%):' : 'Platform Fee (10%):'}</span>
                              <span className="font-bold">-${order.platform_fee.toFixed(2)} USD</span>
                            </div>
                            <div className="border-t border-emerald-200/60 pt-1 flex justify-between font-black text-emerald-800 text-sm">
                              <span>{lang === 'ar' ? 'صافي أرباحك في المحفظة:' : 'Your Net Earning:'}</span>
                              <span>${order.net_vendor_amount.toFixed(2)} USD</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: WALLET & EARNINGS */}
            {activeTab === 'wallet' && (
              <div className="space-y-8">
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-5 rounded-2xl shadow-md space-y-1">
                    <span className="text-emerald-100 text-xs font-bold uppercase tracking-wider">
                      {lang === 'ar' ? 'الرصيد المتاح للسحب الفوري' : 'Available for Payout'}
                    </span>
                    <div className="text-3xl font-black">${walletStats.availableBalance.toFixed(2)} <span className="text-xs font-normal">USD</span></div>
                    <p className="text-[11px] text-emerald-200 pt-2 border-t border-emerald-500/50 flex items-center justify-between">
                      <span>{lang === 'ar' ? 'جاهز للتحويل في سوريا' : 'Ready for Syrian Hawala'}</span>
                      <button
                        onClick={() => setIsWithdrawModalOpen(true)}
                        className="underline font-bold text-white cursor-pointer"
                      >
                        {lang === 'ar' ? 'سحب الآن' : 'Withdraw'}
                      </button>
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                      {lang === 'ar' ? 'إجمالي المبيعات' : 'Gross Total Sales'}
                    </span>
                    <div className="text-2xl font-black text-gray-900">${walletStats.totalGrossSales.toFixed(2)}</div>
                    <p className="text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                      {lang === 'ar' ? 'القيمة الإجمالية لطلباتك المدفوعة' : 'Total gross paid by customers'}
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                      {lang === 'ar' ? 'طلبات سحب قيد المعالجة' : 'Pending Withdrawals'}
                    </span>
                    <div className="text-2xl font-black text-amber-700">${walletStats.totalPendingWithdrawals.toFixed(2)}</div>
                    <p className="text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                      {lang === 'ar' ? 'بانتظار إشعار الحوالة من الإدارة' : 'Awaiting transfer confirmation'}
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                      {lang === 'ar' ? 'إجمالي المسحوبات المستلمة' : 'Settled Payouts'}
                    </span>
                    <div className="text-2xl font-black text-slate-800">${walletStats.totalPaidWithdrawals.toFixed(2)}</div>
                    <p className="text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                      {lang === 'ar' ? 'تم استلامها كاش أو شام كاش' : 'Received via Cham Cash / Cash'}
                    </p>
                  </div>
                </div>

                {/* Ledger Breakdown */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-gray-900">
                        {lang === 'ar' ? 'سجل العمليات المالية والمستحقات' : 'Financial Ledger & Order Credits'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {lang === 'ar'
                          ? 'تفاصيل كل عملية بيع ونسبة المنصة 10% وصافي المبلغ المضاف لمحفظتك'
                          : 'Breakdown of item sales, 10% fee deduction, and net credit.'}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsWithdrawModalOpen(true)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                    >
                      {lang === 'ar' ? 'طلب سحب رصيد' : 'Request Payout'}
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left rtl:text-right">
                      <thead className="text-[11px] uppercase bg-gray-50 text-gray-500 font-bold border-y border-gray-100">
                        <tr>
                          <th className="py-3 px-4">{lang === 'ar' ? 'رقم الطلب' : 'Order #'}</th>
                          <th className="py-3 px-4">{lang === 'ar' ? 'المنتج' : 'Product'}</th>
                          <th className="py-3 px-4">{lang === 'ar' ? 'المبلغ الإجمالي' : 'Gross'}</th>
                          <th className="py-3 px-4">{lang === 'ar' ? 'عمولة المنصة' : 'Fee (10%)'}</th>
                          <th className="py-3 px-4">{lang === 'ar' ? 'صافي التاجر' : 'Net Vendor'}</th>
                          <th className="py-3 px-4">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orders.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/50">
                            <td className="py-3 px-4 font-mono font-bold text-gray-800">{item.order_number}</td>
                            <td className="py-3 px-4 font-medium text-gray-900">{item.product_title}</td>
                            <td className="py-3 px-4 font-semibold text-gray-900">${item.total_price.toFixed(2)}</td>
                            <td className="py-3 px-4 text-rose-600 font-semibold">-${item.platform_fee.toFixed(2)}</td>
                            <td className="py-3 px-4 font-bold text-emerald-700 bg-emerald-50/40">
                              +${item.net_vendor_amount.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-gray-400">
                              {new Date(item.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SY' : 'en-US')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: WITHDRAWALS & SYRIAN PAYOUT METHODS */}
            {activeTab === 'withdrawals' && (
              <div className="space-y-8">
                {/* Top Section: Payout Methods */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <span>{lang === 'ar' ? 'وسائل استلام الحوالات في سوريا' : 'Saved Syrian Payout Methods'}</span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {lang === 'ar'
                          ? 'تدعم المنصة شام كاش (Cham Cash)، سيريتل كاش، شركة الهرم، والبنوك التجارية السورية.'
                          : 'Supports Cham Cash, Syriatel Cash, Al-Haram Hawala, and Syrian Commercial Banks.'}
                      </p>
                    </div>

                    <button
                      onClick={() => setIsMethodModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'إضافة وسيلة استلام' : 'Add Payout Method'}</span>
                    </button>
                  </div>

                  {payoutMethods.length === 0 ? (
                    <div className="p-8 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                      {lang === 'ar'
                        ? 'لم تقم بإضافة وسيلة استلام بعد. يرجى إضافة حساب شام كاش أو سيريتل كاش لتتمكن من سحب أرباحك.'
                        : 'No payout methods added yet. Please add Cham Cash or Bank details.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {payoutMethods.map((method) => (
                        <div
                          key={method.id}
                          className="p-4 rounded-xl border border-gray-200 bg-slate-50/60 relative space-y-2 hover:border-emerald-300 transition"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                                {method.method_name}
                              </span>
                              {method.is_default && (
                                <span className="mr-1.5 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                                  {lang === 'ar' ? 'الافتراضية' : 'Default'}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeletePayoutMethod(method.id)}
                              className="text-gray-400 hover:text-rose-600 transition cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-xs space-y-1">
                            <p className="font-mono font-bold text-gray-900 text-sm">{method.account_number}</p>
                            <p className="text-gray-600 font-medium">{method.account_holder_name}</p>
                            {method.phone_number && (
                              <p className="text-gray-400 text-[11px]">{method.phone_number}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Section: Withdrawal Requests History */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-gray-900">
                        {lang === 'ar' ? 'سجل طلبات السحب والحوالات' : 'Withdrawal Requests History'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {lang === 'ar'
                          ? 'متابعة حالة الحوالات المالية المنفذة يدوياً في سوريا وأرقام الإشعارات'
                          : 'Track manual offline payouts and remittance voucher numbers in Syria.'}
                      </p>
                    </div>

                    <button
                      onClick={() => setIsWithdrawModalOpen(true)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                    >
                      {lang === 'ar' ? 'طلب سحب جديد' : 'New Withdrawal'}
                    </button>
                  </div>

                  {withdrawals.length === 0 ? (
                    <div className="p-8 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                      {lang === 'ar' ? 'لا توجد طلبات سحب حتى الآن' : 'No withdrawals requested yet'}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left rtl:text-right">
                        <thead className="text-[11px] uppercase bg-gray-50 text-gray-500 font-bold border-y border-gray-100">
                          <tr>
                            <th className="py-3 px-4">{lang === 'ar' ? 'رقم الطلب' : 'Request ID'}</th>
                            <th className="py-3 px-4">{lang === 'ar' ? 'المبلغ المطلوب' : 'Amount'}</th>
                            <th className="py-3 px-4">{lang === 'ar' ? 'طريقة الاستلام' : 'Method'}</th>
                            <th className="py-3 px-4">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                            <th className="py-3 px-4">{lang === 'ar' ? 'رقم الإشعار / الحوالة' : 'Voucher / Ref'}</th>
                            <th className="py-3 px-4">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {withdrawals.map((w) => (
                            <tr key={w.id} className="hover:bg-gray-50/50">
                              <td className="py-3 px-4 font-mono font-bold text-gray-700">{w.id}</td>
                              <td className="py-3 px-4 font-black text-gray-900 text-sm">${w.amount.toFixed(2)} USD</td>
                              <td className="py-3 px-4 text-gray-600">
                                {w.payout_method?.method_name || 'Cham Cash'}
                              </td>
                              <td className="py-3 px-4">
                                {w.status === 'paid' ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>{lang === 'ar' ? 'تم التسليم كاش' : 'Paid'}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>{lang === 'ar' ? 'قيد التحويل في سوريا' : 'Pending Transfer'}</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 font-mono text-gray-700">
                                {w.transaction_ref ? (
                                  <span className="font-bold text-emerald-700">{w.transaction_ref}</span>
                                ) : (
                                  <span className="text-gray-400 italic">
                                    {lang === 'ar' ? 'بانتظار التحويل' : 'Awaiting voucher'}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-gray-400">
                                {new Date(w.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SY' : 'en-US')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ================= MODAL: ADD / EDIT PRODUCT ================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />
                <span>
                  {editingProductId
                    ? lang === 'ar' ? 'تعديل بيانات المنتج والموقع' : 'Edit Product & Location'
                    : lang === 'ar' ? 'إضافة منتج جديد للمتجر' : 'Add New Product to Store'}
                </span>
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'ar' ? 'اسم المنتج بالعربية *' : 'Arabic Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.title_ar}
                    onChange={(e) => setProductForm({ ...productForm, title_ar: e.target.value })}
                    placeholder="مثال: سلة تموينية متكاملة"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'ar' ? 'اسم المنتج بالإنجليزية *' : 'English Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.title_en}
                    onChange={(e) => setProductForm({ ...productForm, title_en: e.target.value })}
                    placeholder="e.g. Comprehensive Family Nutrition Box"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'ar' ? 'سعر البيع لمرة واحدة ($ USD) *' : 'One-Time Price ($ USD) *'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={productForm.price_usd}
                    onChange={(e) => setProductForm({ ...productForm, price_usd: e.target.value })}
                    placeholder="55.00"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:ring-1 focus:ring-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'ar' ? 'تصنيف السلعة' : 'Category'}
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="food">{lang === 'ar' ? 'سلال غذائية وتموينية' : 'Food & Nutrition'}</option>
                    <option value="health">{lang === 'ar' ? 'أدوية ورعاية صحية' : 'Health & Medicine'}</option>
                    <option value="energy">{lang === 'ar' ? 'طاقة شمسية ومحروقات' : 'Energy & Fuel'}</option>
                    <option value="winter">{lang === 'ar' ? 'مستلزمات شتوية وتدفئة' : 'Winter & Warmth'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'ar' ? 'وصف المنتج بالعربية' : 'Arabic Description'}
                </label>
                <textarea
                  rows={2}
                  value={productForm.description_ar}
                  onChange={(e) => setProductForm({ ...productForm, description_ar: e.target.value })}
                  placeholder="محتويات الباقة ومواصفات السلعة..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'ar' ? 'رابط صورة المنتج (Image URL)' : 'Image URL'}
                </label>
                <input
                  type="url"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* LOCATION PICKER & MAP COMPONENT */}
              <VendorLocationPicker
                latitude={productForm.latitude}
                longitude={productForm.longitude}
                locationName={productForm.location_name}
                onChange={({ latitude, longitude, locationName }) =>
                  setProductForm({ ...productForm, latitude, longitude, location_name: locationName })
                }
              />

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-60"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProductId ? (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (lang === 'ar' ? 'نشر المنتج الآن' : 'Publish Product')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD PAYOUT METHOD ================= */}
      {isMethodModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'ar' ? 'إضافة وسيلة استلام محلية' : 'Add Local Payout Method'}</span>
              </h3>
              <button
                onClick={() => setIsMethodModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPayoutMethod} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'ar' ? 'نوع المحفظة أو الشركة *' : 'Method Name *'}
                </label>
                <select
                  value={methodForm.method_name}
                  onChange={(e) => setMethodForm({ ...methodForm, method_name: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:ring-1 focus:ring-emerald-500 font-bold"
                >
                  <option value="Cham Cash (شام كاش)">Cham Cash (شام كاش - محفظة إلكترونية)</option>
                  <option value="Syriatel Cash (سيريتل كاش)">Syriatel Cash (سيريتل كاش)</option>
                  <option value="شركة الهرم للحوالات (Al-Haram)">شركة الهرم للحوالات (استلام كاش)</option>
                  <option value="بنك سورية الدولي الإسلامي (SIIB)">بنك سورية الدولي الإسلامي</option>
                  <option value="بنك بيمو السعودي الفرنسي (BBSF)">بنك بيمو السعودي الفرنسي</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'ar' ? 'رقم الحساب / رقم المحفظة / الموبايل *' : 'Account # / Wallet ID *'}
                </label>
                <input
                  type="text"
                  required
                  value={methodForm.account_number}
                  onChange={(e) => setMethodForm({ ...methodForm, account_number: e.target.value })}
                  placeholder="مثال: CHAM-9844-0129 أو +963 944 112 233"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'ar' ? 'اسم صاحب الحساب الثلاثي (حسب الهوية) *' : 'Account Holder Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={methodForm.account_holder_name}
                  onChange={(e) => setMethodForm({ ...methodForm, account_holder_name: e.target.value })}
                  placeholder="محمد رضوان الشامي"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'ar' ? 'ملاحظات إضافية أو فرع الاستلام' : 'Branch / Notes'}
                </label>
                <input
                  type="text"
                  value={methodForm.notes}
                  onChange={(e) => setMethodForm({ ...methodForm, notes: e.target.value })}
                  placeholder="مثال: فرع البرامكة دمشق"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsMethodModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-60"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{lang === 'ar' ? 'حفظ الوسيلة' : 'Save Method'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: REQUEST WITHDRAWAL ================= */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'ar' ? 'طلب سحب أرباح المتجر' : 'Request Earnings Withdrawal'}</span>
              </h3>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">
                {lang === 'ar' ? 'الرصيد المتاح للسحب الآن:' : 'Available Balance:'}
              </span>
              <span className="text-base font-black text-emerald-800">
                ${walletStats.availableBalance.toFixed(2)} USD
              </span>
            </div>

            <form onSubmit={handleRequestWithdrawal} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'ar' ? 'المبلغ المطلوب سحبه ($ USD) *' : 'Withdrawal Amount ($ USD) *'}
                </label>
                <input
                  type="number"
                  step="1"
                  max={walletStats.availableBalance}
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="مثال: 50"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:ring-1 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'ar' ? 'اختر وسيلة استلام الحوالة *' : 'Select Syrian Payout Method *'}
                </label>
                {payoutMethods.length === 0 ? (
                  <div className="text-xs text-rose-600 p-2 bg-rose-50 rounded-lg">
                    {lang === 'ar'
                      ? 'يرجى حفظ وسيلة استلام أولاً (شام كاش أو حساب بنكي) قبل طلب السحب.'
                      : 'Please add a payout method first.'}
                  </div>
                ) : (
                  <select
                    value={withdrawMethodId}
                    onChange={(e) => setWithdrawMethodId(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:ring-1 focus:ring-emerald-500 font-semibold"
                  >
                    {payoutMethods.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.method_name} - {m.account_number} ({m.account_holder_name})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <p className="text-[11px] text-gray-500 bg-slate-50 p-2.5 rounded-xl border border-gray-200">
                💡 {lang === 'ar'
                  ? 'يتم خصم المبلغ من رصيدك المتاح فوراً، وتقوم الإدارة بإرسال الحوالة يدوياً في سوريا وتزويدك برقم الإشعار خلال 24 ساعة.'
                  : 'The amount is immediately deducted from your available balance. The administrator will manually remit the funds in Syria.'}
              </p>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || payoutMethods.length === 0}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-60"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{lang === 'ar' ? 'تأكيد طلب السحب' : 'Confirm Withdrawal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
