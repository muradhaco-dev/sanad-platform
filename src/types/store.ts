export type UserRole = 'admin' | 'vendor' | 'customer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  store_name?: string;
  city?: string;
  phone?: string;
  created_at: string;
}

export interface Product {
  id: string;
  slug: string;
  vendor_id?: string;
  vendor_name?: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  price_usd: number;
  category: 'food' | 'health' | 'energy' | 'winter';
  badge_en?: string;
  badge_ar?: string;
  image_url: string;
  items_en: string[];
  items_ar: string[];
  specs_en: Record<string, string>;
  specs_ar: Record<string, string>;
  is_featured: boolean;
  stock_status: 'in_stock' | 'low_stock';
  lemon_variant_id?: string;
  created_at?: string;
}

export interface StoreOrder {
  id: string;
  order_number: string;
  user_email: string;
  product_id: string;
  product_title_en: string;
  product_title_ar: string;
  amount_usd: number;
  status: 'completed' | 'processing' | 'shipped';
  created_at: string;
  receipt_url?: string;
  lemon_order_id?: string;
}

export interface SavedPaymentCard {
  id: string;
  brand: 'visa' | 'mastercard' | 'amex';
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export interface VendorLedgerEntry {
  id: string;
  vendor_id: string;
  vendor_name: string;
  order_id: string;
  product_title: string;
  gross_amount: number;
  platform_fee: number; // e.g. 10% platform commission
  net_vendor_amount: number;
  status: 'pending' | 'settled';
  settled_at?: string;
  payout_note?: string;
  created_at: string;
}

export interface VendorPayoutSummary {
  vendor_id: string;
  vendor_name: string;
  store_name: string;
  city: string;
  phone: string;
  total_gross_sales: number;
  total_platform_fees: number;
  pending_balance: number;
  settled_balance: number;
  last_settled_at?: string;
}
