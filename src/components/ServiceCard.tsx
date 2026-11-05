'use client';

import { Service } from '@/types';
import { ShoppingBasket, HeartPulse, Droplets, Flame, Zap, ShieldAlert, ArrowLeft, Check } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
}

export default function ServiceCard({ service, onSelect }: ServiceCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food':
        return <ShoppingBasket className="w-5 h-5 text-emerald-600" />;
      case 'health':
        return <HeartPulse className="w-5 h-5 text-rose-600" />;
      case 'water':
        return <Droplets className="w-5 h-5 text-blue-600" />;
      case 'energy':
        return <Flame className="w-5 h-5 text-amber-600" />;
      case 'emergency':
        return <Zap className="w-5 h-5 text-purple-600" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-emerald-600" />;
    }
  };

  const estimatedSyp = (service.price_usd * 14800).toLocaleString('ar-SY');

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 hover:border-emerald-500/50 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      <div className="p-6">
        {/* Top meta */}
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 rounded-xl bg-gray-50 group-hover:bg-emerald-50 transition-colors">
            {getCategoryIcon(service.category)}
          </div>
          {service.badge && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {service.badge}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors mb-2">
          {service.title}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-4">
          {service.description}
        </p>

        {/* Included Items */}
        {service.items && service.items.length > 0 && (
          <div className="border-t border-gray-100 pt-3 mb-4 space-y-1.5">
            <div className="text-[11px] font-bold text-gray-700 mb-1">محتويات الباقة:</div>
            {service.items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-gray-600">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{item}</span>
              </div>
            ))}
            {service.items.length > 3 && (
              <span className="text-[10px] text-gray-400 font-semibold block pt-1">
                + {service.items.length - 3} أصناف إضافية
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Pricing & CTA */}
      <div className="p-6 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-gray-900">${service.price_usd}</span>
            <span className="text-xs font-semibold text-gray-500">USD</span>
          </div>
          <div className="text-[11px] font-semibold text-emerald-700">≈ {estimatedSyp} ل.س</div>
        </div>

        <button
          onClick={() => onSelect(service)}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all group/btn"
        >
          <span>طلب الباقة</span>
          <ArrowLeft className="w-3.5 h-3.5 group-hover/btn:-translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
