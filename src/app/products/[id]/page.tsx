import { notFound } from 'next/navigation';
import { STORE_PRODUCTS, getProductBySlug } from '@/lib/products';
import ProductDetailClient from '@/components/ProductDetailClient';

export function generateStaticParams() {
  return STORE_PRODUCTS.map((product) => ({
    id: product.slug,
  }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductBySlug(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
