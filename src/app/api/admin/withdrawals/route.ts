import { NextResponse } from 'next/server';
import {
  getAllWithdrawalRequests,
  settleWithdrawalRequest,
  getAllVendorsPayoutSummary,
} from '@/lib/vendorStore';

export async function GET() {
  try {
    const withdrawals = getAllWithdrawalRequests();
    const vendors = getAllVendorsPayoutSummary();

    const pendingTotal = withdrawals
      .filter((w) => w.status === 'pending')
      .reduce((sum, w) => sum + w.amount, 0);

    const paidTotal = withdrawals
      .filter((w) => w.status === 'paid')
      .reduce((sum, w) => sum + w.amount, 0);

    return NextResponse.json({
      success: true,
      withdrawals,
      vendors,
      stats: {
        pendingCount: withdrawals.filter((w) => w.status === 'pending').length,
        pendingTotal,
        paidTotal,
        totalRequests: withdrawals.length,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch admin withdrawals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { withdrawal_id, transaction_ref, notes, admin_id } = body;

    if (!withdrawal_id || !transaction_ref) {
      return NextResponse.json(
        { success: false, error: 'withdrawal_id and transaction_ref (رقم إشعار الحوالة) are required' },
        { status: 400 }
      );
    }

    const result = settleWithdrawalRequest(withdrawal_id, transaction_ref, notes, admin_id);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    const updatedWithdrawals = getAllWithdrawalRequests();

    return NextResponse.json({
      success: true,
      withdrawal: result.withdrawal,
      withdrawals: updatedWithdrawals,
      message: 'Withdrawal marked as paid successfully',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to settle withdrawal' }, { status: 500 });
  }
}
