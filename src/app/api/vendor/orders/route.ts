import { NextResponse } from 'next/server';
import { getVendorOrderItems, updateOrderItemStatus } from '@/lib/vendorStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId') || undefined;

    const orders = getVendorOrderItems(vendorId);
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch vendor orders' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { itemId, status } = body;

    if (!itemId || !status) {
      return NextResponse.json({ success: false, error: 'itemId and status are required' }, { status: 400 });
    }

    const updated = updateOrderItemStatus(itemId, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Order item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update order status' }, { status: 500 });
  }
}
