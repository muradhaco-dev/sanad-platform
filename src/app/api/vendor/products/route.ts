import { NextResponse } from 'next/server';
import { getVendorProducts, addVendorProduct, deleteVendorProduct } from '@/lib/vendorStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId') || undefined;

    const products = getVendorProducts(vendorId);
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch vendor products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title_en,
      title_ar,
      description_en,
      description_ar,
      price_usd,
      category,
      image_url,
      vendor_id,
      vendor_name,
    } = body;

    if (!title_en || !title_ar || !price_usd) {
      return NextResponse.json(
        { success: false, error: 'Title (EN & AR) and Price are required' },
        { status: 400 }
      );
    }

    const newProduct = addVendorProduct({
      slug: (title_en as string).toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4),
      title_en,
      title_ar,
      description_en: description_en || '',
      description_ar: description_ar || '',
      price_usd: Number(price_usd),
      category: category || 'food',
      image_url: image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
      items_en: ['High quality vendor verified items'],
      items_ar: ['أصناف ممتازة معتمدة من المزود المحلي'],
      specs_en: { 'Supplier': vendor_name || 'Syrian Verified Vendor' },
      specs_ar: { 'المورد': vendor_name || 'مزود سوري معتمد' },
      is_featured: false,
      stock_status: 'in_stock',
      vendor_id: vendor_id || 'vendor-damascus-01',
      vendor_name: vendor_name || 'مستودعات الشام الغذائية (دمشق)',
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    const deleted = deleteVendorProduct(productId);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
