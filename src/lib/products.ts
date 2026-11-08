import { Product } from '@/types/store';

// Hardcoded mock array deleted. All products are fetched directly from connected Supabase instance.
export const STORE_PRODUCTS: Product[] = [];

export function getProductBySlug(slug: string): Product | undefined {
  return undefined;
}
