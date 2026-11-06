'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { signUpWithEmail, verifyEmailOtp, signInWithGoogle } from '@/lib/supabaseClient';
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Loader2,
  KeyRound,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function SignUpPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Step 1: 'form' | Step 2: 'otp_verification'
  const [step, setStep] = useState<'form' | 'otp_verification'>('form');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (password.length < 6) {
        throw new Error(lang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      }

      const { data, error } = await signUpWithEmail(email, password);

      if (error) {
        throw error;
      }

      // Transition to OTP verification step
      setStep('otp_verification');
      setSuccessMsg(
        lang === 'ar'
          ? `تم إرسال رمز التحقق المكون من 6 أرقام إلى: ${email}`
          : `A 6-digit verification code has been sent to: ${email}`
      );
    } catch (err: any) {
      setErrorMsg(err.message || (lang === 'ar' ? 'فشل إنشاء الحساب' : 'Failed to create account'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { data, error } = await verifyEmailOtp(email, otpCode.trim());

      if (error) {
        throw error;
      }

      // Success -> Redirect to customer dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(t('invalidOtp'));
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
          <Link href="/" className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-xl shadow-md shadow-emerald-200 mb-2">
            S
          </Link>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {step === 'form' ? t('authSignUpTitle') : t('verifyOtpTitle')}
          </h2>
          <p className="text-xs text-slate-500">
            {step === 'form' ? t('authSignUpSubtitle') : t('verifyOtpSubtitle')}
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Step 1: Initial Form */}
        {step === 'form' ? (
          <>
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
                    ? 'التحقق برمز البريد (OTP) مطلوب لمنع الحسابات الوهمية'
                    : 'Mandatory email OTP verification required to prevent spam'}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{t('signUp')}</span>
              </button>
            </form>
          </>
        ) : (
          /* Step 2: OTP Verification Form */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                {lang === 'ar' ? 'رمز التحقق (6 أرقام)' : '6-Digit Verification Code'}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute top-3 start-3" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center tracking-widest text-lg font-mono font-bold border border-slate-200 rounded-xl py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>{t('verifyCodeBtn')}</span>
            </button>

            <button
              type="button"
              onClick={() => setStep('form')}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              {lang === 'ar' ? '← العودة لتعديل البريد الإلكتروني' : '← Back to edit email'}
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <Link
            href="/auth/login"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            {t('alreadyHaveAccount')}
          </Link>
        </div>
      </div>
    </div>
  );
}
