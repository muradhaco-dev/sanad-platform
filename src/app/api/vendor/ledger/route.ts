import { NextResponse } from 'next/server';
import { getVendorStats } from '@/lib/vendorStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId') || 'vendor-damascus-01';

    const stats = getVendorStats(vendorId);
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch vendor stats' }, { status: 500 });
  }
}
