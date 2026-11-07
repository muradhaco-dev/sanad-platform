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
  MapPin,
  Phone,
  CreditCard,
  X,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Send,
  Building2,
} from 'lucide-react';

export default function VendorDashboardPage() {
  const { t, lang } = useLanguage();

  // 3 Main Sections (Tabs) as required:
  // 1. 'products' -> Products Management (with Price, Description, Images, Map coordinates in Syria)
  // 2. 'orders' -> Orders Management (items purchased from this specific vendor)
  // 3. 'wallet' -> Wallet & Withdrawals (Cham Cash, Available Balance, Payout Methods & Requests)
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'wallet'>('products');

  // Auth & RBAC State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Vendor Information
  const [vendorId, setVendorId] = useState<string>('vendor-damascus-01');
  const [vendorName, setVendorName] = useState<string>('مستودعات الشام الغذائية (دمشق)');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Products Management State
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
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    latitude: 33.5138,
    longitude: 36.2765,
    location_name: 'دمشق، كفرسوسة والبرامكة',
  });

  // 2. Orders Management State
  const [orders, setOrders] = useState<VendorOrderItem[]>([]);
  const [orderUpdatingId, setOrderUpdatingId] = useState<string | null>(null);

  // 3. Wallet & Withdrawals (Cham Cash) State
  const [payoutMethods, setPayoutMethods] = useState<VendorPayoutMethod[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethodId, setWithdrawMethodId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Inline Cham Cash Quick-Add Form state
  const [chamCashForm, setChamCashForm] = useState({
    method_name: 'Cham Cash (شام كاش)',
    account_number: '',
    account_holder_name: '',
    phone_number: '',
    notes: '',
  });
  const [addingMethod, setAddingMethod] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // 1. Authenticate & Verify Role from Supabase database
  useEffect(() => {
    const checkAuthAndRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user ?? null;
        setCurrentUser(user);

        if (user) {
          // Strictly fetch user's actual role from Supabase 'profiles' table
          const { data: profile, error } = await supabase
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

  // 2. Fetch all Vendor Data directly with Supabase client (with API fallback)
  const fetchVendorData = async (activeVendorId: string) => {
    setLoading(true);
    try {
      // 1. Query Products from Supabase
      const { data: dbProducts, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', activeVendorId)
        .order('created_at', { ascending: false });

      if (!prodErr && dbProducts && dbProducts.length > 0) {
        setProducts(dbProducts as Product[]);
      } else {
        const res = await fetch(`/api/vendor/products?vendorId=${activeVendorId}`);
        const data = await res.json();
        if (data.success) setProducts(data.products);
      }

      // 2. Query Orders from Supabase
      const { data: dbOrders, error: orderErr } = await supabase
        .from('order_items')
        .select('*')
        .eq('vendor_id', activeVendorId)
        .order('created_at', { ascending: false });

      if (!orderErr && dbOrders && dbOrders.length > 0) {
        setOrders(dbOrders as VendorOrderItem[]);
      } else {
        const res = await fetch(`/api/vendor/orders?vendorId=${activeVendorId}`);
        const data = await res.json();
        if (data.success) setOrders(data.orders);
      }

      // 3. Query Payout Methods (Cham Cash, etc.) from Supabase
      const { data: dbMethods, error: methErr } = await supabase
        .from('vendor_payout_methods')
        .select('*')
        .eq('vendor_id', activeVendorId)
        .order('created_at', { ascending: false });

      if (!methErr && dbMethods && dbMethods.length > 0) {
        setPayoutMethods(dbMethods as VendorPayoutMethod[]);
        if (!withdrawMethodId) setWithdrawMethodId(dbMethods[0].id);
      } else {
        const res = await fetch(`/api/vendor/payout-methods?vendorId=${activeVendorId}`);
        const data = await res.json();
        if (data.success) {
          setPayoutMethods(data.methods);
          if (data.methods.length > 0 && !withdrawMethodId) {
            setWithdrawMethodId(data.methods[0].id);
          }
        }
      }

      // 4. Query Withdrawals from Supabase
      const { data: dbWithdrawals, error: withErr } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('vendor_id', activeVendorId)
        .order('created_at', { ascending: false });

      if (!withErr && dbWithdrawals && dbWithdrawals.length > 0) {
        setWithdrawals(dbWithdrawals as WithdrawalRequest[]);
      } else {
        const res = await fetch(`/api/vendor/withdrawals?vendorId=${activeVendorId}`);
        const data = await res.json();
        if (data.success) {
          setWithdrawals(data.withdrawals);
        }
      }
    } catch (err) {
      console.error('Error querying Supabase vendor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authChecked && (userRole === 'vendor' || userRole === 'admin')) {
      fetchVendorData(vendorId);
    } else if (authChecked) {
      setLoading(false);
    }
  }, [authChecked, userRole, vendorId]);

  // Financial Balance Calculations
  const totalGrossSales = orders.reduce((sum, o) => sum + Number(o.total_price || 0), 0);
  const totalPlatformFees = orders.reduce((sum, o) => sum + Number(o.platform_fee || 0), 0);
  const totalNetEarnings = totalGrossSales - totalPlatformFees;

  const totalPaidWithdrawals = withdrawals
    .filter((w) => w.status === 'paid')
    .reduce((sum, w) => sum + Number(w.amount || 0), 0);

  const totalPendingWithdrawals = withdrawals
    .filter((w) => w.status === 'pending')
    .reduce((sum, w) => sum + Number(w.amount || 0), 0);

  // Available Balance = Net Earnings - Paid Withdrawals - Pending Withdrawals
  const availableBalance = Math.max(0, totalNetEarnings - totalPaidWithdrawals - totalPendingWithdrawals);

  // ================= PRODUCTS MANAGEMENT ACTIONS =================
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
      alert(lang === 'ar' ? 'يرجى إدخال اسم المنتج باللغتين وسعر البيع' : 'Title and Price are required');
      return;
    }

    setActionLoading(true);
    try {
      const priceNum = parseFloat(productForm.price_usd);

      if (editingProductId) {
        // Update in Supabase
        const { error } = await supabase
          .from('products')
          .update({
            title_en: productForm.title_en,
            title_ar: productForm.title_ar,
            description_en: productForm.description_en,
            description_ar: productForm.description_ar,
            price_usd: priceNum,
            category: productForm.category,
            image_url: productForm.image_url,
            latitude: productForm.latitude,
            longitude: productForm.longitude,
            location_name: productForm.location_name,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingProductId);

        if (error) {
          // Fallback to API route
          await fetch('/api/vendor/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingProductId, ...productForm, price_usd: priceNum }),
          });
        }
        showToast(lang === 'ar' ? 'تم تحديث بيانات المنتج بنجاح!' : 'Product updated successfully!');
      } else {
        // Insert into Supabase
        const slug =
          productForm.title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

        const { error } = await supabase.from('products').insert({
          vendor_id: vendorId,
          slug,
          title_en: productForm.title_en,
          title_ar: productForm.title_ar,
          description_en: productForm.description_en,
          description_ar: productForm.description_ar,
          price_usd: priceNum,
          category: productForm.category,
          image_url: productForm.image_url,
          latitude: productForm.latitude,
          longitude: productForm.longitude,
          location_name: productForm.location_name,
          stock_status: 'in_stock',
          is_active: true,
        });

        if (error) {
          // Fallback to API route
          await fetch('/api/vendor/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...productForm,
              price_usd: priceNum,
              vendor_id: vendorId,
              vendor_name: vendorName,
            }),
          });
        }
        showToast(lang === 'ar' ? 'تمت إضافة المنتج ونشره في المتجر فوراً!' : 'Product added and published!');
      }

      setIsProductModalOpen(false);
      fetchVendorData(vendorId);
    } catch (err: any) {
      alert(err.message || 'Error saving product');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) {
        await fetch(`/api/vendor/products?id=${productId}`, { method: 'DELETE' });
      }
      showToast(lang === 'ar' ? 'تم حذف المنتج من المتجر' : 'Product deleted successfully');
      fetchVendorData(vendorId);
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  // ================= ORDERS MANAGEMENT ACTIONS =================
  const handleUpdateOrderStatus = async (itemId: string, newStatus: 'paid' | 'processing' | 'shipped' | 'delivered') => {
    setOrderUpdatingId(itemId);
    try {
      const { error } = await supabase
        .from('order_items')
        .update({ status: newStatus })
        .eq('id', itemId);

      if (error) {
        await fetch('/api/vendor/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, status: newStatus }),
        });
      }

      showToast(lang === 'ar' ? `تم تحديث حالة الطلب إلى: ${newStatus}` : `Order status updated to: ${newStatus}`);
      fetchVendorData(vendorId);
    } catch (err) {
      alert('Error updating order');
    } finally {
      setOrderUpdatingId(null);
    }
  };

  // ================= WALLET & WITHDRAWALS ACTIONS (CHAM CASH) =================
  const handleSaveChamCashMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chamCashForm.account_number || !chamCashForm.account_holder_name) {
      alert(lang === 'ar' ? 'يرجى إدخال رقم حساب شام كاش واسم المستفيد' : 'Please provide account number and beneficiary name');
      return;
    }

    setAddingMethod(true);
    try {
      const { error } = await supabase.from('vendor_payout_methods').insert({
        vendor_id: vendorId,
        method_name: chamCashForm.method_name,
        account_number: chamCashForm.account_number.trim(),
        account_holder_name: chamCashForm.account_holder_name.trim(),
        phone_number: chamCashForm.phone_number.trim(),
        notes: chamCashForm.notes.trim(),
        is_default: payoutMethods.length === 0,
      });

      if (error) {
        await fetch('/api/vendor/payout-methods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vendor_id: vendorId,
            ...chamCashForm,
            is_default: payoutMethods.length === 0,
          }),
        });
      }

      showToast(lang === 'ar' ? 'تم حفظ وسيلة استلام شام كاش بنجاح!' : 'Cham Cash payout method saved successfully!');
      setChamCashForm({
        method_name: 'Cham Cash (شام كاش)',
        account_number: '',
        account_holder_name: '',
        phone_number: '',
        notes: '',
      });
      fetchVendorData(vendorId);
    } catch (err) {
      alert('Failed to save payout method');
    } finally {
      setAddingMethod(false);
    }
  };

  const handleDeletePayoutMethod = async (methodId: string) => {
    if (!confirm(lang === 'ar' ? 'حذف وسيلة الدفع؟' : 'Delete payout method?')) return;
    try {
      const { error } = await supabase.from('vendor_payout_methods').delete().eq('id', methodId);
      if (error) {
        await fetch(`/api/vendor/payout-methods?id=${methodId}`, { method: 'DELETE' });
      }
      showToast(lang === 'ar' ? 'تم حذف وسيلة الاستلام' : 'Payout method deleted');
      fetchVendorData(vendorId);
    } catch (err) {
      alert('Failed to delete payout method');
    }
  };

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (!amountNum || amountNum <= 0) {
      alert(lang === 'ar' ? 'يرجى إدخال مبلغ صحيح' : 'Please enter a valid amount');
      return;
    }
    if (amountNum > availableBalance) {
      alert(
        lang === 'ar'
          ? `المبلغ المطلوب ($${amountNum}) أكبر من الرصيد المتاح للسحب ($${availableBalance.toFixed(2)})`
          : `Amount exceeds available balance ($${availableBalance.toFixed(2)})`
      );
      return;
    }
    if (!withdrawMethodId) {
      alert(lang === 'ar' ? 'يرجى اختيار وسيلة استلام الحوالة' : 'Please select a payout method');
      return;
    }

    setActionLoading(true);
    try {
      const selectedMethod = payoutMethods.find((m) => m.id === withdrawMethodId);

      const { error } = await supabase.from('withdrawals').insert({
        vendor_id: vendorId,
        amount: amountNum,
        status: 'pending',
        payout_method_id: withdrawMethodId,
        admin_notes: 'طلب سحب قيد التحويل في سوريا',
      });

      if (error) {
        await fetch('/api/vendor/withdrawals', {
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
      }

      showToast(
        lang === 'ar'
          ? 'تم تقديم طلب السحب بنجاح! سيتم تحويل المبلغ عبر شام كاش / كاش في سوريا'
          : 'Withdrawal requested! Payout will be remitted via Cham Cash offline.'
      );
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      fetchVendorData(vendorId);
    } catch (err) {
      alert('Failed to request withdrawal');
    } finally {
      setActionLoading(false);
    }
  };

  // Strictly protect route for Vendor / Admin roles only
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
              ? 'هذه اللوحة مخصصة فقط للتجار المعتمدين لإدارة المنتجات، موقع المستودع في سوريا، تتبع الطلبات، وسحب رصيد شام كاش.'
              : 'This dashboard is strictly reserved for verified vendors to manage products, Syrian dispatch coordinates, orders, and Cham Cash withdrawals.'}
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              href="/auth/signup"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition"
            >
              {lang === 'ar' ? 'سجل الآن كتاجر (تفعيل فوري)' : 'Sign Up as Vendor (Instant Activation)'}
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

      {/* Header Banner */}
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
                  {lang === 'ar' ? 'تاجر معتمد • نشط' : 'Verified Vendor'}
                </span>
              </div>
              <p className="text-xs text-amber-200/80 mt-1 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {lang === 'ar'
                    ? 'إدارة المنتجات، إحداثيات المستودع، الطلبات الواردة، ومحفظة شام كاش'
                    : 'Manage catalog, Syria dispatch coordinates, orders, and Cham Cash payouts'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenAddProduct}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{lang === 'ar' ? 'إضافة منتج جديد' : 'Add Product'}</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('wallet');
                setIsWithdrawModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition cursor-pointer"
            >
              <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'ar' ? 'سحب رصيد (شام كاش)' : 'Request Withdrawal'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Main Sections Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 py-2.5">
          {/* Tab 1: Products Management */}
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'products'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{lang === 'ar' ? '1. إدارة المنتجات والموقع الجغرافي' : '1. Products Management'}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'products' ? 'bg-amber-700 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {products.length}
            </span>
          </button>

          {/* Tab 2: Orders Management */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{lang === 'ar' ? '2. إدارة الطلبات الواردة' : '2. Orders Management'}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'orders' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {orders.length}
            </span>
          </button>

          {/* Tab 3: Wallet & Withdrawals (Cham Cash) */}
          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'wallet'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>{lang === 'ar' ? '3. المحفظة وسحب الرصيد (شام كاش)' : '3. Wallet & Withdrawals (Cham Cash)'}</span>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-500 text-white rounded-full font-black">
              ${availableBalance.toFixed(0)}
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
              {lang === 'ar' ? 'جاري استعلام البيانات من قاعدة بيانات Supabase...' : 'Querying Supabase database...'}
            </p>
          </div>
        ) : (
          <>
            {/* ================= TAB 1: PRODUCTS MANAGEMENT ================= */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                  <div>
                    <h2 className="text-base font-black text-gray-900">
                      {lang === 'ar' ? 'منتجات المتجر وإحداثيات المستودع في سوريا' : 'Your Store Products & Location'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {lang === 'ar'
                        ? 'أضف منتجاتك وحدد إحداثيات وموقع المستودع الميداني ليتمكن العملاء من الشراء فوراً'
                        : 'Manage your listings, prices, descriptions, and Syrian dispatch GPS coordinates.'}
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddProduct}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}</span>
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center space-y-3">
                    <Package className="w-12 h-12 text-gray-300 mx-auto" />
                    <h3 className="text-sm font-bold text-gray-700">
                      {lang === 'ar' ? 'لا توجد منتجات مسجلة في حسابك بعد' : 'No products found'}
                    </h3>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      {lang === 'ar'
                        ? 'ابدأ بإضافة أول منتج وتحديد موقع مستودعك لتلقي طلبات الشراء المدفوعة من المغتربين.'
                        : 'Add your first product with coordinates to start receiving paid orders.'}
                    </p>
                    <button
                      onClick={handleOpenAddProduct}
                      className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer"
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

                            {/* Location & GPS Badge */}
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] text-gray-700 font-medium">
                              <span className="flex items-center gap-1 text-slate-800 truncate">
                                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span className="truncate">{prod.location_name || 'دمشق'}</span>
                              </span>
                              {prod.latitude && (
                                <span className="text-[10px] text-slate-500 font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                  GPS: {prod.latitude.toFixed(2)}, {prod.longitude?.toFixed(2)}
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
                            <span>{lang === 'ar' ? 'معاينة في المتجر' : 'Store View'}</span>
                          </Link>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-amber-50 hover:text-amber-800 transition cursor-pointer"
                              title="تعديل المنتج والموقع"
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

            {/* ================= TAB 2: ORDERS MANAGEMENT ================= */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-black text-gray-900">
                      {lang === 'ar' ? 'السلع المشتراة والمدفوعة من هذا المتجر' : 'Items Purchased from Your Store'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {lang === 'ar'
                        ? 'هذا الجدول يعرض الطلبات المدفوعة عبر Lemon Squeezy مع أرباحك الصافية بعد حسم عمولة المنصة 10%'
                        : 'Real-time table of customer purchases attributed to your vendor account.'}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'ar' ? 'الدفع مؤكد 100% ومودع بالمحفظة' : '100% Verified Payment'}</span>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center space-y-3">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
                    <h3 className="text-sm font-bold text-gray-700">
                      {lang === 'ar' ? 'لا توجد طلبات واردة حتى الآن' : 'No incoming orders yet'}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {lang === 'ar'
                        ? 'ستظهر هنا البنود فور قيام أي عميل بإتمام الدفع لأحد منتجاتك المعروضة.'
                        : 'Purchased items will appear here immediately after payment.'}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left rtl:text-right">
                        <thead className="text-[11px] uppercase bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                          <tr>
                            <th className="py-3.5 px-4">{lang === 'ar' ? 'رقم الطلب' : 'Order #'}</th>
                            <th className="py-3.5 px-4">{lang === 'ar' ? 'المنتج والكمية' : 'Product & Qty'}</th>
                            <th className="py-3.5 px-4">{lang === 'ar' ? 'بيانات المستلم والتوصيل' : 'Customer & Delivery'}</th>
                            <th className="py-3.5 px-4">{lang === 'ar' ? 'الإجمالي والعمولة' : 'Pricing & Fee'}</th>
                            <th className="py-3.5 px-4">{lang === 'ar' ? 'صافي أرباحك' : 'Net Earning'}</th>
                            <th className="py-3.5 px-4">{lang === 'ar' ? 'حالة التجهيز' : 'Status'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {orders.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50">
                              <td className="py-3.5 px-4">
                                <span className="font-mono font-bold text-gray-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                  {item.order_number}
                                </span>
                                <div className="text-[10px] text-gray-400 mt-1">
                                  {new Date(item.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SY' : 'en-US')}
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-bold text-gray-900">{item.product_title}</div>
                                <div className="text-gray-500 text-[11px]">
                                  {lang === 'ar' ? 'الكمية:' : 'Qty:'} {item.quantity} × ${item.unit_price} USD
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-bold text-gray-900">{item.customer_name}</div>
                                {item.customer_phone && (
                                  <div className="text-gray-500 flex items-center gap-1 font-mono text-[11px]">
                                    <Phone className="w-3 h-3 text-emerald-600" />
                                    <span dir="ltr">{item.customer_phone}</span>
                                  </div>
                                )}
                                <div className="text-gray-400 text-[11px] truncate max-w-[200px]">
                                  {item.delivery_address || 'دمشق'}
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-gray-900">${item.total_price.toFixed(2)} USD</div>
                                <div className="text-rose-600 text-[10px]">
                                  {lang === 'ar' ? 'عمولة المنصة:' : 'Fee (10%):'} -${item.platform_fee.toFixed(2)}
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs">
                                  +${item.net_vendor_amount.toFixed(2)} USD
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <select
                                  value={item.status}
                                  disabled={orderUpdatingId === item.id}
                                  onChange={(e) =>
                                    handleUpdateOrderStatus(
                                      item.id,
                                      e.target.value as 'paid' | 'processing' | 'shipped' | 'delivered'
                                    )
                                  }
                                  className="text-xs font-bold border border-gray-300 rounded-lg px-2 py-1 bg-white text-gray-800 focus:ring-1 focus:ring-amber-500 cursor-pointer"
                                >
                                  <option value="paid">{lang === 'ar' ? 'مدفوع - جديد' : 'Paid - New'}</option>
                                  <option value="processing">{lang === 'ar' ? 'قيد التجهيز والتغليف' : 'Processing'}</option>
                                  <option value="shipped">{lang === 'ar' ? 'تم التسليم للشحن' : 'Shipped'}</option>
                                  <option value="delivered">{lang === 'ar' ? 'تم التسليم للعميل' : 'Delivered'}</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 3: WALLET & WITHDRAWALS (CHAM CASH) ================= */}
            {activeTab === 'wallet' && (
              <div className="space-y-8">
                {/* Available Balance & Financial Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-6 rounded-2xl shadow-md space-y-2 sm:col-span-2 lg:col-span-1">
                    <span className="text-emerald-100 text-xs font-bold uppercase tracking-wider">
                      {lang === 'ar' ? 'الرصيد المتاح للسحب الفوري' : 'Available Balance'}
                    </span>
                    <div className="text-3xl font-black">
                      ${availableBalance.toFixed(2)} <span className="text-xs font-normal">USD</span>
                    </div>
                    <div className="pt-2 border-t border-emerald-500/50 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-200">
                        {lang === 'ar' ? 'جاهز للتحويل عبر شام كاش' : 'Ready for Cham Cash'}
                      </span>
                      <button
                        onClick={() => setIsWithdrawModalOpen(true)}
                        className="px-3 py-1 bg-white text-emerald-800 rounded-lg text-xs font-black shadow-xs hover:bg-emerald-50 cursor-pointer"
                      >
                        {lang === 'ar' ? 'طلب سحب' : 'Withdraw'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                      {lang === 'ar' ? 'إجمالي المبيعات' : 'Total Gross Sales'}
                    </span>
                    <div className="text-2xl font-black text-gray-900">${totalGrossSales.toFixed(2)}</div>
                    <p className="text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                      {lang === 'ar' ? 'قيمة مبيعاتك الإجمالية المدفوعة' : 'Gross customer payments'}
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                      {lang === 'ar' ? 'طلبات سحب قيد الانتظار' : 'Pending Withdrawals'}
                    </span>
                    <div className="text-2xl font-black text-amber-700">${totalPendingWithdrawals.toFixed(2)}</div>
                    <p className="text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                      {lang === 'ar' ? 'بانتظار إشعار الحوالة من الإدارة' : 'Pending transfer voucher'}
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                      {lang === 'ar' ? 'إجمالي المبالغ المستلمة' : 'Settled Payouts'}
                    </span>
                    <div className="text-2xl font-black text-slate-800">${totalPaidWithdrawals.toFixed(2)}</div>
                    <p className="text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                      {lang === 'ar' ? 'تم استلامها كاش أو شام كاش' : 'Received in Syria'}
                    </p>
                  </div>
                </div>

                {/* Syrian Local Payment Method (Cham Cash Form) */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-emerald-600" />
                        <span>{lang === 'ar' ? 'حسابات استلام الحوالات (شام كاش / سيريتل كاش / بنوك)' : 'Syrian Payout Methods (Cham Cash)'}</span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {lang === 'ar'
                          ? 'أدخل رقم محفظة شام كاش الخاصة بك في سوريا لتستلم أرباح مبيعاتك عليها مباشرة'
                          : 'Save your Cham Cash wallet ID or Syrian bank details to receive offline payouts.'}
                      </p>
                    </div>

                    <button
                      onClick={() => setIsWithdrawModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      <ArrowDownToLine className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'طلب سحب رصيد' : 'Request Withdrawal'}</span>
                    </button>
                  </div>

                  {/* Inline Form to Add / Save Cham Cash Details */}
                  <form onSubmit={handleSaveChamCashMethod} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="text-xs font-bold text-gray-800 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-600" />
                      <span>{lang === 'ar' ? 'إضافة وسيلة استلام جديدة (شام كاش / سيريتل كاش / بنك سوري)' : 'Add New Payout Method'}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          {lang === 'ar' ? 'نوع الوسيلة *' : 'Method Type *'}
                        </label>
                        <select
                          value={chamCashForm.method_name}
                          onChange={(e) => setChamCashForm({ ...chamCashForm, method_name: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold text-gray-800 focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="Cham Cash (شام كاش)">Cham Cash (شام كاش - محفظة إلكترونية)</option>
                          <option value="Syriatel Cash (سيريتل كاش)">Syriatel Cash (سيريتل كاش)</option>
                          <option value="شركة الهرم للحوالات (Al-Haram)">شركة الهرم للحوالات (استلام كاش)</option>
                          <option value="بنك سورية الدولي الإسلامي (SIIB)">بنك سورية الدولي الإسلامي</option>
                          <option value="بنك بيمو السعودي الفرنسي (BBSF)">بنك بيمو السعودي الفرنسي</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          {lang === 'ar' ? 'رقم حساب شام كاش / الموبايل *' : 'Cham Cash Number / Mobile *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={chamCashForm.account_number}
                          onChange={(e) => setChamCashForm({ ...chamCashForm, account_number: e.target.value })}
                          placeholder="مثال: CHAM-9844-0129 أو 0944112233"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 bg-white font-mono font-bold text-gray-900 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          {lang === 'ar' ? 'اسم صاحب الحساب الثلاثي *' : 'Beneficiary Full Name *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={chamCashForm.account_holder_name}
                          onChange={(e) => setChamCashForm({ ...chamCashForm, account_holder_name: e.target.value })}
                          placeholder="محمد رضوان الشامي"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <input
                        type="text"
                        value={chamCashForm.notes}
                        onChange={(e) => setChamCashForm({ ...chamCashForm, notes: e.target.value })}
                        placeholder={lang === 'ar' ? 'ملاحظات إضافية (اختياري، مثلاً: فرع البرامكة دمشق)' : 'Optional notes (branch, city)'}
                        className="w-full sm:w-2/3 text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700"
                      />

                      <button
                        type="submit"
                        disabled={addingMethod}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-60"
                      >
                        {addingMethod ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>{lang === 'ar' ? 'حفظ وسيلة الاستلام' : 'Save Method'}</span>
                      </button>
                    </div>
                  </form>

                  {/* List of Saved Syrian Payout Methods */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-gray-700 block">
                      {lang === 'ar' ? 'وسائل الاستلام المحفوظة في حسابك:' : 'Saved Payout Methods:'}
                    </span>

                    {payoutMethods.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">
                        {lang === 'ar' ? 'لم تقم بحفظ أي حساب شام كاش بعد.' : 'No saved methods yet.'}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {payoutMethods.map((m) => (
                          <div
                            key={m.id}
                            className="p-3.5 rounded-xl border border-gray-200 bg-white relative space-y-1.5 shadow-2xs hover:border-emerald-300 transition"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                {m.method_name}
                              </span>
                              <button
                                onClick={() => handleDeletePayoutMethod(m.id)}
                                className="text-gray-400 hover:text-rose-600 transition cursor-pointer"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="font-mono font-bold text-gray-900 text-xs">{m.account_number}</p>
                            <p className="text-gray-600 text-[11px]">{m.account_holder_name}</p>
                            {m.notes && <p className="text-gray-400 text-[10px]">{m.notes}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Withdrawal Requests History Table */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-gray-900">
                        {lang === 'ar' ? 'سجل طلبات السحب والحوالات المرسلة للإدارة' : 'Withdrawals History'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {lang === 'ar'
                          ? 'متابعة حالة الحوالات المالية التي تم تحويلها يدوياً في سوريا وأرقام إشعارات شام كاش'
                          : 'Track payout requests, Cham Cash voucher codes, and offline fulfillment status.'}
                      </p>
                    </div>

                    <button
                      onClick={() => setIsWithdrawModalOpen(true)}
                      className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                    >
                      {lang === 'ar' ? 'طلب سحب جديد' : 'New Payout Request'}
                    </button>
                  </div>

                  {withdrawals.length === 0 ? (
                    <div className="p-8 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                      {lang === 'ar' ? 'لا توجد طلبات سحب سابقة' : 'No withdrawal requests yet'}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left rtl:text-right">
                        <thead className="text-[11px] uppercase bg-gray-50 text-gray-500 font-bold border-y border-gray-100">
                          <tr>
                            <th className="py-3 px-4">{lang === 'ar' ? 'رقم الطلب' : 'Request ID'}</th>
                            <th className="py-3 px-4">{lang === 'ar' ? 'المبلغ المطلوب' : 'Amount'}</th>
                            <th className="py-3 px-4">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                            <th className="py-3 px-4">{lang === 'ar' ? 'إشعار الحوالة (في سوريا)' : 'Voucher Ref'}</th>
                            <th className="py-3 px-4">{lang === 'ar' ? 'تاريخ الطلب' : 'Date'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {withdrawals.map((w) => (
                            <tr key={w.id} className="hover:bg-gray-50/50">
                              <td className="py-3 px-4 font-mono font-bold text-gray-700">{w.id}</td>
                              <td className="py-3 px-4 font-black text-gray-900 text-sm">${Number(w.amount).toFixed(2)} USD</td>
                              <td className="py-3 px-4">
                                {w.status === 'paid' ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>{lang === 'ar' ? 'تم التسليم كاش' : 'Paid & Settled'}</span>
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
                                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    {w.transaction_ref}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 italic">
                                    {lang === 'ar' ? 'بانتظار إشعار الإدارة' : 'Awaiting voucher'}
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
                    {lang === 'ar' ? 'سعر البيع لمرة واحدة ($ USD) *' : 'Price ($ USD) *'}
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

              {/* LOCATION PICKER & MAP COMPONENT (GPS COORDINATES IN SYRIA) */}
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
                  <span>
                    {editingProductId
                      ? lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes'
                      : lang === 'ar' ? 'نشر المنتج الآن' : 'Publish Product'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: REQUEST WITHDRAWAL (CHAM CASH) ================= */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'ar' ? 'طلب سحب أرباح المتجر (شام كاش)' : 'Request Cham Cash Withdrawal'}</span>
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
                ${availableBalance.toFixed(2)} USD
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
                  max={availableBalance}
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="مثال: 50"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:ring-1 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'ar' ? 'اختر حساب شام كاش للاستلام *' : 'Select Cham Cash Account *'}
                </label>
                {payoutMethods.length === 0 ? (
                  <div className="text-xs text-rose-600 p-2 bg-rose-50 rounded-lg">
                    {lang === 'ar'
                      ? 'يرجى حفظ حساب شام كاش أولاً من قسم المحفظة لتتمكن من تقديم طلب السحب.'
                      : 'Please save a Cham Cash account first.'}
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
                  ? 'يتم خصم المبلغ من رصيدك المتاح فوراً، وتقوم الإدارة بتحويل المبلغ عبر شام كاش / كاش في سوريا وتزويدك برقم الإشعار.'
                  : 'Amount is deducted from your balance immediately. Admin manually transfers funds in Syria and records the voucher.'}
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
