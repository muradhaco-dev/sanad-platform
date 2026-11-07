'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { signUpWithEmail, signInWithGoogle } from '@/lib/supabaseClient';
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Store,
  User,
  Zap,
  MailCheck,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

export default function SignUpPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();

  // Role Selection (Dual Signup: Customer vs Vendor)
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  const [storeName, setStoreName] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Submission & Success state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (password.length < 6) {
        throw new Error(
          lang === 'ar'
            ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
            : 'Password must be at least 6 characters'
        );
      }

      if (role === 'vendor' && !storeName.trim()) {
        throw new Error(
          lang === 'ar'
            ? 'يرجى كتابة اسم المتجر أو النشاط التجاري'
            : 'Please provide a store name'
        );
      }

      const { data, error } = await signUpWithEmail(email, password, {
        role,
        store_name: storeName.trim(),
        full_name: email.split('@')[0],
      });

      if (error) {
        throw error;
      }

      // Save role preference in local storage for callback redirection
      if (typeof window !== 'undefined') {
        localStorage.setItem('sanad_signup_role', role);
      }

      // Show confirmation screen
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || (lang === 'ar' ? 'فشل إنشاء الحساب' : 'Failed to create account'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Sign-in failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-xl shadow-md shadow-emerald-200 mb-2"
          >
            S
          </Link>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isSubmitted
              ? lang === 'ar'
                ? 'تأكيد الحساب عبر البريد'
                : 'Confirm Your Email'
              : t('authSignUpTitle')}
          </h2>
          <p className="text-xs text-slate-500">
            {isSubmitted
              ? lang === 'ar'
                ? 'تم إرسال رابط التفعيل إلى بريدك الإلكتروني'
                : 'Activation link has been sent to your email'
              : t('authSignUpSubtitle')}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SCREEN 1: SIGNUP FORM */}
        {!isSubmitted ? (
          <>
            {/* Dual-Signup Role Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {lang === 'ar' ? 'نوع الحساب المراد إنشاؤه:' : 'Select Account Type:'}
              </label>
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
                {/* Option 1: Customer */}
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                    role === 'customer'
                      ? 'bg-white text-emerald-800 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>{t('signUpAsCustomer')}</span>
                  </div>
                  <span className="text-[10px] font-normal text-slate-500 text-center">
                    {t('customerRoleDesc')}
                  </span>
                </button>

                {/* Option 2: Vendor */}
                <button
                  type="button"
                  onClick={() => setRole('vendor')}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                    role === 'vendor'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Store className="w-4 h-4" />
                    <span>{t('signUpAsVendor')}</span>
                  </div>
                  <span
                    className={`text-[10px] font-normal text-center ${
                      role === 'vendor' ? 'text-emerald-100' : 'text-slate-500'
                    }`}
                  >
                    {t('vendorRoleDesc')}
                  </span>
                </button>
              </div>
            </div>

            {/* Instant Activation Notice for Vendors */}
            {role === 'vendor' && (
              <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold">{t('instantActivationBadge')}</span>
              </div>
            )}

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.27v3.15C3.31 21.43 7.37 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.59H1.27C.46 8.21 0 10.05 0 12s.46 3.79 1.27 5.41l4.01-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.31 2.57 1.27 6.59l4.01 3.15c.95-2.84 3.6-4.99 6.72-4.99z"
                />
              </svg>
              <span>{t('continueWithGoogle')}</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px bg-slate-200 flex-1"></div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t('orContinueWith')}
              </span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Store Name input if Vendor */}
              {role === 'vendor' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('storeNameLabel')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-slate-400 absolute top-3 start-3" />
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder={t('storeNamePlaceholder')}
                      className="w-full text-xs border border-slate-200 rounded-xl py-2.5 ps-9 pe-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('emailLabel')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute top-3 start-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="w-full text-xs border border-slate-200 rounded-xl py-2.5 ps-9 pe-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('passwordLabel')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute top-3 start-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
                    className="w-full text-xs border border-slate-200 rounded-xl py-2.5 ps-9 pe-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  {lang === 'ar'
                    ? 'سيصلك رابط تأكيد فوري لتفعيل حسابك بأمان'
                    : 'A secure confirmation link will be emailed to activate your account'}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>
                  {role === 'vendor'
                    ? lang === 'ar'
                      ? 'إنشاء حساب المزود وتفعيل المتجر فوراً'
                      : 'Create Vendor Account (Instant Activation)'
                    : t('signUp')}
                </span>
              </button>
            </form>
          </>
        ) : (
          /* SCREEN 2: EMAIL LINK CONFIRMATION SUCCESS MESSAGE */
          <div className="text-center space-y-5 py-2">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner animate-in zoom-in">
              <MailCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-900">
                {lang === 'ar' ? 'تحقق من بريدك الإلكتروني' : 'Check Your Email'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto font-medium">
                {lang === 'ar'
                  ? 'يرجى التحقق من بريدك الإلكتروني والضغط على رابط التأكيد لتفعيل حسابك.'
                  : 'Please check your email and click the confirmation link to activate your account.'}
              </p>
            </div>

            {/* Email destination badge */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-800 break-all">
              {email}
            </div>

            {role === 'vendor' && (
              <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs text-start flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  {lang === 'ar'
                    ? 'بمجرد الضغط على الرابط، سيتم تفعيل حسابك كتاجر فوراً وتوجيهك إلى بوابة إضافة المنتجات وإدارة المحفظة.'
                    : 'Once you click the link, your vendor account is activated immediately with instant store access.'}
                </span>
              </div>
            )}

            <p className="text-[11px] text-slate-400">
              {lang === 'ar'
                ? 'لم تجد الرسالة؟ تفقد مجلد الرسائل غير المرغوب فيها (Spam / Junk).'
                : "Can't find the email? Please check your Spam or Junk folder."}
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/auth/login"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                {lang === 'ar' ? 'الانتقال لصفحة تسجيل الدخول' : 'Go to Sign In'}
              </Link>

              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer py-1"
              >
                {lang === 'ar' ? '← تغيير البريد الإلكتروني' : '← Change Email Address'}
              </button>
            </div>
          </div>
        )}

        {/* Footer Link */}
        {!isSubmitted && (
          <div className="text-center pt-2 border-t border-slate-100">
            <Link
              href="/auth/login"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              {t('alreadyHaveAccount')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
