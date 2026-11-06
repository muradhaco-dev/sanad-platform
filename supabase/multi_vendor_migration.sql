-- ==============================================================================
-- SANAD MULTI-VENDOR MARKETPLACE MIGRATION
-- Role-Based Access Control (RBAC), Products with Vendors, and Offline Payout Ledger
-- ==============================================================================

-- 1. Create User Role Enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'vendor', 'customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    store_name TEXT,
    city TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Automatic Profile Creation Trigger on Sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Products Table with Vendor ID
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    price_usd NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL DEFAULT 'food',
    image_url TEXT,
    stock_status TEXT DEFAULT 'in_stock',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS on Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Customers can view all active products
CREATE POLICY "Active products are viewable by everyone" 
ON public.products FOR SELECT 
USING (is_active = true);

-- Vendors can view all their own products (even inactive)
CREATE POLICY "Vendors can view their own products" 
ON public.products FOR SELECT 
USING (auth.uid() = vendor_id);

-- Vendors can insert their own products
CREATE POLICY "Vendors can insert products" 
ON public.products FOR INSERT 
WITH CHECK (
    auth.uid() = vendor_id AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('vendor', 'admin')
    )
);

-- Vendors can update their own products
CREATE POLICY "Vendors can update their own products" 
ON public.products FOR UPDATE 
USING (
    auth.uid() = vendor_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Vendors can delete their own products
CREATE POLICY "Vendors can delete their own products" 
ON public.products FOR DELETE 
USING (
    auth.uid() = vendor_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 5. Vendor Ledger / Payouts Table
CREATE TABLE IF NOT EXISTS public.vendor_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    order_id TEXT NOT NULL,
    product_title TEXT NOT NULL,
    gross_amount NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) NOT NULL, -- 10% platform commission
    net_vendor_amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'settled'
    settled_at TIMESTAMPTZ,
    settled_by UUID REFERENCES public.profiles(id),
    payout_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS on Vendor Ledger
ALTER TABLE public.vendor_ledger ENABLE ROW LEVEL SECURITY;

-- Vendors can view their own ledger entries
CREATE POLICY "Vendors can view own ledger" 
ON public.vendor_ledger FOR SELECT 
USING (auth.uid() = vendor_id);

-- Admins can view and update all ledger entries
CREATE POLICY "Admins have full access to ledger" 
ON public.vendor_ledger FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- 6. Order Items Table (Multi-Vendor Breakdown)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL,
    product_id UUID REFERENCES public.products(id),
    vendor_id UUID REFERENCES public.profiles(id) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view their own order items"
ON public.order_items FOR SELECT
USING (auth.uid() = vendor_id);

CREATE POLICY "Admins have full access to order items"
ON public.order_items FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);
