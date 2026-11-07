'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { supabase, signOutUser } from '@/lib/supabaseClient';
import { UserRole } from '@/types/store';
import {
  ShoppingBag,
  Globe,
  User,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Package,
  Store,
  ChevronDown,
  Settings,
  MapPin,
  MoreVertical,
} from 'lucide-react';

export default function Navbar() {
  const { lang, toggleLang, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper to fetch user's strict role from Supabase database profiles table
  const fetchUserRole = async (userId: string, metadataRole?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!error && data?.role) {
        setUserRole(data.role as UserRole);
        return;
      }
    } catch (err) {
      console.warn('Error fetching role from Supabase profiles:', err);
    }

    // Fallback to metadata role if profiles row query is delayed or not yet populated
    if (metadataRole === 'admin' || metadataRole === 'vendor') {
      setUserRole(metadataRole as UserRole);
    } else {
      setUserRole('customer');
    }
  };

  useEffect(() => {
    // Check initial user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setAvatarError(false);
      if (currentUser) {
        fetchUserRole(currentUser.id, currentUser.user_metadata?.role);
      } else {
        setUserRole(null);
      }
    });

    // Listen to real-time auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setAvatarError(false);
      if (currentUser) {
        fetchUserRole(currentUser.id, currentUser.user_metadata?.role);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    setUserRole(null);
    setDropdownOpen(false);
    router.push('/');
  };

  // Extract Google avatar URL & display name if logged in
  const googleAvatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    user?.identities?.[0]?.identity_data?.avatar_url ||
    user?.identities?.[0]?.identity_data?.picture ||
    null;

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    '';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      {/* Top Banner: One-time purchase transparency */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>{t('oneTimePayment')}</span>
        <span className="hidden sm:inline text-slate-500">•</span>
        <span className="hidden sm:inline text-slate-400">{t('securePayment')}</span>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform">
            S
          </div>
          <div>
            <div className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-1.5">
              <span>{t('storeName')}</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-bold">
                1-TIME
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium hidden sm:block">
              {lang === 'ar' ? 'بضائع أساسية • بدون اشتراكات' : 'Direct Goods • No Subscriptions'}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 text-sm font-semibold text-gray-600">
          <Link
            href="/"
            className={`px-3 py-2 rounded-lg transition-colors ${
              pathname === '/'
                ? 'text-emerald-700 bg-emerald-50 font-bold'
                : 'hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {t('home')}
          </Link>

          <Link
            href="/products"
            className={`px-3 py-2 rounded-lg transition-colors ${
              pathname.startsWith('/products')
                ? 'text-emerald-700 bg-emerald-50 font-bold'
                : 'hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {t('products')}
          </Link>

          {/* STRICT RBAC ENFORCEMENT: ONLY visible to users with 'vendor' role */}
          {user && userRole === 'vendor' && (
            <Link
              href="/vendor"
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname.startsWith('/vendor')
                  ? 'text-amber-800 bg-amber-50 font-bold'
                  : 'hover:text-amber-800 hover:bg-amber-50/60 text-amber-700'
              }`}
            >
              <Store className="w-4 h-4 text-amber-600" />
              <span>{lang === 'ar' ? 'لوحة التاجر' : 'Vendor Dashboard'}</span>
            </Link>
          )}

          {/* STRICT RBAC ENFORCEMENT: ONLY visible to users with 'admin' role */}
          {user && userRole === 'admin' && (
            <Link
              href="/admin"
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname.startsWith('/admin')
                  ? 'text-slate-900 bg-slate-100 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t('adminPortal')}</span>
            </Link>
          )}
        </div>

        {/* Right Actions: Language Switcher, Vendor Button & Profile Dropdown */}
        <div className="flex items-center gap-2.5">
          {/* Language Toggle Button */}
          <button
            type="button"
            onClick={toggleLang}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 bg-gray-50 text-xs font-bold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            title="Switch Language / تغيير اللغة"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('langToggle')}</span>
          </button>

          {/* Prominent Vendor Dashboard Button (ONLY for vendor role) */}
          {user && userRole === 'vendor' && (
            <Link
              href="/vendor"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-xs hover:shadow transition"
            >
              <Store className="w-3.5 h-3.5 text-amber-200" />
              <span>{lang === 'ar' ? 'لوحة التاجر' : 'Vendor Dashboard'}</span>
            </Link>
          )}

          {/* User Auth Buttons / Profile Dropdown Menu */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              {/* Dropdown Trigger Button with Google Avatar */}
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-100/90 px-2.5 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                {/* Google Avatar or User icon */}
                {googleAvatarUrl && !avatarError ? (
                  <img
                    src={googleAvatarUrl}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                    className="w-6 h-6 rounded-full object-cover ring-1.5 ring-emerald-500 shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-[10px] font-black shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
                <span className="max-w-[100px] truncate hidden sm:inline">{displayName}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-500 transition-transform ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Functional Profile Dropdown Menu based on Role */}
              {dropdownOpen && (
                <div className="absolute end-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95">
                  {/* Identity Header */}
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="font-bold text-gray-900 text-xs truncate">{displayName}</p>
                    <p className="text-[11px] text-gray-400 truncate font-mono">{user.email}</p>
                    <div className="mt-1.5">
                      {userRole === 'vendor' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                          <Store className="w-3 h-3 text-amber-700" />
                          <span>{lang === 'ar' ? 'حساب تاجر معتمد' : 'Verified Vendor'}</span>
                        </span>
                      ) : userRole === 'admin' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>{lang === 'ar' ? 'مدير المنصة' : 'Admin'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                          <User className="w-3 h-3 text-emerald-700" />
                          <span>{lang === 'ar' ? 'حساب زبون (مشتري)' : 'Customer Account'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Real Functional Links based on User Role */}
                  <div className="py-1">
                    {/* 1. For Customer Role (Buyers) */}
                    {userRole !== 'vendor' && (
                      <>
                        <Link
                          href="/profile/orders"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 transition"
                        >
                          <ShoppingBag className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{lang === 'ar' ? 'مشترياتي (طلباتي السابقة)' : 'My Purchases'}</span>
                        </Link>

                        <Link
                          href="/profile/addresses"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 transition"
                        >
                          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{lang === 'ar' ? 'عناويني وموقعي في سوريا' : 'Delivery Addresses'}</span>
                        </Link>
                      </>
                    )}

                    {/* 2. For Vendor Role (Sellers) */}
                    {userRole === 'vendor' && (
                      <>
                        <Link
                          href="/vendor"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-amber-50 hover:text-amber-900 transition"
                        >
                          <Store className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{lang === 'ar' ? 'لوحة البائع' : 'Vendor Dashboard'}</span>
                        </Link>

                        <Link
                          href="/vendor/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-amber-50 hover:text-amber-900 transition"
                        >
                          <Settings className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{lang === 'ar' ? 'إعدادات المتجر والموقع' : 'Store Settings & Location'}</span>
                        </Link>
                      </>
                    )}

                    {/* 3. For Admin Role */}
                    {userRole === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-slate-100 hover:text-slate-900 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{lang === 'ar' ? 'لوحة إدارة المنصة' : 'Admin Operations'}</span>
                      </Link>
                    )}
                  </div>

                  {/* Logout Button */}
                  <div className="border-t border-gray-100 pt-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>{t('signOut')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="text-xs font-bold text-gray-700 hover:text-emerald-700 px-2.5 py-1.5 rounded-lg transition hidden sm:inline"
              >
                {t('signIn')}
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition"
              >
                <span>{t('signUp')}</span>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 md:hidden hover:bg-gray-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer (Strictly enforcing role-based visibility) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            {t('home')}
          </Link>
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            {t('products')}
          </Link>

          {/* Customer Links in Mobile */}
          {user && userRole !== 'vendor' && (
            <>
              <Link
                href="/profile/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-900"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'ar' ? 'مشترياتي (طلباتي السابقة)' : 'My Purchases'}</span>
              </Link>

              <Link
                href="/profile/addresses"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-900"
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'ar' ? 'عناويني وموقعي في سوريا' : 'Delivery Addresses'}</span>
              </Link>
            </>
          )}

          {/* Vendor Links in Mobile */}
          {user && userRole === 'vendor' && (
            <>
              <Link
                href="/vendor"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-amber-900 bg-amber-50 border border-amber-200"
              >
                <Store className="w-4 h-4 text-amber-600" />
                <span>{lang === 'ar' ? 'لوحة البائع' : 'Vendor Dashboard'}</span>
              </Link>

              <Link
                href="/vendor/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-amber-50"
              >
                <Settings className="w-4 h-4 text-amber-600" />
                <span>{lang === 'ar' ? 'إعدادات المتجر والموقع' : 'Store Settings & Location'}</span>
              </Link>
            </>
          )}

          {/* Admin Link in Mobile */}
          {user && userRole === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 bg-slate-100"
            >
              🛡️ {t('adminPortal')}
            </Link>
          )}

          {user ? (
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('signOut')}</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-gray-100 flex gap-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-lg text-xs font-bold border border-gray-200 text-gray-700"
              >
                {t('signIn')}
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white"
              >
                {t('signUp')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
