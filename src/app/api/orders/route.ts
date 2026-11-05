import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getOrders, createOrder, updateOrderStatus } from '@/lib/store';
import { OrderStatus } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // 'provider' or 'expatriate'

    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('orders').select('*, service:services(*)').order('created_at', { ascending: false });

      if (role === 'provider') {
        query = query.in('status', ['paid', 'processing', 'completed']);
      }

      const { data, error } = await query;
      if (!error && data) {
        return NextResponse.json({ success: true, orders: data, source: 'supabase' });
      }
    }

    let orders = getOrders();
    if (role === 'provider') {
      orders = orders.filter((o) => ['paid', 'processing', 'completed'].includes(o.status));
    }

    return NextResponse.json({ success: true, orders, source: 'local_store' });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, error: 'فشل في جلب الطلبات' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      service_id,
      beneficiary_name,
      beneficiary_phone,
      beneficiary_city,
      beneficiary_address,
      notes,
      simulatePaid
    } = body;

    if (!service_id || !beneficiary_name || !beneficiary_phone || !beneficiary_address) {
      return NextResponse.json(
        { success: false, error: 'يرجى تعبئة جميع الحقول الإلزامية للمستلم' },
        { status: 400 }
      );
    }

    // Try Supabase first if configured
    if (isSupabaseConfigured && supabase) {
      const { data: serviceData } = await supabase
        .from('services')
        .select('price_usd')
        .eq('id', service_id)
        .single();

      const total_usd = serviceData?.price_usd || 50;

      const { data: orderData, error } = await supabase
        .from('orders')
        .insert({
          service_id,
          total_usd,
          beneficiary_name,
          beneficiary_phone,
          beneficiary_city: beneficiary_city || 'دمشق',
          beneficiary_address,
          notes: notes || '',
          status: simulatePaid ? 'paid' : 'pending_payment'
        })
        .select()
        .single();

      if (!error && orderData) {
        return NextResponse.json({ success: true, order: orderData, source: 'supabase' });
      }
    }

    // Fallback store
    const newOrder = createOrder({
      service_id,
      beneficiary_name,
      beneficiary_phone,
      beneficiary_city: beneficiary_city || 'دمشق',
      beneficiary_address,
      notes,
      simulatePaid: Boolean(simulatePaid)
    });

    return NextResponse.json({ success: true, order: newOrder, source: 'local_store' });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ success: false, error: 'فشل في إنشاء الطلب' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { order_id, status } = body;

    if (!order_id || !status) {
      return NextResponse.json(
        { success: false, error: 'order_id و status مطلوبان' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', order_id)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, order: data, source: 'supabase' });
      }
    }

    const updated = updateOrderStatus(order_id, status as OrderStatus);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'الطلب غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated, source: 'local_store' });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, error: 'فشل في تحديث حالة الطلب' }, { status: 500 });
  }
}
