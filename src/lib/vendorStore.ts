import {
  Product,
  VendorLedgerEntry,
  VendorPayoutSummary,
  VendorPayoutMethod,
  WithdrawalRequest,
  VendorOrderItem,
} from '@/types/store';
import { STORE_PRODUCTS } from './products';

// Syrian Governorates Coordinates Map Reference
export const SYRIAN_CITIES_COORDINATES = [
  { city_en: 'Damascus', city_ar: 'دمشق', lat: 33.5138, lng: 36.2765, address: 'دمشق، ساحة المرجة وباب توما' },
  { city_en: 'Aleppo', city_ar: 'حلب', lat: 36.2021, lng: 37.1343, address: 'حلب، الفرقان والجميلية' },
  { city_en: 'Homs', city_ar: 'حمص', lat: 34.7324, lng: 36.7137, address: 'حمص، شارع الحضارة والدبلان' },
  { city_en: 'Latakia', city_ar: 'اللاذقية', lat: 35.5317, lng: 35.7901, address: 'اللاذقية، شارع بغداد والكورنيش' },
  { city_en: 'Hama', city_ar: 'حماة', lat: 35.1318, lng: 36.7578, address: 'حماة، ساحة العاصي والنواعير' },
  { city_en: 'Tartus', city_ar: 'طرطوس', lat: 34.8890, lng: 35.8866, address: 'طرطوس، الكورنيش البحري' },
  { city_en: 'Daraa', city_ar: 'درعا', lat: 32.6255, lng: 36.1054, address: 'درعا، طريق السد والمحطة' },
  { city_en: 'Idlib', city_ar: 'إدلب', lat: 35.9306, lng: 36.6339, address: 'إدلب، شارع الثلاثين والساحة' },
];

// Initial mock products with coordinates and location
let vendorProducts: Product[] = [
  ...STORE_PRODUCTS.map((p, idx) => ({
    ...p,
    vendor_id: idx % 2 === 0 ? 'vendor-damascus-01' : 'vendor-aleppo-02',
    vendor_name: idx % 2 === 0 ? 'مستودعات الشام الغذائية (دمشق)' : 'مؤسسة الشهباء للرعاية (حلب)',
    latitude: idx % 2 === 0 ? 33.5138 : 36.2021,
    longitude: idx % 2 === 0 ? 36.2765 : 37.1343,
    location_name: idx % 2 === 0 ? 'دمشق، مستودعات كفرسوسة والبرامكة' : 'حلب، مستودعات الفرقان الصناعية',
  })),
];

// Initial mock saved Syrian payout methods
let vendorPayoutMethods: VendorPayoutMethod[] = [
  {
    id: 'pm-1',
    vendor_id: 'vendor-damascus-01',
    method_name: 'Cham Cash (شام كاش)',
    account_number: 'CHAM-9844-0129',
    account_holder_name: 'محمد رضوان الشامي',
    phone_number: '+963 944 112 233',
    is_default: true,
    notes: 'حساب محفظة شام كاش مباشر للتسليم الفوري',
    created_at: '2026-10-15T09:00:00Z',
  },
  {
    id: 'pm-2',
    vendor_id: 'vendor-damascus-01',
    method_name: 'شركة الهرم للحوالات (Al-Haram)',
    account_number: '0104-58921-SY',
    account_holder_name: 'محمد رضوان الشامي - فرع البرامكة',
    phone_number: '+963 944 112 233',
    is_default: false,
    notes: 'استلام كاش عبر فرع البرامكة دمشق بموجب الهوية الشخصية',
    created_at: '2026-10-20T11:00:00Z',
  },
  {
    id: 'pm-3',
    vendor_id: 'vendor-aleppo-02',
    method_name: 'Syriatel Cash (سيريتل كاش)',
    account_number: '+963 933 556 778',
    account_holder_name: 'أحمد كمال الحلبي',
    phone_number: '+963 933 556 778',
    is_default: true,
    notes: 'سيريتل كاش نشط على مدار الساعة',
    created_at: '2026-10-25T14:00:00Z',
  },
];

// Initial mock vendor order items (incoming customer orders)
let vendorOrderItems: VendorOrderItem[] = [
  {
    id: 'item-201',
    order_id: 'ord-101',
    order_number: 'SND-98214-DM',
    product_id: 'prod-food-01',
    product_title: 'السلة الغذائية العائلية الشاملة',
    vendor_id: 'vendor-damascus-01',
    customer_name: 'أم عمار المحمد',
    customer_email: 'um.ammar@gmail.com',
    customer_phone: '+963 944 123 456',
    delivery_address: 'دمشق، المزة فيلات غربية - بناء النرجس طابق 3',
    city: 'دمشق',
    quantity: 1,
    unit_price: 55.00,
    total_price: 55.00,
    platform_fee: 5.50, // 10%
    net_vendor_amount: 49.50,
    status: 'paid',
    created_at: '2026-11-06T14:20:00Z',
  },
  {
    id: 'item-202',
    order_id: 'ord-102',
    order_number: 'SND-98305-DM',
    product_id: 'prod-food-01',
    product_title: 'السلة الغذائية العائلية الشاملة',
    vendor_id: 'vendor-damascus-01',
    customer_name: 'خالد عبد الباسط',
    customer_email: 'khaled.baset@outlook.com',
    customer_phone: '+963 933 887 711',
    delivery_address: 'دمشق، كفرسوسة - جانب جامع الهدى',
    city: 'دمشق',
    quantity: 2,
    unit_price: 55.00,
    total_price: 110.00,
    platform_fee: 11.00,
    net_vendor_amount: 99.00,
    status: 'processing',
    created_at: '2026-11-06T18:45:00Z',
  },
  {
    id: 'item-203',
    order_id: 'ord-103',
    order_number: 'SND-98410-ALP',
    product_id: 'prod-med-01',
    product_title: 'باقة الرعاية الصحية وأدوية كبار السن',
    vendor_id: 'vendor-aleppo-02',
    customer_name: 'محمود الصالح',
    customer_email: 'saleh.m@yahoo.com',
    customer_phone: '+963 955 443 322',
    delivery_address: 'حلب، الجميلية - شارع الملك فيصل',
    city: 'حلب',
    quantity: 1,
    unit_price: 42.00,
    total_price: 42.00,
    platform_fee: 4.20,
    net_vendor_amount: 37.80,
    status: 'shipped',
    created_at: '2026-11-05T10:15:00Z',
  },
];

// Initial mock withdrawal requests
let withdrawalRequests: WithdrawalRequest[] = [
  {
    id: 'wdr-501',
    vendor_id: 'vendor-damascus-01',
    vendor_name: 'محمد رضوان الشامي',
    store_name: 'مستودعات الشام الغذائية (دمشق)',
    amount: 50.00,
    status: 'paid',
    payout_method_id: 'pm-1',
    payout_method: vendorPayoutMethods[0],
    transaction_ref: 'CHAM-TXN-8829104',
    admin_notes: 'تم التحويل المباشر لمحفظة شام كاش المعتمدة وإشعار التاجر واتساب',
    created_at: '2026-11-03T11:00:00Z',
    paid_at: '2026-11-03T15:30:00Z',
    settled_by: 'admin-syria-hq',
  },
  {
    id: 'wdr-502',
    vendor_id: 'vendor-damascus-01',
    vendor_name: 'محمد رضوان الشامي',
    store_name: 'مستودعات الشام الغذائية (دمشق)',
    amount: 45.00,
    status: 'pending',
    payout_method_id: 'pm-1',
    payout_method: vendorPayoutMethods[0],
    admin_notes: 'بانتظار تأكيد إرسال الحوالة الداخلية من الإدارة',
    created_at: '2026-11-06T19:00:00Z',
  },
  {
    id: 'wdr-503',
    vendor_id: 'vendor-aleppo-02',
    vendor_name: 'أحمد كمال الحلبي',
    store_name: 'مؤسسة الشهباء للرعاية (حلب)',
    amount: 35.00,
    status: 'pending',
    payout_method_id: 'pm-3',
    payout_method: vendorPayoutMethods[2],
    admin_notes: 'طلب سحب عبر سيريتل كاش قيد التدقيق',
    created_at: '2026-11-06T20:15:00Z',
  },
];

// Products Management
export function getVendorProducts(vendorId?: string): Product[] {
  if (!vendorId) return vendorProducts;
  return vendorProducts.filter((p) => p.vendor_id === vendorId);
}

export function addVendorProduct(product: Omit<Product, 'id' | 'created_at'>): Product {
  const newProduct: Product = {
    ...product,
    id: `prod-${Date.now().toString().slice(-6)}`,
    slug: product.slug || `prod-${Date.now().toString().slice(-6)}`,
    created_at: new Date().toISOString(),
  };
  vendorProducts = [newProduct, ...vendorProducts];
  return newProduct;
}

export function updateVendorProduct(productId: string, updates: Partial<Product>): Product | null {
  const index = vendorProducts.findIndex((p) => p.id === productId || p.slug === productId);
  if (index === -1) return null;
  vendorProducts[index] = {
    ...vendorProducts[index],
    ...updates,
  };
  return vendorProducts[index];
}

export function deleteVendorProduct(productId: string): boolean {
  const initialLen = vendorProducts.length;
  vendorProducts = vendorProducts.filter((p) => p.id !== productId && p.slug !== productId);
  return vendorProducts.length < initialLen;
}

// Order Items Management
export function getVendorOrderItems(vendorId?: string): VendorOrderItem[] {
  if (!vendorId) return vendorOrderItems;
  return vendorOrderItems.filter((i) => i.vendor_id === vendorId);
}

export function updateOrderItemStatus(itemId: string, status: 'paid' | 'processing' | 'shipped' | 'delivered'): VendorOrderItem | null {
  const item = vendorOrderItems.find((i) => i.id === itemId);
  if (!item) return null;
  item.status = status;
  return item;
}

// Syrian Payout Methods Management
export function getVendorPayoutMethods(vendorId?: string): VendorPayoutMethod[] {
  if (!vendorId) return vendorPayoutMethods;
  return vendorPayoutMethods.filter((m) => m.vendor_id === vendorId);
}

export function addVendorPayoutMethod(method: Omit<VendorPayoutMethod, 'id' | 'created_at'>): VendorPayoutMethod {
  const newMethod: VendorPayoutMethod = {
    ...method,
    id: `pm-${Date.now().toString().slice(-6)}`,
    created_at: new Date().toISOString(),
  };
  vendorPayoutMethods = [newMethod, ...vendorPayoutMethods];
  return newMethod;
}

export function deleteVendorPayoutMethod(methodId: string): boolean {
  const initialLen = vendorPayoutMethods.length;
  vendorPayoutMethods = vendorPayoutMethods.filter((m) => m.id !== methodId);
  return vendorPayoutMethods.length < initialLen;
}

// Withdrawals Management
export function getVendorWithdrawals(vendorId?: string): WithdrawalRequest[] {
  if (!vendorId) return withdrawalRequests;
  return withdrawalRequests.filter((w) => w.vendor_id === vendorId);
}

export function getAllWithdrawalRequests(): WithdrawalRequest[] {
  return withdrawalRequests;
}

export function requestVendorWithdrawal(
  vendorId: string,
  amount: number,
  payoutMethodId: string,
  vendorName?: string,
  storeName?: string
): { success: boolean; error?: string; withdrawal?: WithdrawalRequest } {
  const wallet = calculateVendorWallet(vendorId);
  if (amount <= 0) {
    return { success: false, error: 'المبلغ المطلوب يجب أن يكون أكبر من الصفر' };
  }
  if (amount > wallet.availableBalance) {
    return { success: false, error: `الرصيد المتاح غير كافٍ. الرصيد الحالي: $${wallet.availableBalance.toFixed(2)} USD` };
  }

  const payoutMethod = vendorPayoutMethods.find((m) => m.id === payoutMethodId);
  if (!payoutMethod) {
    return { success: false, error: 'طريقة التحويل المحددة غير موجودة' };
  }

  const newWithdrawal: WithdrawalRequest = {
    id: `wdr-${Date.now().toString().slice(-6)}`,
    vendor_id: vendorId,
    vendor_name: vendorName || payoutMethod.account_holder_name,
    store_name: storeName || 'المتجر المعتمد',
    amount: Number(amount),
    status: 'pending',
    payout_method_id: payoutMethodId,
    payout_method: payoutMethod,
    admin_notes: 'طلب سحب قيد التدقيق والمعالجة من الإدارة في سوريا',
    created_at: new Date().toISOString(),
  };

  withdrawalRequests = [newWithdrawal, ...withdrawalRequests];
  return { success: true, withdrawal: newWithdrawal };
}

export function settleWithdrawalRequest(
  withdrawalId: string,
  transactionRef: string,
  notes?: string,
  adminId?: string
): { success: boolean; error?: string; withdrawal?: WithdrawalRequest } {
  const withdrawal = withdrawalRequests.find((w) => w.id === withdrawalId);
  if (!withdrawal) {
    return { success: false, error: 'طلب السحب غير موجود' };
  }
  if (withdrawal.status === 'paid') {
    return { success: false, error: 'هذا الطلب مسوى ومدفوع مسبقاً' };
  }

  withdrawal.status = 'paid';
  withdrawal.transaction_ref = transactionRef;
  withdrawal.admin_notes = notes || 'تم التحويل بموجب إشعار معتمد في سوريا';
  withdrawal.paid_at = new Date().toISOString();
  withdrawal.settled_by = adminId || 'admin-syria-hq';

  return { success: true, withdrawal };
}

// Comprehensive Wallet Balance Calculator
export function calculateVendorWallet(vendorId: string) {
  const orders = getVendorOrderItems(vendorId);
  const withdrawals = getVendorWithdrawals(vendorId);

  const totalGrossSales = orders.reduce((sum, o) => sum + o.total_price, 0);
  const totalPlatformFees = orders.reduce((sum, o) => sum + o.platform_fee, 0);
  const totalNetEarnings = orders.reduce((sum, o) => sum + o.net_vendor_amount, 0);

  const totalPaidWithdrawals = withdrawals
    .filter((w) => w.status === 'paid')
    .reduce((sum, w) => sum + w.amount, 0);

  const totalPendingWithdrawals = withdrawals
    .filter((w) => w.status === 'pending')
    .reduce((sum, w) => sum + w.amount, 0);

  // Available balance is Net earnings minus paid and pending withdrawals
  const availableBalance = Math.max(0, totalNetEarnings - totalPaidWithdrawals - totalPendingWithdrawals);

  return {
    totalGrossSales,
    totalPlatformFees,
    totalNetEarnings,
    totalPaidWithdrawals,
    totalPendingWithdrawals,
    availableBalance,
  };
}

export function getAllVendorsPayoutSummary(): VendorPayoutSummary[] {
  // Extract unique vendors
  const vendorIds = Array.from(
    new Set([
      'vendor-damascus-01',
      'vendor-aleppo-02',
      ...vendorProducts.map((p) => p.vendor_id).filter(Boolean),
      ...vendorOrderItems.map((o) => o.vendor_id),
      ...withdrawalRequests.map((w) => w.vendor_id),
    ])
  ) as string[];

  return vendorIds.map((vId) => {
    const wallet = calculateVendorWallet(vId);
    const withdrawals = getVendorWithdrawals(vId);
    const lastPaid = withdrawals.find((w) => w.status === 'paid');

    const sampleName = vId.includes('damascus')
      ? 'محمد رضوان الشامي'
      : vId.includes('aleppo')
      ? 'أحمد كمال الحلبي'
      : 'مزود سوري معتمد';

    const sampleStore = vId.includes('damascus')
      ? 'مستودعات الشام الغذائية (دمشق)'
      : vId.includes('aleppo')
      ? 'مؤسسة الشهباء للرعاية (حلب)'
      : 'متجر محلي معتمد';

    const city = vId.includes('damascus') ? 'دمشق' : vId.includes('aleppo') ? 'حلب' : 'سوريا';

    return {
      vendor_id: vId,
      vendor_name: sampleName,
      store_name: sampleStore,
      city: city,
      phone: '+963 944 112 233',
      total_gross_sales: wallet.totalGrossSales,
      total_platform_fees: wallet.totalPlatformFees,
      pending_balance: wallet.availableBalance + wallet.totalPendingWithdrawals,
      settled_balance: wallet.totalPaidWithdrawals,
      last_settled_at: lastPaid?.paid_at,
    };
  });
}

// Backward compatibility helpers
export function getVendorStats(vendorId: string) {
  const wallet = calculateVendorWallet(vendorId);
  const orders = getVendorOrderItems(vendorId);
  return {
    totalGross: wallet.totalGrossSales,
    totalFees: wallet.totalPlatformFees,
    pendingBalance: wallet.availableBalance,
    settledBalance: wallet.totalPaidWithdrawals,
    entries: orders,
  };
}

export function settleVendorPendingBalance(vendorId: string, payoutNote?: string): number {
  const pending = withdrawalRequests.filter(
    (w) => w.vendor_id === vendorId && w.status === 'pending'
  );
  let settledTotal = 0;
  for (const w of pending) {
    w.status = 'paid';
    w.transaction_ref = `SY-TXN-${Date.now().toString().slice(-6)}`;
    w.admin_notes = payoutNote || 'تم التسليم كاش في سوريا';
    w.paid_at = new Date().toISOString();
    settledTotal += w.amount;
  }
  return settledTotal;
}

