import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import ProductDetailClient from '@/components/ProductDetailClient';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Query Supabase directly by slug or UUID
  const { data: productBySlug } = await supabase
    .from('products')
    .select('*')
    .eq('slug', id)
    .single();

  let product = productBySlug;

  if (!product) {
    const { data: productById } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    product = productById;
  }

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
