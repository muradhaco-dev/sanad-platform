'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ShoppingBag, ShieldCheck, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    createLemonSqueezy?: () => void;
    LemonSqueezy?: {
      Url: {
        Open: (url: string) => void;
        Close: () => void;
      };
      Setup: (options: { eventHandler: (event: any) => void }) => void;
    };
  }
}

interface LemonCheckoutButtonProps {
  productId: string;
  productName: string;
  priceUSD: number;
  variantId?: string;
  userEmail?: string;
  className?: string;
}

export default function LemonCheckoutButton({
  productId,
  productName,
  priceUSD,
  variantId,
  userEmail,
  className = '',
}: LemonCheckoutButtonProps) {
  const { t, lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [lemonReady, setLemonReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.createLemonSqueezy) {
      window.createLemonSqueezy();
      setLemonReady(true);
    }
  }, []);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const storeBaseUrl = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_URL;
      const orderId = `ord-${Date.now().toString().slice(-6)}`;

      if (storeBaseUrl) {
        // Construct Lemon Squeezy checkout URL with overlay mode enabled
        const checkoutUrl = new URL(storeBaseUrl);
        checkoutUrl.searchParams.set('checkout[custom][product_id]', productId);
        checkoutUrl.searchParams.set('checkout[custom][order_id]', orderId);
        if (userEmail) {
          checkoutUrl.searchParams.set('checkout[email]', userEmail);
        }
        // Enable overlay
        checkoutUrl.searchParams.set('embed', '1');

        if (window.LemonSqueezy) {
          window.LemonSqueezy.Url.Open(checkoutUrl.toString());
        } else {
          window.location.href = checkoutUrl.toString();
        }
      } else {
        // High-fidelity instant demo simulation for immediate verification
        await new Promise((r) => setTimeout(r, 600));
        const confirmMsg =
          lang === 'ar'
            ? `محاكاة بوابة Lemon Squeezy للشراء لمرة واحدة:\n\nالمنتج: ${productName}\nالمبلغ: $${priceUSD} USD (دفع فردي، بدون اشتراك)\nمعرّف الطلب: #${orderId}\n\n(لتفعيل الدفع المالي الفعلي، أضف رابط متجر Lemon Squeezy في .env.local)`
            : `Lemon Squeezy One-Time Checkout Demo:\n\nProduct: ${productName}\nTotal: $${priceUSD} USD (Strictly One-Time, No Subscription)\nOrder ID: #${orderId}\n\n(To enable live checkout, set NEXT_PUBLIC_LEMON_SQUEEZY_STORE_URL in .env.local)`;
        
        alert(confirmMsg);
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://assets.lemonsqueezy.com/lemon.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (window.createLemonSqueezy) {
            window.createLemonSqueezy();
            setLemonReady(true);
          }
        }}
      />

      <button
        type="button"
        disabled={loading}
        onClick={handleCheckout}
        className={`w-full inline-flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.99] bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer ${className}`}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ShoppingBag className="w-5 h-5 shrink-0" />
        )}
        <span>{t('buyNow')} (${priceUSD})</span>
      </button>
    </>
  );
}
