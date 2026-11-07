import { NextResponse } from 'next/server';
import {
  getVendorWithdrawals,
  requestVendorWithdrawal,
  calculateVendorWallet,
} from '@/lib/vendorStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json({ success: false, error: 'Vendor ID is required' }, { status: 400 });
    }

    const withdrawals = getVendorWithdrawals(vendorId);
    const wallet = calculateVendorWallet(vendorId);

    return NextResponse.json({
      success: true,
      withdrawals,
      wallet,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch vendor withdrawals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vendor_id, amount, payout_method_id, vendor_name, store_name } = body;

    if (!vendor_id || !amount || !payout_method_id) {
      return NextResponse.json(
        { success: false, error: 'Vendor ID, amount, and payout_method_id are required' },
        { status: 400 }
      );
    }

    const result = requestVendorWithdrawal(
      vendor_id,
      Number(amount),
      payout_method_id,
      vendor_name,
      store_name
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    const wallet = calculateVendorWallet(vendor_id);

    return NextResponse.json({
      success: true,
      withdrawal: result.withdrawal,
      wallet,
      message: 'Withdrawal request created successfully',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to process withdrawal' }, { status: 500 });
  }
}
