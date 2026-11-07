-- ==============================================================================
-- SANAD (سَنَد) MULTI-VENDOR PLATFORM: 100% BULLETPROOF SUPABASE SQL SCHEMA
-- Fixes: enum user_role, missing columns on pre-existing tables, RLS policies
-- ==============================================================================

-- 1. FIX ENUM / ROLE COLUMN SAFELY
-- If profiles table exists and uses an enum, convert it to text to prevent 'invalid input value' errors
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles ALTER COLUMN role TYPE text;
        ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'customer';
    END IF;
END $$;

-- ==============================================================================
-- 2. CREATE ALL TABLES IF THEY DO NOT EXIST
-- ==============================================================================

-- 2.1 Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    store_name TEXT,
    logo_url TEXT,
    city TEXT,
    phone TEXT,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    location_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    slug TEXT UNIQUE,
    title_en TEXT,
    title_ar TEXT NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'food',
    image_url TEXT,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    location_name TEXT,
    stock_status TEXT DEFAULT 'in_stock',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Orders Table (Supports Local Transfer Checkout: Al-Haram, Al-Fouad, Syriatel Cash, Cham Cash)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE,
    customer_id UUID REFERENCES public.profiles(id),
    user_id UUID REFERENCES public.profiles(id),
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    delivery_address TEXT,
    city TEXT,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'pending_verification',
    payment_method TEXT,
    receipt_number TEXT,
    receipt_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    order_number TEXT,
    product_id UUID REFERENCES public.products(id),
    vendor_id UUID REFERENCES public.profiles(id) NOT NULL,
    product_title TEXT NOT NULL,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    delivery_address TEXT,
    city TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    platform_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    net_vendor_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending_verification',
    payment_method TEXT,
    receipt_number TEXT,
    receipt_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 Vendor Payout Methods Table (Cham Cash, Al-Haram, Syriatel Cash, etc.)
CREATE TABLE IF NOT EXISTS public.vendor_payout_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    method_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_holder_name TEXT NOT NULL,
    phone_number TEXT,
    notes TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 Withdrawals Table
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    payout_method_id UUID REFERENCES public.vendor_payout_methods(id),
    transaction_ref TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    settled_by UUID REFERENCES public.profiles(id)
);

-- 2.7 Customer Delivery Addresses Table
CREATE TABLE IF NOT EXISTS public.delivery_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    city TEXT NOT NULL,
    street_address TEXT NOT NULL,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. GUARANTEE ALL COLUMNS EXIST ON PRE-EXISTING TABLES
-- (Prevents "column does not exist" errors when tables were created earlier)
-- ==============================================================================

-- Profiles columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude NUMERIC(9, 6);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude NUMERIC(9, 6);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_name TEXT;

-- Products columns
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS title_ar TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_usd NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'food';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS latitude NUMERIC(9, 6);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS longitude NUMERIC(9, 6);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS location_name TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_status TEXT DEFAULT 'in_stock';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Orders columns (Safeguard for customer_id, payment_method, receipt_number)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_id UUID;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending_verification';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS receipt_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS receipt_image_url TEXT;

-- Order items columns
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id);
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_title TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS total_price NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS net_vendor_amount NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_verification';
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS receipt_number TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS receipt_image_url TEXT;

-- Withdrawals columns
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS amount NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS payout_method_id UUID REFERENCES public.vendor_payout_methods(id);
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS transaction_ref TEXT;
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS settled_by UUID REFERENCES public.profiles(id);

-- ==============================================================================
-- 4. PROFILE CREATION TRIGGER (ON SIGNUP)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_payout_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_addresses ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 6.1 Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 6.2 Products Policies
DROP POLICY IF EXISTS "Active products viewable by everyone" ON public.products;
CREATE POLICY "Active products viewable by everyone" 
ON public.products FOR SELECT 
USING (is_active = true OR auth.uid() = vendor_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));

DROP POLICY IF EXISTS "Vendors can insert products" ON public.products;
CREATE POLICY "Vendors can insert products" 
ON public.products FOR INSERT 
WITH CHECK (
    auth.uid() = vendor_id AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('vendor', 'admin')
    )
);

DROP POLICY IF EXISTS "Vendors can update own products" ON public.products;
CREATE POLICY "Vendors can update own products" 
ON public.products FOR UPDATE 
USING (
    auth.uid() = vendor_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Vendors can delete own products" ON public.products;
CREATE POLICY "Vendors can delete own products" 
ON public.products FOR DELETE 
USING (
    auth.uid() = vendor_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 6.3 Orders Policies (Supports both customer_id and legacy user_id)
DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
CREATE POLICY "Customers can view own orders" 
ON public.orders FOR SELECT 
USING (
    auth.uid() = customer_id 
    OR auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- 6.4 Order Items Policies
DROP POLICY IF EXISTS "Vendors can view own order items" ON public.order_items;
CREATE POLICY "Vendors can view own order items" 
ON public.order_items FOR SELECT 
USING (
    auth.uid() = vendor_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
CREATE POLICY "Anyone can insert order items" 
ON public.order_items FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Vendors can update order item status" ON public.order_items;
CREATE POLICY "Vendors can update order item status" 
ON public.order_items FOR UPDATE 
USING (
    auth.uid() = vendor_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 6.5 Vendor Payout Methods Policies
DROP POLICY IF EXISTS "Vendors can view own payout methods" ON public.vendor_payout_methods;
CREATE POLICY "Vendors can view own payout methods" 
ON public.vendor_payout_methods FOR SELECT 
USING (
    auth.uid() = vendor_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Vendors can insert own payout methods" ON public.vendor_payout_methods;
CREATE POLICY "Vendors can insert own payout methods" 
ON public.vendor_payout_methods FOR INSERT 
WITH CHECK (
    auth.uid() = vendor_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('vendor', 'admin'))
);

DROP POLICY IF EXISTS "Vendors can update own payout methods" ON public.vendor_payout_methods;
CREATE POLICY "Vendors can update own payout methods" 
ON public.vendor_payout_methods FOR UPDATE 
USING (auth.uid() = vendor_id);

DROP POLICY IF EXISTS "Vendors can delete own payout methods" ON public.vendor_payout_methods;
CREATE POLICY "Vendors can delete own payout methods" 
ON public.vendor_payout_methods FOR DELETE 
USING (auth.uid() = vendor_id);

-- 6.6 Withdrawals Policies
DROP POLICY IF EXISTS "Vendors can view own withdrawals" ON public.withdrawals;
CREATE POLICY "Vendors can view own withdrawals" 
ON public.withdrawals FOR SELECT 
USING (
    auth.uid() = vendor_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Vendors can request withdrawals" ON public.withdrawals;
CREATE POLICY "Vendors can request withdrawals" 
ON public.withdrawals FOR INSERT 
WITH CHECK (
    auth.uid() = vendor_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('vendor', 'admin'))
);

DROP POLICY IF EXISTS "Admins can update withdrawals" ON public.withdrawals;
CREATE POLICY "Admins can update withdrawals" 
ON public.withdrawals FOR UPDATE 
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can view all withdrawals" ON public.withdrawals;
CREATE POLICY "Admins can view all withdrawals" 
ON public.withdrawals FOR SELECT 
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 6.7 Customer Delivery Addresses Policies
DROP POLICY IF EXISTS "Users can view own delivery addresses" ON public.delivery_addresses;
CREATE POLICY "Users can view own delivery addresses" 
ON public.delivery_addresses FOR SELECT 
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can insert own delivery addresses" ON public.delivery_addresses;
CREATE POLICY "Users can insert own delivery addresses" 
ON public.delivery_addresses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own delivery addresses" ON public.delivery_addresses;
CREATE POLICY "Users can update own delivery addresses" 
ON public.delivery_addresses FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own delivery addresses" ON public.delivery_addresses;
CREATE POLICY "Users can delete own delivery addresses" 
ON public.delivery_addresses FOR DELETE 
USING (auth.uid() = user_id);

-- ==============================================================================
-- 7. HELPER VIEW: VENDOR WALLET BALANCES
-- ==============================================================================
CREATE OR REPLACE VIEW public.vendor_wallet_balances AS
SELECT 
    p.id AS vendor_id,
    p.full_name,
    p.store_name,
    p.city,
    p.phone,
    COALESCE(sales.total_gross_sales, 0) AS total_gross_sales,
    COALESCE(sales.total_platform_fees, 0) AS total_platform_fees,
    COALESCE(sales.total_net_earnings, 0) AS total_net_earnings,
    COALESCE(withdrawn.total_paid_withdrawals, 0) AS total_paid_withdrawals,
    COALESCE(withdrawn.total_pending_withdrawals, 0) AS total_pending_withdrawals,
    (COALESCE(sales.total_net_earnings, 0) - COALESCE(withdrawn.total_paid_withdrawals, 0) - COALESCE(withdrawn.total_pending_withdrawals, 0)) AS available_balance
FROM public.profiles p
LEFT JOIN (
    SELECT 
        vendor_id,
        SUM(total_price) AS total_gross_sales,
        SUM(platform_fee) AS total_platform_fees,
        SUM(net_vendor_amount) AS total_net_earnings
    FROM public.order_items
    WHERE status != 'refunded'
    GROUP BY vendor_id
) sales ON sales.vendor_id = p.id
LEFT JOIN (
    SELECT 
        vendor_id,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS total_paid_withdrawals,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS total_pending_withdrawals
    FROM public.withdrawals
    GROUP BY vendor_id
) withdrawn ON withdrawn.vendor_id = p.id
WHERE p.role IN ('vendor', 'admin');
