import { INITIAL_SERVICES, INITIAL_ORDERS } from './mockData';
import { Service, Order, OrderStatus } from '@/types';

// In-memory store for Next.js API layer (Starts empty - real data in Supabase)
let inMemoryServices: Service[] = [];
let inMemoryOrders: Order[] = [];

export function getServices(): Service[] {
  return inMemoryServices;
}

export function updateServicePrice(serviceId: string, newPrice: number): boolean {
  const service = inMemoryServices.find((s) => s.id === serviceId);
  if (service) {
    service.price_usd = newPrice;
    return true;
  }
  return false;
}

export function getOrders(): Order[] {
  return inMemoryOrders;
}

export function getOrderById(orderId: string): Order | undefined {
  return inMemoryOrders.find((o) => o.id === orderId);
}

export function createOrder(data: {
  service_id: string;
  beneficiary_name: string;
  beneficiary_phone: string;
  beneficiary_city: string;
  beneficiary_address: string;
  notes?: string;
  user_id?: string;
  simulatePaid?: boolean;
}): Order {
  const service = inMemoryServices.find((s) => s.id === data.service_id) || inMemoryServices[0];
  const newOrder: Order = {
    id: `ord-${Date.now().toString().slice(-5)}`,
    user_id: data.user_id || 'usr-exp-demo',
    service_id: data.service_id,
    status: data.simulatePaid ? 'paid' : 'pending_payment',
    total_usd: service.price_usd,
    beneficiary_name: data.beneficiary_name,
    beneficiary_phone: data.beneficiary_phone,
    beneficiary_city: data.beneficiary_city,
    beneficiary_address: data.beneficiary_address,
    notes: data.notes || '',
    receipt_number: data.simulatePaid ? 'DEMO-RECEIPT' : undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    service
  };

  inMemoryOrders = [newOrder, ...inMemoryOrders];
  return newOrder;
}

export function updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
  const order = inMemoryOrders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    order.updated_at = new Date().toISOString();
    return order;
  }
  return null;
}
