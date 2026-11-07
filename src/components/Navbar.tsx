'use client';

import { useState, useEffect } from 'react';
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
  Store
} from 'lucide-react';

export default function Navbar() {
  const { lang, toggleLang, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

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

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    setUserRole(null);
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

          {/* Customer Dashboard: Visible to authenticated users */}
          {user && (
            <Link
              href="/dashboard"
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname === '/dashboard'
                  ? 'text-emerald-700 bg-emerald-50 font-bold'
                  : 'hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>{t('dashboard')}</span>
            </Link>
          )}

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
              <span>{t('vendorPortal')}</span>
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

        {/* Right Actions: Language Switcher & Auth */}
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

          {/* User Auth Buttons with Google Profile Picture Avatar */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs"
              >
                {/* 1. Google Avatar or User icon */}
                {googleAvatarUrl && !avatarError ? (
                  <img
                    src={googleAvatarUrl}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                    className="w-5 h-5 rounded-full object-cover ring-1.5 ring-emerald-500 shrink-0"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-[10px] font-black shrink-0">
                    <User className="w-3 h-3" />
                  </div>
                )}
                <span className="max-w-[110px] truncate">{displayName}</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title={t('signOut')}
              >
                <LogOut className="w-4 h-4" />
              </button>
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

          {/* Mobile menu button */}
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

          {/* Vendor Portal: ONLY if user role is strictly 'vendor' */}
          {user && userRole === 'vendor' && (
            <Link
              href="/vendor"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-amber-800 bg-amber-50/70"
            >
              🏪 {t('vendorPortal')}
            </Link>
          )}

          {/* Admin Portal: ONLY if user role is strictly 'admin' */}
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
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50"
              >
                {googleAvatarUrl && !avatarError ? (
                  <img
                    src={googleAvatarUrl}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-500 shrink-0"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span>{t('dashboard')} ({displayName})</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                {t('signOut')}
              </button>
            </>
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
