import { OrderStatus } from '@/types';
import { Clock, CheckCircle2, Truck, AlertCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  switch (status) {
    case 'paid':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>مدفوع (بانتظار المزود)</span>
        </span>
      );
    case 'processing':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <Truck className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
          <span>قيد التجهيز والتوصيل</span>
        </span>
      );
    case 'completed':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          <span>تم التسليم بنجاح</span>
        </span>
      );
    case 'pending_payment':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-gray-100 text-gray-700 border border-gray-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <span>بانتظار الدفع</span>
        </span>
      );
    case 'cancelled':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-red-50 text-red-700 border border-red-200 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-red-500" />
          <span>ملغي</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-gray-100 text-gray-700 ${sizeClasses}`}>
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{status}</span>
        </span>
      );
  }
}
