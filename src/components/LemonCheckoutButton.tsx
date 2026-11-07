'use client';

import React from 'react';
import LocalCheckoutButton from './LocalCheckoutButton';

interface LemonCheckoutButtonProps {
  productId: string;
  productName: string;
  priceUSD: number;
  variantId?: string;
  userEmail?: string;
  className?: string;
  productImage?: string;
  vendorId?: string;
  vendorName?: string;
}

/**
 * Replaced LemonCheckoutButton with 100% Syrian Local Transfer Checkout
 * (الهرم، الفؤاد، سيريتل كاش، شام كاش)
 * Completely eliminates Lemon Squeezy scripts, external overlays, and recurring cards.
 */
export default function LemonCheckoutButton({
  productId,
  productName,
  priceUSD,
  className = '',
  productImage,
  vendorId,
  vendorName,
}: LemonCheckoutButtonProps) {
  return (
    <LocalCheckoutButton
      productId={productId}
      productName={productName}
      priceUSD={priceUSD}
      productImage={productImage}
      vendorId={vendorId}
      vendorName={vendorName}
      className={className}
    />
  );
}
