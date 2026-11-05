'use client';

import { useState, useEffect } from 'react';
import { Order, Service } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import OrderModal from '@/components/OrderModal';
import ServiceCard from '@/components/ServiceCard';
import Link from 'next/link';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  Sparkles
} from 'lucide-react';

export default function ExpatriateDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'catalog'>('orders');

  const fetchOrdersAndServices = async () => {
    setLoading(true);
    try {
      const [ordersRes, servicesRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/services')
      ]);

      const ordersData = await ordersRes.json();
      const servicesData = await servicesRes.json();

      if (ordersData.success) {
        setOrders(ordersData.orders);
      }
      if (servicesData.success) {
        setServices(servicesData.services);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndServices();
  }, []);

  const totalSpent = orders
    .filter((o) => ['paid', 'processing', 'completed'].includes(o.status))
    .reduce((sum, o) => sum + (Number(o.total_usd) || 0), 0);

  const activeDeliveries = orders.filter((o) =>
    ['paid', 'processing'].includes(o.status)
  ).length;

  const completedDeliveries = orders.filter((o) => o.status === 'completed').length;

  const handleOpenOrderModal = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleOrderSuccess = () => {
    fetchOrdersAndServices();
    setActiveTab('orders');
  };

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16" dir="rtl">
      {/* Dashboard Top Banner */}
      <div className="bg-emerald-800 text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-emerald-900 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-200 mb-1">
              <span>لوحة تحكم المغترب</span>
              <span>•</span>
              <span>سند للاحتياجات الأسرية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">أهلاً بك، يمكنك متابعة طلبات عائلتك هنا</h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
              جميع التحديثات الميدانية في سوريا تنعكس هنا بشكل لحظي
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrdersAndServices}
              className="inline-flex items-center gap-1.5 bg-emerald-700/60 hover:bg-emerald-700 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-emerald-600/50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث البيانات</span>
            </button>

            <button
              onClick={() => {
                if (services.length > 0) handleOpenOrderModal(services[0]);
              }}
              className="inline-flex items-center gap-1.5 bg-white text-emerald-900 hover:bg-emerald-50 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>طلب باقة جديدة</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 font-medium">إجمالي الدعم المدفوع</div>
              <div className="text-2xl font-black text-gray-900 mt-1">${totalSpent} USD</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                ≈ {(totalSpent * 14800).toLocaleString('ar-SY')} ل.س
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 font-medium">طلبات جارية في الميدان</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{activeDeliveries}</div>
              <div className="text-[11px] text-amber-700 font-semibold mt-0.5">بانتظار التجهيز والتسليم</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 font-medium">طلبات تم تسليمها بنجاح</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">{completedDeliveries}</div>
              <div className="text-[11px] text-gray-400 font-semibold mt-0.5">موثقة مع الأهل في الداخل</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>سجل طلبات العائلة ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'catalog'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>تصفح الباقات والإرسال الفوري</span>
          </button>
        </div>

        {/* Tab Content: Orders List */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-800">لا يوجد طلبات مسجلة حتى الآن</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  اختر باقة الدعم الغذائية أو الطبية لأهلك في سوريا وسيظهر سجل التوصيل هنا
                </p>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                  <span>تصفح الباقات الآن</span>
                </button>
              </div>
            ) : (
              orders.map((order) => {
                const serviceTitle = order.service?.title || 'باقة احتياجات عائلية';

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-black flex items-center justify-center text-xs">
                          سَنَد
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-900">{serviceTitle}</h3>
                            <span className="text-[11px] font-mono text-gray-400">#{order.id}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {new Date(order.created_at).toLocaleDateString('ar-SY', {
                                dateStyle: 'medium'
                              })}
                            </span>
                            {order.lemon_squeezy_order_id && (
                              <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-600">
                                Lemon: {order.lemon_squeezy_order_id}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-left">
                          <div className="text-lg font-black text-gray-900">${order.total_usd} USD</div>
                          <div className="text-[10px] text-gray-400">
                            ≈ {(order.total_usd * 14800).toLocaleString('ar-SY')} ل.س
                          </div>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                      <div className="text-[11px] font-bold text-gray-600 mb-2">مراحل التنفيذ الميداني:</div>
                      <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                        <div
                          className={`p-2 rounded-lg font-bold flex items-center justify-center gap-1.5 ${
                            ['paid', 'processing', 'completed'].includes(order.status)
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>1. تم استلام الدفع</span>
                        </div>

                        <div
                          className={`p-2 rounded-lg font-bold flex items-center justify-center gap-1.5 ${
                            ['processing', 'completed'].includes(order.status)
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>2. جاري التجهيز والتوصيل</span>
                        </div>

                        <div
                          className={`p-2 rounded-lg font-bold flex items-center justify-center gap-1.5 ${
                            order.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>3. تم التسليم للأهل</span>
                        </div>
                      </div>
                    </div>

                    {/* Beneficiary Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600 bg-gray-50/50 p-3 rounded-xl">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-800">المستلم:</span>
                        <span>{order.beneficiary_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span dir="ltr">{order.beneficiary_phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:col-span-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="line-clamp-1">
                          {order.beneficiary_city} - {order.beneficiary_address}
                        </span>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="text-[11px] text-gray-500 mt-2 bg-yellow-50/70 border border-yellow-200/60 p-2 rounded-lg">
                        <span className="font-bold text-yellow-900">ملاحظة التوصيل: </span>
                        <span>{order.notes}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab Content: Services Catalog */}
        {activeTab === 'catalog' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">اختر باقة لإرسالها لعائلتك</h2>
              <p className="text-xs text-gray-500">
                يتم التوصيل المباشر إلى باب المنزل في كافة المحافظات السورية
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onSelect={handleOpenOrderModal}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Order Modal */}
      <OrderModal
        service={selectedService}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  );
}
