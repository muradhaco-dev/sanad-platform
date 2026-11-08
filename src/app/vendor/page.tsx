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
  Copy,
  Check,
  FileText,
  AlertCircle,
  Eye,
} from 'lucide-react';

export default function VendorDashboardPage() {
  const { t, lang } = useLanguage();

  // 3 Main Sections (Tabs):
  // 1. 'products' -> Products Management (with Price, Description, Images, Map coordinates in Syria)
  // 2. 'orders' -> Direct Expat Remittances & Orders (Receipt Numbers, Beneficiary delivery details, verification)
  // 3. 'wallet' -> Local Remittance Accounts (Cham Cash, Syriatel, Al-Haram details where expats send money)
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'wallet'>('products');

  // Auth & RBAC State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Vendor Information
  const [vendorId, setVendorId] = useState<string>('');
  const [vendorName, setVendorName] = useState<string>('');
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

  // 2. Orders Management State (Syrian Local Remittance Verifications)
  const [orders, setOrders] = useState<VendorOrderItem[]>([]);
  const [orderUpdatingId, setOrderUpdatingId] = useState<string | null>(null);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending_verification' | 'completed'>('all');
  const [copiedReceiptId, setCopiedReceiptId] = useState<string | null>(null);
  const [selectedReceiptImage, setSelectedReceiptImage] = useState<string | null>(null);

  const handleCopyReceipt = (text: string, id: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedReceiptId(id);
      setTimeout(() => setCopiedReceiptId(null), 2500);
    }
  };

  const getMethodBadge = (method?: string) => {
    switch (method) {
      case 'al_haram':
      case 'الهرم للحوالات':
        return { label: lang === 'ar' ? 'الهرم للحوالات' : 'Al-Haram', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'al_fouad':
      case 'الفؤاد':
        return { label: lang === 'ar' ? 'شركة الفؤاد' : 'Al-Fouad', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'syriatel_cash':
      case 'سيريتل كاش':
        return { label: lang === 'ar' ? 'سيريتل كاش' : 'Syriatel Cash', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'cham_cash':
      case 'شام كاش':
      default:
        return { label: lang === 'ar' ? 'شام كاش' : 'Cham Cash', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
  };

  // 3. Local Payout Methods (Cham Cash, Syriatel, Al-Haram)
  const [payoutMethods, setPayoutMethods] = useState<VendorPayoutMethod[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Inline Quick-Add Form state for Local Remittance Details
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
            } else if (user.email) {
              setVendorName(user.email.split('@')[0]);
            } else {
              setVendorName(lang === 'ar' ? 'متجر البائع' : 'Vendor Store');
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
  }, [lang]);

  // 2. Fetch all Vendor Data directly from Supabase (Strictly NO fake or mock data)
  const fetchVendorData = async (activeVendorId: string) => {
    setLoading(true);
    try {
      // 1. Query Products from Supabase directly (strictly for this vendor)
      const { data: dbProducts } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', activeVendorId)
        .order('created_at', { ascending: false });

      setProducts((dbProducts as any) || []);

      // 2. Query Purchased Order Items from Supabase directly
      const { data: dbOrders } = await supabase
        .from('order_items')
        .select('*')
        .or(`vendor_id.eq.${activeVendorId},vendor_id.is.null`)
        .order('created_at', { ascending: false });

      setOrders((dbOrders as any) || []);

      // 3. Query Syrian Remittance Receiving Accounts
      const { data: dbMethods } = await supabase
        .from('vendor_payout_methods')
        .select('*')
        .eq('vendor_id', activeVendorId)
        .order('is_default', { ascending: false });

      setPayoutMethods((dbMethods as any) || []);
    } catch (err) {
      console.error('Error loading vendor data from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authChecked && (userRole === 'vendor' || userRole === 'admin') && vendorId) {
      fetchVendorData(vendorId);
    } else if (authChecked) {
      setLoading(false);
    }
  }, [authChecked, userRole, vendorId]);

  // Financial Calculations for Direct Remittances
  const totalGrossSales = orders.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
  const totalNetEarnings = orders.reduce(
    (sum, item) => sum + (Number(item.net_vendor_amount) || 0),
    0
  );
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending_verification').length;
  const completedOrdersCount = orders.filter((o) => o.status === 'completed' || o.status === 'paid' || o.status === 'delivered').length;

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
      category: (prod.category as any) || 'food',
      image_url: prod.image_url,
      latitude: prod.latitude || 33.5138,
      longitude: prod.longitude || 36.2765,
      location_name: prod.location_name || 'دمشق',
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title_ar || !productForm.price_usd) {
      alert(lang === 'ar' ? 'يرجى إدخال اسم المنتج والسعر' : 'Please provide product title and price');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        vendor_id: vendorId,
        title_en: productForm.title_en || productForm.title_ar,
        title_ar: productForm.title_ar,
        description_en: productForm.description_en || productForm.description_ar,
        description_ar: productForm.description_ar,
        price_usd: parseFloat(productForm.price_usd),
        category: productForm.category,
        image_url: productForm.image_url,
        latitude: productForm.latitude,
        longitude: productForm.longitude,
        location_name: productForm.location_name,
        stock_status: 'in_stock',
        is_active: true,
      };

      if (editingProductId) {
        // Update product in Supabase
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProductId);

        if (error) {
          // Fallback to API route
          await fetch('/api/vendor/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingProductId, ...payload }),
          });
        }
        showToast(lang === 'ar' ? 'تم تحديث بيانات المنتج وموقعه بنجاح!' : 'Product updated successfully!');
      } else {
        // Insert new product into Supabase
        const slug = `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const { error } = await supabase.from('products').insert({
          slug,
          ...payload,
        });

        if (error) {
          // Fallback to API route
          await fetch('/api/vendor/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
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
  const handleUpdateOrderStatus = async (
    itemId: string,
    newStatus: 'pending_verification' | 'completed' | 'paid' | 'processing' | 'shipped' | 'delivered'
  ) => {
    setOrderUpdatingId(itemId);
    try {
      const { error } = await supabase
        .from('order_items')
        .update({ status: newStatus })
        .eq('id', itemId);

      const targetItem = orders.find((o) => o.id === itemId);
      if (targetItem?.order_number) {
        await supabase
          .from('orders')
          .update({ payment_status: newStatus })
          .eq('order_number', targetItem.order_number);
      }

      if (error) {
        await fetch('/api/vendor/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, status: newStatus }),
        });
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === itemId ? { ...o, status: newStatus as any } : o))
      );

      const statusAr =
        newStatus === 'completed'
          ? 'تم تأكيد استلام الحوالة وإكمال الطلب بنجاح!'
          : newStatus === 'pending_verification'
          ? 'قيد التحقق من إشعار الحوالة'
          : `تم تغيير الحالة إلى: ${newStatus}`;

      showToast(lang === 'ar' ? statusAr : `Order status updated to: ${newStatus}`);
    } catch (err) {
      console.warn('Error updating order:', err);
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

  // Strictly protect route for Vendor / Admin roles only
  if (authChecked && userRole !== 'vendor' && userRole !== 'admin') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-slate-50 w-full">
        <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 text-center shadow-lg space-y-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Store className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-gray-900">
            {lang === 'ar' ? 'بوابة التجار والمزودين المعتمدين' : 'Authorized Vendors Only'}
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            {lang === 'ar'
              ? 'هذه اللوحة مخصصة فقط للتجار المعتمدين لإدارة المنتجات، موقع المستودع في سوريا، تتبع الطلبات، وسحب رصيد شام كاش.'
              : 'This dashboard is strictly reserved for verified vendors to manage products, Syrian dispatch coordinates, orders, and Cham Cash withdrawals.'}
          </p>
          <div className="pt-2 sm:pt-4 flex flex-col gap-2">
            <Link
              href="/auth/signup"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition text-center"
            >
              {lang === 'ar' ? 'سجل الآن كتاجر (تفعيل فوري)' : 'Sign Up as Vendor (Instant Activation)'}
            </Link>
            <Link
              href="/auth/login"
              className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs transition text-center"
            >
              {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 w-full overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="sticky top-16 z-50 bg-emerald-700 text-white py-2.5 px-4 shadow-lg text-center text-xs font-bold flex items-center justify-center gap-2 animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white py-6 sm:py-8 px-4 sm:px-6 lg:px-8 border-b border-amber-700/60 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
              <Store className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight truncate">{vendorName}</h1>
                <span className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                  {lang === 'ar' ? 'تاجر معتمد • نشط' : 'Verified Vendor'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-amber-200/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">
                  {lang === 'ar'
                    ? 'إدارة المنتجات، إحداثيات المستودع، واستقبال إيصالات حوالات المغتربين المباشرة'
                    : 'Manage catalog, Syria dispatch coordinates, and direct expat remittances'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap">
            <button
              onClick={handleOpenAddProduct}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3] shrink-0" />
              <span>{lang === 'ar' ? 'إضافة منتج جديد' : 'Add Product'}</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="truncate">{lang === 'ar' ? 'إيصالات وحوالات المغتربين' : 'Expat Remittances'}</span>
              {pendingOrdersCount > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3 Main Sections Navigation Tabs (Scrollable & Responsive on Mobile) */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center gap-1.5 sm:gap-3 py-2 overflow-x-auto no-scrollbar">
          {/* Tab 1: Products Management */}
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer ${
              activeTab === 'products'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Package className="w-4 h-4 shrink-0" />
            <span className="sm:hidden">{lang === 'ar' ? 'المنتجات' : 'Products'}</span>
            <span className="hidden sm:inline">{lang === 'ar' ? '1. إدارة المنتجات والموقع' : '1. Products & Location'}</span>
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
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="sm:hidden">{lang === 'ar' ? 'حوالات المغتربين' : 'Remittances'}</span>
            <span className="hidden sm:inline">{lang === 'ar' ? '2. إيصالات وطلبات المغتربين' : '2. Expat Orders & Receipts'}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                pendingOrdersCount > 0
                  ? 'bg-amber-500 text-slate-950 animate-pulse'
                  : activeTab === 'orders'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {pendingOrdersCount > 0 ? `${pendingOrdersCount} جديد` : orders.length}
            </span>
          </button>

          {/* Tab 3: Local Payment Details */}
          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer ${
              activeTab === 'wallet'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span className="sm:hidden">{lang === 'ar' ? 'بيانات الاستلام' : 'Payout Info'}</span>
            <span className="hidden sm:inline">{lang === 'ar' ? '3. بيانات استلام الحوالات (طرق الدفع)' : '3. My Payment Details'}</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full font-bold">
              {payoutMethods.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 w-full">
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
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-gray-900">
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
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    <span>{lang === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}</span>
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 sm:p-12 text-center space-y-3">
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
                      className="px-4 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'إضافة منتج الآن' : 'Add First Product'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {products.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative h-40 sm:h-44 bg-gray-100 overflow-hidden">
                            <img
                              src={prod.image_url}
                              alt={prod.title_ar}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-black text-emerald-800 shadow-xs">
                              ${prod.price_usd} USD
                            </div>
                            <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                              {prod.category}
                            </div>
                          </div>

                          <div className="p-3.5 sm:p-4 space-y-2.5">
                            <div>
                              <h3 className="font-bold text-gray-900 text-sm line-clamp-1">
                                {lang === 'ar' ? prod.title_ar : prod.title_en}
                              </h3>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                {lang === 'ar' ? prod.description_ar : prod.description_en}
                              </p>
                            </div>

                            {/* Location & GPS Badge */}
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-gray-700 font-medium">
                              <span className="flex items-center gap-1 text-slate-800 truncate">
                                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span className="truncate">{prod.location_name || 'دمشق'}</span>
                              </span>
                              {prod.latitude && (
                                <span className="text-[10px] text-slate-500 font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200 self-start sm:self-auto">
                                  GPS: {prod.latitude.toFixed(2)}, {prod.longitude?.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-3.5 sm:p-4 pt-0 border-t border-gray-100 flex items-center justify-between gap-2 mt-2">
                          <Link
                            href={`/products/${prod.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 hover:text-emerald-700 transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            <span>{lang === 'ar' ? 'معاينة في المتجر' : 'Store View'}</span>
                          </Link>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-amber-50 hover:text-amber-800 transition cursor-pointer"
                              title="تعديل المنتج والموقع"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="حذف المنتج"
                            >
                              <Trash2 className="w-4 h-4" />
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
              <div className="space-y-4 sm:space-y-6">
                {/* Header Banner */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-gray-900">
                      {lang === 'ar' ? 'سجل طلبات الحوالات المحلية وإشعارات الدفع' : 'Local Remittance Orders & Transfer Receipts'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {lang === 'ar'
                        ? 'طابق رقم إيصال الحوالة الوارد من المشتري مع رسائل هاتفك أو إشعار فرع الصرافة لتأكيد الطلب وبدء التجهيز.'
                        : 'Verify the transfer receipt number against your SMS or branch notification to fulfill the order.'}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5 self-start sm:self-auto">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{lang === 'ar' ? 'تحقق يدوي محلي: الهرم، الفؤاد، سيريتل، شام كاش' : 'Direct Local Remittance Rail'}</span>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setOrderFilter('all')}
                    className={`px-3.5 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      orderFilter === 'all'
                        ? 'bg-gray-900 text-white shadow-xs'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>{lang === 'ar' ? 'جميع الطلبات' : 'All Orders'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                      {orders.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderFilter('pending_verification')}
                    className={`px-3.5 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      orderFilter === 'pending_verification'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'بانتظار مطابقة الحوالة' : 'Pending Verification'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-900/20">
                      {orders.filter((o) => o.status === 'pending_verification').length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderFilter('completed')}
                    className={`px-3.5 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      orderFilter === 'completed'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'تم التحقق والتنفيذ' : 'Completed'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-900/20">
                      {orders.filter((o) => o.status === 'completed' || o.status === 'paid' || o.status === 'delivered').length}
                    </span>
                  </button>
                </div>

                {/* Orders Content */}
                {(() => {
                  const filteredOrders = orders.filter((o) => {
                    if (orderFilter === 'pending_verification') return o.status === 'pending_verification';
                    if (orderFilter === 'completed') return o.status === 'completed' || o.status === 'paid' || o.status === 'delivered';
                    return true;
                  });

                  if (filteredOrders.length === 0) {
                    return (
                      <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 sm:p-12 text-center space-y-3">
                        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
                        <h3 className="text-sm font-bold text-gray-700">
                          {lang === 'ar' ? 'لا توجد طلبات في هذا التصنيف' : 'No orders in this view'}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {lang === 'ar'
                            ? 'ستظهر هنا طلبات الشراء الواردة فور قيام المشتري بإدخال رقم إشعار الحوالة.'
                            : 'Incoming remittance orders will appear here once submitted by buyers.'}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <>
                      {/* Mobile-Friendly Cards View (Under md) */}
                      <div className="block md:hidden space-y-3.5">
                        {filteredOrders.map((item) => {
                          const methodInfo = getMethodBadge(item.payment_method);
                          const isPending = item.status === 'pending_verification';

                          return (
                            <div
                              key={item.id}
                              className={`bg-white rounded-2xl border p-4 shadow-xs space-y-3 transition-all ${
                                isPending
                                  ? 'border-amber-300 ring-2 ring-amber-500/10'
                                  : 'border-gray-200'
                              }`}
                            >
                              {/* Top Bar */}
                              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-gray-900 bg-slate-100 px-2 py-0.5 rounded text-xs">
                                    {item.order_number}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${methodInfo.color}`}
                                  >
                                    {methodInfo.label}
                                  </span>
                                </div>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(item.created_at).toLocaleDateString(
                                    lang === 'ar' ? 'ar-SY' : 'en-US'
                                  )}
                                </span>
                              </div>

                              {/* Highlighted Receipt Number Box */}
                              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                                <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                                    {lang === 'ar' ? 'رقم إيصال الحوالة المسجل:' : 'Transfer Receipt Number:'}
                                  </span>
                                  {isPending && (
                                    <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                                      {lang === 'ar' ? 'بانتظار التأكيد' : 'Verify Now'}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-0.5">
                                  <span
                                    className="font-mono text-sm sm:text-base font-black text-gray-900 bg-white px-2.5 py-1 rounded-lg border border-amber-200 select-all"
                                    dir="ltr"
                                  >
                                    {item.receipt_number || 'غير مسجل'}
                                  </span>
                                  {item.receipt_number && (
                                    <button
                                      type="button"
                                      onClick={() => handleCopyReceipt(item.receipt_number!, item.id)}
                                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 transition flex items-center gap-1 cursor-pointer shrink-0"
                                    >
                                      {copiedReceiptId === item.id ? (
                                        <>
                                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                                          <span className="text-emerald-700">{lang === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3.5 h-3.5" />
                                          <span>{lang === 'ar' ? 'نسخ' : 'Copy'}</span>
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Product & Price */}
                              <div className="space-y-1">
                                <h4 className="font-bold text-gray-900 text-sm">{item.product_title}</h4>
                                <div className="text-gray-500 text-xs flex items-center justify-between">
                                  <span>
                                    {lang === 'ar' ? 'الكمية:' : 'Qty:'} <span className="font-bold text-gray-800">{item.quantity}</span> × ${item.unit_price} USD
                                  </span>
                                  <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg text-xs">
                                    {lang === 'ar' ? 'صافي الحساب:' : 'Net:'} ${item.net_vendor_amount.toFixed(2)} USD
                                  </span>
                                </div>
                              </div>

                              {/* Customer and Recipient Info */}
                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-500">{lang === 'ar' ? 'المشتري (المغترب):' : 'Buyer:'}</span>
                                  <span className="font-bold text-gray-800">{item.customer_name}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="text-gray-500">{lang === 'ar' ? 'المستلم في سوريا:' : 'Recipient:'}</span>
                                  <span className="font-bold text-emerald-800">{item.recipient_name || item.customer_name}</span>
                                </div>

                                {item.recipient_phone && (
                                  <div className="flex items-center justify-between pt-0.5">
                                    <span className="text-gray-500">{lang === 'ar' ? 'هاتف المستلم:' : 'Phone:'}</span>
                                    <div className="flex items-center gap-2">
                                      <a
                                        href={`tel:${item.recipient_phone}`}
                                        className="text-emerald-700 flex items-center gap-1 font-mono text-xs font-bold hover:underline"
                                      >
                                        <Phone className="w-3 h-3 text-emerald-600" />
                                        <span dir="ltr">{item.recipient_phone}</span>
                                      </a>
                                      <a
                                        href={`https://wa.me/${item.recipient_phone.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded hover:bg-emerald-200"
                                      >
                                        واتساب
                                      </a>
                                    </div>
                                  </div>
                                )}

                                <div className="text-gray-500 text-[11px] truncate pt-0.5">
                                  <span className="text-gray-400">{lang === 'ar' ? 'العنوان: ' : 'Address: '}</span>
                                  {item.delivery_address || 'دمشق'}
                                </div>
                              </div>

                              {/* Action Buttons for Mobile */}
                              <div className="pt-1 space-y-2">
                                {isPending ? (
                                  <button
                                    type="button"
                                    disabled={orderUpdatingId === item.id}
                                    onClick={() => handleUpdateOrderStatus(item.id, 'completed')}
                                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{lang === 'ar' ? 'تأكيد استلام الحوالة وإكمال الطلب' : 'Verify Receipt & Complete'}</span>
                                  </button>
                                ) : (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      {lang === 'ar' ? 'تم استلام الحوالة وتنفيذ الطلب' : 'Completed & Dispatched'}
                                    </span>

                                    <select
                                      value={item.status}
                                      disabled={orderUpdatingId === item.id}
                                      onChange={(e) =>
                                        handleUpdateOrderStatus(
                                          item.id,
                                          e.target.value as any
                                        )
                                      }
                                      className="text-xs font-bold border border-gray-300 rounded-lg px-2 py-1 bg-white text-gray-800 cursor-pointer"
                                    >
                                      <option value="completed">{lang === 'ar' ? 'مكتمل' : 'Completed'}</option>
                                      <option value="processing">{lang === 'ar' ? 'قيد التجهيز' : 'Processing'}</option>
                                      <option value="delivered">{lang === 'ar' ? 'تم التسليم للأهل' : 'Delivered'}</option>
                                    </select>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Desktop Table View (md and above) */}
                      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-start">
                            <thead className="text-[11px] uppercase bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                              <tr>
                                <th className="py-3.5 px-4">{lang === 'ar' ? 'رقم الطلب والتاريخ' : 'Order & Date'}</th>
                                <th className="py-3.5 px-4">{lang === 'ar' ? 'طريقة التحويل وإيصال الحوالة' : 'Remittance & Receipt #'}</th>
                                <th className="py-3.5 px-4">{lang === 'ar' ? 'المنتج والكمية' : 'Product & Qty'}</th>
                                <th className="py-3.5 px-4">{lang === 'ar' ? 'بيانات المستلم في سوريا' : 'Recipient & Delivery'}</th>
                                <th className="py-3.5 px-4">{lang === 'ar' ? 'صافي الحساب' : 'Net Amount'}</th>
                                <th className="py-3.5 px-4">{lang === 'ar' ? 'إجراء التحقق والحالة' : 'Action & Status'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {filteredOrders.map((item) => {
                                const methodInfo = getMethodBadge(item.payment_method);
                                const isPending = item.status === 'pending_verification';

                                return (
                                  <tr
                                    key={item.id}
                                    className={`hover:bg-gray-50/50 transition-colors ${
                                      isPending ? 'bg-amber-50/20' : ''
                                    }`}
                                  >
                                    {/* Order Number */}
                                    <td className="py-3.5 px-4">
                                      <span className="font-mono font-bold text-gray-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                        {item.order_number}
                                      </span>
                                      <div className="text-[10px] text-gray-400 mt-1">
                                        {new Date(item.created_at).toLocaleDateString(
                                          lang === 'ar' ? 'ar-SY' : 'en-US'
                                        )}
                                      </div>
                                    </td>

                                    {/* Remittance & Receipt Number Box */}
                                    <td className="py-3.5 px-4">
                                      <div className="space-y-1">
                                        <span
                                          className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${methodInfo.color}`}
                                        >
                                          {methodInfo.label}
                                        </span>

                                        <div className="flex items-center gap-1.5">
                                          <span
                                            className="font-mono font-black text-xs text-gray-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 select-all"
                                            dir="ltr"
                                          >
                                            {item.receipt_number || 'غير مسجل'}
                                          </span>
                                          {item.receipt_number && (
                                            <button
                                              type="button"
                                              onClick={() => handleCopyReceipt(item.receipt_number!, item.id)}
                                              className="p-1 rounded text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                                              title="نسخ رقم الإيصال"
                                            >
                                              {copiedReceiptId === item.id ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                              ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                              )}
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </td>

                                    {/* Product and Qty */}
                                    <td className="py-3.5 px-4">
                                      <div className="font-bold text-gray-900">{item.product_title}</div>
                                      <div className="text-gray-500 text-[11px]">
                                        {lang === 'ar' ? 'الكمية:' : 'Qty:'} {item.quantity} × ${item.unit_price} USD
                                      </div>
                                    </td>

                                    {/* Recipient Details */}
                                    <td className="py-3.5 px-4">
                                      <div className="font-bold text-emerald-800">
                                        {item.recipient_name || item.customer_name}
                                      </div>
                                      <div className="text-[10px] text-gray-400">
                                        {lang === 'ar' ? 'المشتري:' : 'Buyer:'} {item.customer_name}
                                      </div>
                                      {item.recipient_phone && (
                                        <div className="text-gray-500 flex items-center gap-2 font-mono text-[11px] mt-0.5">
                                          <a
                                            href={`tel:${item.recipient_phone}`}
                                            className="hover:text-emerald-700 flex items-center gap-0.5"
                                          >
                                            <Phone className="w-3 h-3 text-emerald-600" />
                                            <span dir="ltr">{item.recipient_phone}</span>
                                          </a>
                                          <a
                                            href={`https://wa.me/${item.recipient_phone.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1 py-0.2 rounded hover:bg-emerald-100"
                                          >
                                            واتساب
                                          </a>
                                        </div>
                                      )}
                                      <div className="text-gray-400 text-[10px] truncate max-w-[180px] mt-0.5">
                                        {item.delivery_address || 'دمشق'}
                                      </div>
                                    </td>

                                    {/* Net Earnings */}
                                    <td className="py-3.5 px-4">
                                      <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs">
                                        +${item.net_vendor_amount.toFixed(2)} USD
                                      </span>
                                    </td>

                                    {/* Verification & Status */}
                                    <td className="py-3.5 px-4">
                                      {isPending ? (
                                        <button
                                          type="button"
                                          disabled={orderUpdatingId === item.id}
                                          onClick={() => handleUpdateOrderStatus(item.id, 'completed')}
                                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap"
                                        >
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          <span>{lang === 'ar' ? 'تأكيد الحوالة وإكمال الطلب' : 'Verify Payment & Complete Order'}</span>
                                        </button>
                                      ) : (
                                        <div className="space-y-1">
                                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                                            <Check className="w-3 h-3" />
                                            {lang === 'ar' ? 'تم استلام الحوالة' : 'Verified'}
                                          </span>

                                          <div>
                                            <select
                                              value={item.status}
                                              disabled={orderUpdatingId === item.id}
                                              onChange={(e) =>
                                                handleUpdateOrderStatus(
                                                  item.id,
                                                  e.target.value as any
                                                )
                                              }
                                              className="text-[11px] font-bold border border-gray-300 rounded px-1.5 py-0.5 bg-white text-gray-700 cursor-pointer"
                                            >
                                              <option value="completed">{lang === 'ar' ? 'مكتمل' : 'Completed'}</option>
                                              <option value="processing">{lang === 'ar' ? 'قيد التجهيز' : 'Processing'}</option>
                                              <option value="delivered">{lang === 'ar' ? 'تم التسليم' : 'Delivered'}</option>
                                            </select>
                                          </div>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* ================= TAB 3: LOCAL REMITTANCE RECEIVING ACCOUNTS ================= */}
            {activeTab === 'wallet' && (
              <div className="space-y-6 sm:space-y-8">
                {/* Direct Remittances Financial Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-5 sm:p-6 rounded-2xl shadow-md space-y-2">
                    <span className="text-emerald-100 text-xs font-bold uppercase tracking-wider">
                      {lang === 'ar' ? 'إجمالي الحوالات المباشرة' : 'Total Direct Remittances'}
                    </span>
                    <div className="text-2xl sm:text-3xl font-black">
                      ${totalNetEarnings.toFixed(2)} <span className="text-xs font-normal">USD</span>
                    </div>
                    <p className="text-[11px] text-emerald-100/90 pt-2 border-t border-emerald-500/50">
                      {lang === 'ar' ? 'حوالات مستلمة مباشرة لحسابك في سوريا' : 'Direct payments received in Syria'}
                    </p>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                      {lang === 'ar' ? 'حوالات بانتظار المطابقة' : 'Pending Verification'}
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-amber-600">
                      {pendingOrdersCount} {lang === 'ar' ? 'طلبات' : 'Orders'}
                    </div>
                    <p className="text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                      {lang === 'ar' ? 'بانتظار مطابقة رقم الإشعار' : 'Awaiting remittance verification'}
                    </p>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                      {lang === 'ar' ? 'الطلبات المكتملة' : 'Completed Orders'}
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-slate-800">
                      {completedOrdersCount} {lang === 'ar' ? 'طلبات' : 'Orders'}
                    </div>
                    <p className="text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                      {lang === 'ar' ? 'تم استلام حوالاتها بنجاح' : 'Payment received & completed'}
                    </p>
                  </div>
                </div>

                {/* Syrian Local Payment Method Details for Expat Buyers */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>{lang === 'ar' ? 'بيانات وحسابات استلام الحوالات المباشرة من المغتربين' : 'Local Remittance Receiving Accounts'}</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {lang === 'ar'
                        ? 'أدخل بيانات حساباتك (الهرم للحوالات، شركة الفؤاد، سيريتل كاش، شام كاش) لتظهر للمغتربين عند إتمام الشراء ليتمكنوا من تحويل قيمة السلع لحسابك مباشرة.'
                        : 'Manage your local Syrian transfer accounts (Al-Haram, Al-Fouad, Syriatel Cash, Cham Cash) so expat buyers can remit directly to you.'}
                    </p>
                  </div>

                  {/* Inline Form to Add / Save Cham Cash Details */}
                  <form onSubmit={handleSaveChamCashMethod} className="bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="text-xs font-bold text-gray-800 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{lang === 'ar' ? 'إضافة وسيلة استلام حوالة جديدة (الهرم / الفؤاد / سيريتل / شام كاش)' : 'Add New Transfer Method'}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          {lang === 'ar' ? 'طريقة التحويل *' : 'Transfer Method *'}
                        </label>
                        <select
                          value={chamCashForm.method_name}
                          onChange={(e) => setChamCashForm({ ...chamCashForm, method_name: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold text-gray-800 focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="شركة الهرم للحوالات (Al-Haram)">الهرم للحوالات (استلام بالفرع / كاش)</option>
                          <option value="شركة الفؤاد للحوالات (Al-Fouad)">شركة الفؤاد للحوالات</option>
                          <option value="سيريتل كاش (Syriatel Cash)">سيريتل كاش (Syriatel Cash)</option>
                          <option value="شام كاش (Cham Cash)">شام كاش (Cham Cash)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          {lang === 'ar' ? 'رقم الحساب أو رقم الموبايل *' : 'Account or Mobile # *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={chamCashForm.account_number}
                          onChange={(e) => setChamCashForm({ ...chamCashForm, account_number: e.target.value })}
                          placeholder="مثال: 0944112233 أو رقم المحفظة"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 bg-white font-mono font-bold text-gray-900 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          {lang === 'ar' ? 'اسم المستلم الثلاثي (كما في الهوية) *' : 'Receiver Full Name *'}
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
                        placeholder={lang === 'ar' ? 'المدينة أو الفرع المفضل (مثلاً: دمشق، فرع البرامكة)' : 'City or preferred branch'}
                        className="w-full sm:w-2/3 text-xs px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-700"
                      />

                      <button
                        type="submit"
                        disabled={addingMethod}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-60"
                      >
                        {addingMethod ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>{lang === 'ar' ? 'حفظ وسيلة الاستلام' : 'Save Method'}</span>
                      </button>
                    </div>
                  </form>

                  {/* List of Saved Syrian Payout Methods */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-gray-700 block">
                      {lang === 'ar' ? 'وسائل الاستلام المحفوظة للظهور للمغتربين عند الدفع:' : 'Saved Payout Methods:'}
                    </span>

                    {payoutMethods.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">
                        {lang === 'ar' ? 'لم تقم بحفظ أي وسيلة استلام بعد. أضف وسيلتك أعلاه ليتمكن المغتربون من التحويل لحسابك مباشرة.' : 'No saved methods yet.'}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {payoutMethods.map((m) => (
                          <div
                            key={m.id}
                            className="p-3.5 rounded-xl border border-gray-200 bg-white relative space-y-1.5 shadow-2xs hover:border-emerald-300 transition"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 truncate">
                                {m.method_name}
                              </span>
                              <button
                                onClick={() => handleDeletePayoutMethod(m.id)}
                                className="text-gray-400 hover:text-rose-600 transition cursor-pointer p-1"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="font-mono font-bold text-gray-900 text-xs">{m.account_number}</p>
                            <p className="text-gray-600 text-[11px] truncate">{m.account_holder_name}</p>
                            {m.notes && <p className="text-gray-400 text-[10px] truncate">{m.notes}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ================= MODAL: ADD / EDIT PRODUCT (FULLY RESPONSIVE MOBILE SHEET) ================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  {editingProductId
                    ? lang === 'ar' ? 'تعديل بيانات المنتج والموقع' : 'Edit Product & Location'
                    : lang === 'ar' ? 'إضافة منتج جديد للمتجر' : 'Add New Product to Store'}
                </span>
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-1 focus:ring-amber-500"
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
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-1 focus:ring-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'ar' ? 'تصنيف السلعة' : 'Category'}
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-1 focus:ring-amber-500"
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
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-1 focus:ring-amber-500"
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
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-1 focus:ring-amber-500"
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

              <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer text-center"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-60"
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
    </div>
  );
}
