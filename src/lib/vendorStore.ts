import { Product, VendorLedgerEntry, VendorPayoutSummary } from '@/types/store';
import { STORE_PRODUCTS } from './products';

// Mock in-memory state for vendor products & offline payouts
let vendorProducts: Product[] = [
  ...STORE_PRODUCTS.map((p, idx) => ({
    ...p,
    vendor_id: idx % 2 === 0 ? 'vendor-damascus-01' : 'vendor-aleppo-02',
    vendor_name: idx % 2 === 0 ? 'مستودعات الشام الغذائية (دمشق)' : 'مؤسسة الشهباء للرعاية (حلب)',
  })),
];

let vendorLedger: VendorLedgerEntry[] = [
  {
    id: 'led-101',
    vendor_id: 'vendor-damascus-01',
    vendor_name: 'مستودعات الشام الغذائية (دمشق)',
    order_id: 'LS-90184-SANAD',
    product_title: 'السلة الغذائية العائلية الشاملة',
    gross_amount: 55.00,
    platform_fee: 5.50, // 10% commission
    net_vendor_amount: 49.50,
    status: 'pending',
    created_at: '2026-11-04T12:00:00Z',
  },
  {
    id: 'led-102',
    vendor_id: 'vendor-damascus-01',
    vendor_name: 'مستودعات الشام الغذائية (دمشق)',
    order_id: 'LS-90220-SANAD',
    product_title: 'السلة الغذائية العائلية الشاملة',
    gross_amount: 55.00,
    platform_fee: 5.50,
    net_vendor_amount: 49.50,
    status: 'settled',
    settled_at: '2026-11-03T18:00:00Z',
    payout_note: 'حوالة مكتب الفؤاد دمشق - كود #88190',
    created_at: '2026-11-02T10:00:00Z',
  },
  {
    id: 'led-103',
    vendor_id: 'vendor-aleppo-02',
    vendor_name: 'مؤسسة الشهباء للرعاية (حلب)',
    order_id: 'LS-90312-SANAD',
    product_title: 'باقة الرعاية الصحية وأدوية كبار السن',
    gross_amount: 42.00,
    platform_fee: 4.20,
    net_vendor_amount: 37.80,
    status: 'pending',
    created_at: '2026-11-05T14:30:00Z',
  },
  {
    id: 'led-104',
    vendor_id: 'vendor-aleppo-02',
    vendor_name: 'مؤسسة الشهباء للرعاية (حلب)',
    order_id: 'LS-90355-SANAD',
    product_title: 'محطة طاقة شمسية وإنارة طوارئ منزلية',
    gross_amount: 89.00,
    platform_fee: 8.90,
    net_vendor_amount: 80.10,
    status: 'pending',
    created_at: '2026-11-05T16:00:00Z',
  },
];

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

export function deleteVendorProduct(productId: string): boolean {
  const initialLen = vendorProducts.length;
  vendorProducts = vendorProducts.filter((p) => p.id !== productId && p.slug !== productId);
  return vendorProducts.length < initialLen;
}

export function getVendorLedger(vendorId?: string): VendorLedgerEntry[] {
  if (!vendorId) return vendorLedger;
  return vendorLedger.filter((l) => l.vendor_id === vendorId);
}

export function getVendorStats(vendorId: string) {
  const entries = getVendorLedger(vendorId);
  const totalGross = entries.reduce((acc, curr) => acc + curr.gross_amount, 0);
  const totalFees = entries.reduce((acc, curr) => acc + curr.platform_fee, 0);
  const pendingBalance = entries
    .filter((e) => e.status === 'pending')
    .reduce((acc, curr) => acc + curr.net_vendor_amount, 0);
  const settledBalance = entries
    .filter((e) => e.status === 'settled')
    .reduce((acc, curr) => acc + curr.net_vendor_amount, 0);

  return {
    totalGross,
    totalFees,
    pendingBalance,
    settledBalance,
    entries,
  };
}

export function getAllVendorsPayoutSummary(): VendorPayoutSummary[] {
  const vendorsMap: Record<string, VendorPayoutSummary> = {
    'vendor-damascus-01': {
      vendor_id: 'vendor-damascus-01',
      vendor_name: 'أبو أحمد الشامي',
      store_name: 'مستودعات الشام الغذائية (دمشق)',
      city: 'دمشق',
      phone: '+963 944 112 233',
      total_gross_sales: 0,
      total_platform_fees: 0,
      pending_balance: 0,
      settled_balance: 0,
      last_settled_at: '2026-11-03T18:00:00Z',
    },
    'vendor-aleppo-02': {
      vendor_id: 'vendor-aleppo-02',
      vendor_name: 'د. مصطفى الحلبي',
      store_name: 'مؤسسة الشهباء للرعاية (حلب)',
      city: 'حلب',
      phone: '+963 933 556 778',
      total_gross_sales: 0,
      total_platform_fees: 0,
      pending_balance: 0,
      settled_balance: 0,
      last_settled_at: undefined,
    },
  };

  for (const entry of vendorLedger) {
    if (!vendorsMap[entry.vendor_id]) {
      vendorsMap[entry.vendor_id] = {
        vendor_id: entry.vendor_id,
        vendor_name: entry.vendor_name,
        store_name: entry.vendor_name,
        city: 'سوريا',
        phone: '+963 900 000 000',
        total_gross_sales: 0,
        total_platform_fees: 0,
        pending_balance: 0,
        settled_balance: 0,
      };
    }

    const v = vendorsMap[entry.vendor_id];
    v.total_gross_sales += entry.gross_amount;
    v.total_platform_fees += entry.platform_fee;
    if (entry.status === 'pending') {
      v.pending_balance += entry.net_vendor_amount;
    } else {
      v.settled_balance += entry.net_vendor_amount;
    }
  }

  return Object.values(vendorsMap);
}

export function settleVendorPendingBalance(vendorId: string, payoutNote?: string): number {
  let settledAmount = 0;
  const now = new Date().toISOString();

  vendorLedger = vendorLedger.map((entry) => {
    if (entry.vendor_id === vendorId && entry.status === 'pending') {
      settledAmount += entry.net_vendor_amount;
      return {
        ...entry,
        status: 'settled',
        settled_at: now,
        payout_note: payoutNote || 'تم التسليم كاش بموجب إشعار حوالة داخلية في سوريا',
      };
    }
    return entry;
  });

  return settledAmount;
}
