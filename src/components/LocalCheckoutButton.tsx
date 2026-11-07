'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import LocalTransferCheckoutModal from './LocalTransferCheckoutModal';

interface LocalCheckoutButtonProps {
  productId: string;
  productName: string;
  priceUSD: number;
  productImage?: string;
  vendorId?: string;
  vendorName?: string;
  className?: string;
  buttonText?: string;
  showMethodsBadge?: boolean;
}

export default function LocalCheckoutButton({
  productId,
  productName,
  priceUSD,
  productImage,
  vendorId,
  vendorName,
  className = '',
  buttonText,
  showMethodsBadge = true,
}: LocalCheckoutButtonProps) {
  const { lang } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={`space-y-1.5 ${className}`}>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full py-3.5 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-[0.99]"
        >
          <ShoppingBag className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
          <span>
            {buttonText ||
              (lang === 'ar'
                ? `شراء الآن ($${priceUSD}) • تحويل محلي`
                : `Buy Now ($${priceUSD}) • Local Transfer`)}
          </span>
          <ArrowRight
            className={`w-4 h-4 shrink-0 transition-transform ${
              lang === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'
            }`}
          />
        </button>

        {showMethodsBadge && (
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{lang === 'ar' ? 'شام كاش • سيريتل كاش • الهرم • الفؤاد' : 'Cham Cash • Syriatel • Al-Haram • Al-Fouad'}</span>
          </div>
        )}
      </div>

      <LocalTransferCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={{
          id: productId,
          title_ar: productName,
          title_en: productName,
          price_usd: priceUSD,
          image_url: productImage,
          vendor_id: vendorId,
          vendor_name: vendorName,
        }}
        onSuccess={() => {
          // Success handled in modal
        }}
      />
    </>
  );
}
