export type UserRole = 'expatriate' | 'provider';

export type OrderStatus = 'pending_payment' | 'paid' | 'processing' | 'completed' | 'cancelled';

export interface Service {
  id: string;
  title: string;
  description: string;
  category: 'food' | 'health' | 'energy' | 'water' | 'emergency';
  price_usd: number;
  items: string[];
  badge?: string;
  is_active: boolean;
  image_url?: string;
}

export interface Order {
  id: string;
  user_id: string;
  service_id: string;
  provider_id?: string;
  status: OrderStatus;
  total_usd: number;
  beneficiary_name: string;
  beneficiary_phone: string;
  beneficiary_city: string;
  beneficiary_address: string;
  notes?: string;
  receipt_number?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  service?: Service;
}

export interface BeneficiaryFormData {
  service_id: string;
  beneficiary_name: string;
  beneficiary_phone: string;
  beneficiary_city: string;
  beneficiary_address: string;
  notes?: string;
}
