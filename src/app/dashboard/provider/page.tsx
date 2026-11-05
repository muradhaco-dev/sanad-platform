'use client';

import { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/types';
import { SYRIAN_CITIES } from '@/lib/mockData';
import StatusBadge from '@/components/StatusBadge';
import ProviderStatusButton from '@/components/ProviderStatusButton';
import {
  Truck,
  Phone,
  MessageCircle,
  MapPin,
  RefreshCw,
  Filter,
  CheckCircle2,
  Wifi,
  WifiOff,
  Bell,
  Clock,
  Sparkles
} from 'lucide-react';

export default function ProviderDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isOnline, setIsOnline] = useState(true);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const fetchProviderOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders?role=provider');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching provider orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderOrders();

    // Monitor network connectivity in Syria
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleStatusUpdated = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    setNotificationMsg(`تم تحديث حالة الطلب #${orderId} إلى: ${nextStatus === 'processing' ? 'قيد التجهيز' : 'مكتمل'}`);
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  // Format Syrian phone for WhatsApp (e.g. 0944123456 -> 963944123456)
  const formatWhatsappUrl = (phone: string, beneficiaryName: string, serviceTitle: string) => {
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '963' + clean.slice(1);
    if (!clean.startsWith('963')) clean = '963' + clean;

    const msg = encodeURIComponent(
      `مرحباً ${beneficiaryName}، معكم فريق التوصيل الميداني لمنصة 'سَنَد'. نود إبلاغكم بتجهيز باقة (${serviceTitle}) المرسلة لكم من الخارج لتحديد موعد التسليم.`
    );
    return `https://wa.me/${clean}?text=${msg}`;
  };

  const filteredOrders = orders.filter((o) => {
    const cityMatch = selectedCity === 'all' || o.beneficiary_city === selectedCity;
    const statusMatch = statusFilter === 'all' || o.status === statusFilter;
    return cityMatch && statusMatch;
  });

  const pendingCount = orders.filter((o) => o.status === 'paid').length;
  const processingCount = orders.filter((o) => o.status === 'processing').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-100/70 pb-20" dir="rtl">
      {/* Top Notification Toast */}
      {notificationMsg && (
        <div className="sticky top-16 z-50 bg-emerald-700 text-white py-2.5 px-4 shadow text-center text-xs font-bold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Header for Syrian Field Ops */}
      <div className="bg-amber-700 text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-amber-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-900/70 px-2 py-0.5 rounded text-[11px] font-bold text-amber-200">
                بوابة التوصيل الميداني - سوريا
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-black/20">
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3 text-emerald-300" /> متصل
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-rose-300" /> وضع غير متصل
                  </>
                )}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-1">
              المهام والطلبات المدفوعة للتنفيذ
            </h1>
            <p className="text-xs text-amber-100/90 mt-0.5">
              استلم الطلبات المدفوعة، تواصل مع العائلات عبر الهاتف أو واتساب، وحدث حالة التسليم
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProviderOrders}
              className="inline-flex items-center gap-1.5 bg-amber-800/80 hover:bg-amber-800 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-amber-600/50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث المهام</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Metric Badges */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div
            onClick={() => setStatusFilter(statusFilter === 'paid' ? 'all' : 'paid')}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              statusFilter === 'paid'
                ? 'bg-emerald-50 border-emerald-400 shadow-xs'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-[11px] text-gray-500 font-semibold flex items-center justify-between">
              <span>مدفوع (جاهز للتجهيز)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{pendingCount}</div>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'processing' ? 'all' : 'processing')}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              statusFilter === 'processing'
                ? 'bg-amber-50 border-amber-400 shadow-xs'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-[11px] text-gray-500 font-semibold">قيد التوصيل الميداني</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{processingCount}</div>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              statusFilter === 'completed'
                ? 'bg-blue-50 border-blue-400 shadow-xs'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-[11px] text-gray-500 font-semibold">مكتمل وتم التسليم</div>
            <div className="text-2xl font-black text-blue-700 mt-1">{completedCount}</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="font-bold text-gray-700">تصفية حسب المحافظة:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">جميع المحافظات ({orders.length})</option>
              {SYRIAN_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="text-amber-700 font-bold hover:underline"
            >
              إلغاء فلتر الحالة (عرض الكل)
            </button>
          )}
        </div>

        {/* Orders Cards Grid */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
              <Truck className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-gray-800">لا توجد طلبات مطابقة للفلتر المحدد</h3>
              <p className="text-xs text-gray-500 mt-1">
                بمجرد قيام المغترب بالدفع عبر Lemon Squeezy سيهبط الطلب هنا آلياً
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const serviceTitle = order.service?.title || 'باقة احتياجات عائلية';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:border-amber-300 transition-colors"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-gray-900">{serviceTitle}</h3>
                          <span className="text-[11px] font-mono text-gray-400">#{order.id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {new Date(order.created_at).toLocaleTimeString('ar-SY', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span>•</span>
                          <span className="font-bold text-emerald-700">${order.total_usd} USD مدفوع</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={order.status} size="sm" />
                      <ProviderStatusButton
                        orderId={order.id}
                        currentStatus={order.status}
                        onStatusUpdated={handleStatusUpdated}
                      />
                    </div>
                  </div>

                  {/* Beneficiary Details & Quick Action buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/40 p-4 rounded-xl border border-amber-100/70 text-xs">
                    <div className="space-y-1.5">
                      <div>
                        <span className="text-gray-500 font-medium">اسم المستلم: </span>
                        <span className="font-bold text-gray-900">{order.beneficiary_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span className="font-bold text-gray-800">{order.beneficiary_city}: </span>
                        <span className="text-gray-700">{order.beneficiary_address}</span>
                      </div>
                      {order.notes && (
                        <div className="text-[11px] bg-white p-2 rounded-lg border border-amber-200/60 text-amber-950 font-medium">
                          ⚡ <span className="font-bold">ملاحظة المغترب:</span> {order.notes}
                        </div>
                      )}
                    </div>

                    {/* Direct Contact Actions for Syrian Driver / Provider */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-2">
                      {/* WhatsApp Call / Chat */}
                      <a
                        href={formatWhatsappUrl(order.beneficiary_phone, order.beneficiary_name, serviceTitle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-xs transition"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>فتح واتساب</span>
                      </a>

                      {/* Direct Phone Call */}
                      <a
                        href={`tel:${order.beneficiary_phone}`}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-3.5 py-2 rounded-xl font-bold text-xs transition"
                      >
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span dir="ltr">{order.beneficiary_phone}</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
