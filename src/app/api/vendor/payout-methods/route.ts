import { NextResponse } from 'next/server';
import {
  getVendorPayoutMethods,
  addVendorPayoutMethod,
  deleteVendorPayoutMethod,
} from '@/lib/vendorStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId') || undefined;

    const methods = getVendorPayoutMethods(vendorId);
    return NextResponse.json({ success: true, methods });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch payout methods' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vendor_id, method_name, account_number, account_holder_name, phone_number, notes, is_default } = body;

    if (!vendor_id || !method_name || !account_number || !account_holder_name) {
      return NextResponse.json(
        { success: false, error: 'Vendor ID, Method Name, Account Number, and Holder Name are required' },
        { status: 400 }
      );
    }

    const newMethod = addVendorPayoutMethod({
      vendor_id,
      method_name,
      account_number,
      account_holder_name,
      phone_number: phone_number || '',
      notes: notes || '',
      is_default: Boolean(is_default),
    });

    return NextResponse.json({ success: true, method: newMethod });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to add payout method' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const methodId = searchParams.get('id');

    if (!methodId) {
      return NextResponse.json({ success: false, error: 'Method ID is required' }, { status: 400 });
    }

    const deleted = deleteVendorPayoutMethod(methodId);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete payout method' }, { status: 500 });
  }
}
