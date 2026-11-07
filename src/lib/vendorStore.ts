import {
  Product,
  VendorLedgerEntry,
  VendorPayoutSummary,
  VendorPayoutMethod,
  WithdrawalRequest,
  VendorOrderItem,
  LocalTransferMethod,
  SellerTransferDetail,
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

// Initial mock vendor order items (incoming customer orders with Syrian local transfers)
let vendorOrderItems: VendorOrderItem[] = [
  {
    id: 'item-201',
    order_id: 'ord-101',
    order_number: 'SND-98214-DM',
    product_id: 'prod-family-nutrition-box',
    product_title: 'السلة الغذائية العائلية الشاملة',
    vendor_id: 'vendor-damascus-01',
    customer_name: 'طارق الأيوبي (مغترب في ألمانيا)',
    customer_email: 'tareq.ayyoubi@gmail.com',
    customer_phone: '+49 152 9844 1234',
    recipient_name: 'أم عمار المحمد (الوالدة)',
    recipient_phone: '+963 944 123 456',
    delivery_address: 'دمشق، المزة فيلات غربية - بناء النرجس طابق 3',
    city: 'دمشق',
    quantity: 1,
    unit_price: 55.00,
    total_price: 55.00,
    platform_fee: 0,
    net_vendor_amount: 55.00,
    payment_method: 'cham_cash',
    receipt_number: 'CHAM-8841920-DM',
    receipt_image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
    status: 'pending_verification',
    created_at: '2026-11-07T14:20:00Z',
  },
  {
    id: 'item-202',
    order_id: 'ord-102',
    order_number: 'SND-98305-DM',
    product_id: 'prod-family-nutrition-box',
    product_title: 'السلة الغذائية العائلية الشاملة',
    vendor_id: 'vendor-damascus-01',
    customer_name: 'سمير الخالد (مغترب في الإمارات)',
    customer_email: 'samir.khaled@outlook.com',
    customer_phone: '+971 50 887 7112',
    recipient_name: 'خالد عبد الباسط',
    recipient_phone: '+963 933 887 711',
    delivery_address: 'دمشق، كفرسوسة - جانب جامع الهدى',
    city: 'دمشق',
    quantity: 2,
    unit_price: 55.00,
    total_price: 110.00,
    platform_fee: 0,
    net_vendor_amount: 110.00,
    payment_method: 'al_haram',
    receipt_number: 'HRM-592810-SY',
    receipt_image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80',
    status: 'pending_verification',
    created_at: '2026-11-07T16:45:00Z',
  },
  {
    id: 'item-203',
    order_id: 'ord-103',
    order_number: 'SND-98410-ALP',
    product_id: 'prod-chronic-care-medical-kit',
    product_title: 'باقة الرعاية الصحية وأدوية كبار السن',
    vendor_id: 'vendor-aleppo-02',
    customer_name: 'رنا الدندشي (مغتربة في كندا)',
    customer_email: 'rana.dandashi@yahoo.com',
    customer_phone: '+1 416 555 0192',
    recipient_name: 'الحاج محمود الصالح',
    recipient_phone: '+963 955 443 322',
    delivery_address: 'حلب، الجميلية - شارع الملك فيصل',
    city: 'حلب',
    quantity: 1,
    unit_price: 42.00,
    total_price: 42.00,
    platform_fee: 0,
    net_vendor_amount: 42.00,
    payment_method: 'syriatel_cash',
    receipt_number: 'SYRIATEL-994120',
    status: 'completed',
    created_at: '2026-11-06T10:15:00Z',
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

// ==============================================================================
// LOCAL SYRIAN TRANSFER RAILS: (الهرم، الفؤاد، سيريتل كاش، شام كاش)
// ==============================================================================

export function getSellerTransferDetails(
  vendorId?: string,
  method: LocalTransferMethod = 'cham_cash'
): SellerTransferDetail {
  const isDamascus = !vendorId || vendorId.includes('damascus');
  const isAleppo = vendorId?.includes('aleppo');

  const sellerName = isDamascus
    ? 'محمد رضوان الشامي'
    : isAleppo
    ? 'أحمد كمال الحلبي'
    : 'مستودعات الشام الغذائية';

  const phone = isDamascus ? '0944112233' : isAleppo ? '0933556778' : '0944998877';
  const city = isDamascus ? 'دمشق' : isAleppo ? 'حلب' : 'دمشق';

  switch (method) {
    case 'al_haram':
      return {
        method: 'al_haram',
        methodNameAr: 'شركة الهرم للحوالات (Al-Haram)',
        methodNameEn: 'Al-Haram Remittance',
        fullName: sellerName,
        phoneNumber: phone,
        city: city,
        branchOrAccount: isDamascus ? 'دمشق - فرع البرامكة' : 'حلب - فرع الجميلية',
        instructionsAr: 'توجه لأي فرع لشركة الهرم وأرسل الحوالة بالاسم والمدينة المحددة، ثم أدخل رقم إشعار الحوالة أدناه.',
        instructionsEn: 'Visit any Al-Haram branch, remit funds to the beneficiary above, and enter the voucher number below.',
      };
    case 'al_fouad':
      return {
        method: 'al_fouad',
        methodNameAr: 'شركة الفؤاد للحوالات (Al-Fouad)',
        methodNameEn: 'Al-Fouad Remittance',
        fullName: sellerName,
        phoneNumber: phone,
        city: city,
        branchOrAccount: isDamascus ? 'دمشق - فرع الحلبوني' : 'حلب - فرع الفرقان',
        instructionsAr: 'أرسل الحوالة عبر فروع شركة الفؤاد باسم المستلم والمدينة، ثم اكتب رقم إشعار الحوالة لتأكيد الطلب.',
        instructionsEn: 'Send the transfer via Al-Fouad to the recipient name & city, then input the voucher number.',
      };
    case 'syriatel_cash':
      return {
        method: 'syriatel_cash',
        methodNameAr: 'سيريتل كاش (Syriatel Cash)',
        methodNameEn: 'Syriatel Cash',
        fullName: sellerName,
        phoneNumber: isDamascus ? '0933887711' : '0933556778',
        city: city,
        branchOrAccount: 'محفظة سيريتل كاش إلكترونية',
        instructionsAr: 'حول المبلغ عبر تطبيق سيريتل كاش (*580#) إلى رقم الهاتف أعلاه، ثم أدخل رقم العملية أدناه.',
        instructionsEn: 'Transfer funds via Syriatel Cash app to the phone number above, then enter the transaction ID.',
      };
    case 'cham_cash':
    default:
      return {
        method: 'cham_cash',
        methodNameAr: 'شام كاش (Cham Cash)',
        methodNameEn: 'Cham Cash',
        fullName: sellerName,
        phoneNumber: phone,
        city: city,
        branchOrAccount: isDamascus ? 'CHAM-9844-0129' : 'CHAM-7721-0348',
        instructionsAr: 'افتح تطبيق شام كاش وحول المبلغ إلى رقم الحساب أعلاه، ثم انسخ رقم العملية والصقه أدناه لتأكيد طلبك فوراً.',
        instructionsEn: 'Transfer via Cham Cash app to the account above, and paste the transaction reference below.',
      };
  }
}

export function createVendorOrderItem(data: {
  product_id: string;
  product_title: string;
  vendor_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  recipient_name: string;
  recipient_phone: string;
  delivery_address: string;
  city: string;
  quantity: number;
  unit_price: number;
  payment_method: string;
  receipt_number: string;
  receipt_image_url?: string;
}): VendorOrderItem {
  const newOrder: VendorOrderItem = {
    id: `item-${Date.now().toString().slice(-6)}`,
    order_id: `ord-${Date.now().toString().slice(-6)}`,
    order_number: `SND-${Date.now().toString().slice(-5)}-SY`,
    product_id: data.product_id,
    product_title: data.product_title,
    vendor_id: data.vendor_id || 'vendor-damascus-01',
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    customer_phone: data.customer_phone,
    recipient_name: data.recipient_name,
    recipient_phone: data.recipient_phone,
    delivery_address: data.delivery_address,
    city: data.city,
    quantity: data.quantity,
    unit_price: data.unit_price,
    total_price: data.quantity * data.unit_price,
    platform_fee: 0,
    net_vendor_amount: data.quantity * data.unit_price,
    payment_method: data.payment_method,
    receipt_number: data.receipt_number,
    receipt_image_url: data.receipt_image_url,
    status: 'pending_verification',
    created_at: new Date().toISOString(),
  };
  vendorOrderItems = [newOrder, ...vendorOrderItems];
  return newOrder;
}

