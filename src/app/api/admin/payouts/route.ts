import { NextResponse } from 'next/server';
import { getAllVendorsPayoutSummary, settleVendorPendingBalance } from '@/lib/vendorStore';

export async function GET() {
  try {
    const vendors = getAllVendorsPayoutSummary();
    return NextResponse.json({ success: true, vendors });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch payout summaries' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vendor_id, payout_note } = body;

    if (!vendor_id) {
      return NextResponse.json({ success: false, error: 'vendor_id is required' }, { status: 400 });
    }

    const settledAmount = settleVendorPendingBalance(vendor_id, payout_note);
    const updatedVendors = getAllVendorsPayoutSummary();

    return NextResponse.json({
      success: true,
      settledAmount,
      vendors: updatedVendors,
      message: `Successfully settled $${settledAmount} for vendor ${vendor_id}`,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to settle balance' }, { status: 500 });
  }
}
