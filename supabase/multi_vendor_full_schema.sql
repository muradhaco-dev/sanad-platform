-- ==============================================================================
-- SANAD MULTI-VENDOR MARKETPLACE: COMPREHENSIVE SUPABASE SCHEMA & RLS
-- Multi-Vendor Architecture: Products with Coordinates, Order Items with Vendor Attribution,
-- Syrian Local Payout Methods (Cham Cash, Al-Haram, Banks), and Vendor Withdrawals Ledger.
-- ==============================================================================

-- 1. Create User Roles Enum (if not exists)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'vendor', 'customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Profiles Table (Extending Supabase Auth)
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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to auto-create profile on user signup
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

-- 3. Products Table with Vendor ID and Geolocation
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
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    location_name TEXT,
    stock_status TEXT DEFAULT 'in_stock',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure latitude/longitude columns exist if table was already created
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS latitude NUMERIC(9, 6);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS longitude NUMERIC(9, 6);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS location_name TEXT;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

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

-- 4. Customer Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.profiles(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    delivery_address TEXT,
    city TEXT,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'paid', -- 'paid', 'pending', 'refunded'
    payment_gateway TEXT DEFAULT 'lemon_squeezy',
    lemon_order_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
CREATE POLICY "Customers can view own orders" 
ON public.orders FOR SELECT 
USING (
    auth.uid() = customer_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Order Items Table (Direct Vendor Attribution)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    product_id UUID REFERENCES public.products(id),
    vendor_id UUID REFERENCES public.profiles(id) NOT NULL,
    product_title TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    delivery_address TEXT,
    city TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) NOT NULL, -- 10% platform commission
    net_vendor_amount NUMERIC(10, 2) NOT NULL, -- Gross minus platform fee
    status TEXT NOT NULL DEFAULT 'paid', -- 'paid', 'processing', 'shipped', 'delivered'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors can view own order items" ON public.order_items;
CREATE POLICY "Vendors can view own order items" 
ON public.order_items FOR SELECT 
USING (
    auth.uid() = vendor_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Vendors can update order item status" ON public.order_items;
CREATE POLICY "Vendors can update order item status" 
ON public.order_items FOR UPDATE 
USING (
    auth.uid() = vendor_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 6. Vendor Local Syrian Payout Methods
-- Supports Cham Cash, Syriatel Cash, Al-Haram Hawala, and Syrian Commercial Banks
CREATE TABLE IF NOT EXISTS public.vendor_payout_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    method_name TEXT NOT NULL, -- 'Cham Cash', 'Syriatel Cash', 'Al-Haram', 'Bank of Syria and Overseas', 'Bemo Bank'
    account_number TEXT NOT NULL, -- Wallet ID, Phone Number, or IBAN/Account Number
    account_holder_name TEXT NOT NULL,
    phone_number TEXT,
    notes TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vendor_payout_methods ENABLE ROW LEVEL SECURITY;

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

-- 7. Withdrawals Ledger Table
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'rejected'
    payout_method_id UUID REFERENCES public.vendor_payout_methods(id),
    transaction_ref TEXT, -- Local transfer ref (رقم إشعار الحوالة في سوريا)
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    settled_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

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

-- ==============================================================================
-- 8. Helper View: Vendor Balance Calculator
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
