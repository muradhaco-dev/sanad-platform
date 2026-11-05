'use client';

import { useState } from 'react';
import { OrderStatus } from '@/types';
import { Truck, CheckCircle, Loader2 } from 'lucide-react';

interface ProviderStatusButtonProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusUpdated: (orderId: string, newStatus: OrderStatus) => void;
}

export default function ProviderStatusButton({
  orderId,
  currentStatus,
  onStatusUpdated
}: ProviderStatusButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (nextStatus: OrderStatus) => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          status: nextStatus
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onStatusUpdated(orderId, nextStatus);
      } else {
        alert(data.error || 'فشل في تحديث الحالة');
      }
    } catch (err) {
      alert('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus === 'paid') {
    return (
      <button
        disabled={loading}
        onClick={() => handleUpdate('processing')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-xs transition"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
        <span>بدء التجهيز</span>
      </button>
    );
  }

  if (currentStatus === 'processing') {
    return (
      <button
        disabled={loading}
        onClick={() => handleUpdate('completed')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs transition"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
        <span>تأكيد التسليم</span>
      </button>
    );
  }

  if (currentStatus === 'completed') {
    return (
      <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        <span>تم التسليم بنجاح</span>
      </span>
    );
  }

  return null;
}
