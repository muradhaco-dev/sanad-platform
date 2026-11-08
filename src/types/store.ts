export type UserRole = 'admin' | 'vendor' | 'customer';

export type LocalTransferMethod = 'al_haram' | 'al_fouad' | 'syriatel_cash' | 'cham_cash';

export interface SellerTransferDetail {
  method: LocalTransferMethod;
  methodNameAr: string;
  methodNameEn: string;
  fullName: string;
  phoneNumber: string;
  city: string;
  branchOrAccount: string;
  instructionsAr: string;
  instructionsEn: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  store_name?: string;
  logo_url?: string;
  city?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  created_at: string;
}

export interface DeliveryAddress {
  id: string;
  user_id: string;
  title: string;
  recipient_name: string;
  recipient_phone: string;
  city: string;
  street_address: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
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
  category: string;
  badge_en?: string;
  badge_ar?: string;
  image_url: string;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  items_en: string[];
  items_ar: string[];
  specs_en: Record<string, string>;
  specs_ar: Record<string, string>;
  is_featured: boolean;
  stock_status: 'in_stock' | 'low_stock';
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
  payment_method: LocalTransferMethod | string;
  receipt_number: string;
  receipt_image_url?: string;
  sender_name?: string;
  recipient_name: string;
  recipient_phone: string;
  delivery_city: string;
  delivery_address: string;
  status: 'pending_verification' | 'completed' | 'processing' | 'shipped';
  created_at: string;
}

export interface VendorPayoutMethod {
  id: string;
  vendor_id: string;
  method_name: string; // 'Cham Cash' | 'Syriatel Cash' | 'Al-Haram' | 'Al-Fouad' | string
  account_number: string;
  account_holder_name: string;
  phone_number?: string;
  notes?: string;
  is_default: boolean;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  vendor_id: string;
  vendor_name?: string;
  store_name?: string;
  amount: number;
  status: 'pending' | 'paid' | 'rejected';
  payout_method_id?: string;
  payout_method?: VendorPayoutMethod;
  transaction_ref?: string;
  admin_notes?: string;
  created_at: string;
  paid_at?: string;
  settled_by?: string;
}

export interface VendorOrderItem {
  id: string;
  order_id: string;
  order_number: string;
  product_id: string;
  product_title: string;
  vendor_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  recipient_name?: string;
  recipient_phone?: string;
  delivery_address?: string;
  city?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  platform_fee: number; // 0% or low humanitarian fee
  net_vendor_amount: number;
  payment_method?: LocalTransferMethod | string;
  receipt_number?: string;
  receipt_image_url?: string;
  status: 'pending_verification' | 'completed' | 'paid' | 'processing' | 'shipped' | 'delivered';
  created_at: string;
}

export interface VendorLedgerEntry {
  id: string;
  vendor_id: string;
  vendor_name: string;
  order_id: string;
  product_title: string;
  gross_amount: number;
  platform_fee: number;
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
