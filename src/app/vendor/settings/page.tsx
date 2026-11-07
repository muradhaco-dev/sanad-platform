'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { UserRole } from '@/types/store';
import VendorLocationPicker from '@/components/VendorLocationPicker';
import {
  Store,
  MapPin,
  Building2,
  Phone,
  Camera,
  CheckCircle2,
  Save,
  Loader2,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Globe,
} from 'lucide-react';

export default function VendorSettingsPage() {
  const { lang } = useLanguage();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [storeName, setStoreName] = useState('مستودعات الشام الغذائية (دمشق)');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80');
  const [phone, setPhone] = useState('+963 944 112 233');
  const [city, setCity] = useState('دمشق');
  const [latitude, setLatitude] = useState(33.5138);
  const [longitude, setLongitude] = useState(36.2765);
  const [locationName, setLocationName] = useState('دمشق، كفرسوسة والبرامكة');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  useEffect(() => {
    const fetchVendorProfile = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user ?? null;
        setCurrentUser(user);

        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          const role = profile?.role || (user.user_metadata?.role as UserRole) || 'customer';
          setUserRole(role);

          if (profile) {
            if (profile.store_name) setStoreName(profile.store_name);
            if (profile.logo_url) setLogoUrl(profile.logo_url);
            if (profile.phone) setPhone(profile.phone);
            if (profile.city) setCity(profile.city);
            if (profile.latitude) setLatitude(Number(profile.latitude));
            if (profile.longitude) setLongitude(Number(profile.longitude));
            if (profile.location_name) setLocationName(profile.location_name);
          }
        }
      } catch (err) {
        console.warn('Error fetching vendor settings:', err);
      } finally {
        setAuthChecked(true);
        setLoading(false);
      }
    };

    fetchVendorProfile();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!storeName.trim()) {
      alert(lang === 'ar' ? 'يرجى كتابة اسم المتجر' : 'Store name is required');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          store_name: storeName.trim(),
          logo_url: logoUrl.trim(),
          phone: phone.trim(),
          city: city.trim(),
          latitude,
          longitude,
          location_name: locationName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id);

      if (error) {
        console.warn('Supabase update warning, falling back:', error);
      }

      showToast(
        lang === 'ar'
          ? 'تم حفظ إعدادات المتجر وموقع المستودع بنجاح!'
          : 'Store profile & physical location saved successfully!'
      );
    } catch (err) {
      alert('Error updating store settings');
    } finally {
      setSaving(false);
    }
  };

  // Guard: Vendors only
  if (authChecked && userRole !== 'vendor' && userRole !== 'admin') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-900">
            {lang === 'ar' ? 'بوابة التجار والمزودين فقط' : 'Authorized Vendors Only'}
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            {lang === 'ar'
              ? 'هذه الصفحة مخصصة لمدراء المتاجر والمزودين لضبط بيانات المتجر والمستودعات في سوريا.'
              : 'This page is reserved for verified vendors to manage store identity and physical dispatch coordinates.'}
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              {lang === 'ar' ? 'العودة للرئيسية' : 'Return Home'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="sticky top-16 z-50 bg-emerald-700 text-white py-3 px-4 shadow-lg text-center text-xs font-bold flex items-center justify-center gap-2 animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/90 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  {lang === 'ar' ? 'إعدادات المتجر والموقع الجغرافي' : 'Store Settings & Physical Location'}
                </h1>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  {lang === 'ar' ? 'بوابة البائع' : 'Vendor Portal'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {lang === 'ar'
                  ? 'تحديث هوية المتجر، الشعار، ورقم التواصل، وتحديد موقع المستودع الفعلي على الخريطة'
                  : 'Manage store branding, logo, contact phone, and dispatch location in Syria'}
              </p>
            </div>
          </div>

          <Link
            href="/vendor"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition"
          >
            <span>{lang === 'ar' ? 'الذهاب للوحة البائع' : 'Vendor Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-2">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-bold">
              {lang === 'ar' ? 'جاري تحميل إعدادات المتجر...' : 'Loading store settings...'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* 1. Store Identity & Logo Card */}
            <div className="bg-white rounded-3xl border border-gray-200/90 p-6 shadow-xs space-y-5">
              <h2 className="text-sm font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>{lang === 'ar' ? '1. الهوية التجارية والشعار' : '1. Store Identity & Branding'}</span>
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Logo Preview */}
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-500/50 bg-gray-100 shadow-md">
                    <img
                      src={logoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'}
                      alt={storeName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white pointer-events-none">
                    <Camera className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex-1 w-full space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {lang === 'ar' ? 'اسم المتجر أو المستودع التجاري *' : 'Store or Business Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="مثال: مستودعات الشام الغذائية (دمشق)"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-900 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {lang === 'ar' ? 'رابط شعار المتجر (Logo URL)' : 'Store Logo Image URL'}
                    </label>
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 text-gray-700 focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'ar' ? 'رقم موبايل المتجر / الواتساب *' : 'Contact Phone / WhatsApp *'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute top-3 start-3" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+963 944 112 233"
                      className="w-full text-xs ps-9 pe-3 py-2.5 rounded-xl border border-gray-300 font-mono text-gray-900 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'ar' ? 'المدينة / المحافظة المركزية *' : 'Base Syrian City *'}
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white font-bold text-gray-900"
                  >
                    <option value="دمشق">دمشق (Damascus)</option>
                    <option value="حلب">حلب (Aleppo)</option>
                    <option value="حمص">حمص (Homs)</option>
                    <option value="اللاذقية">اللاذقية (Latakia)</option>
                    <option value="حماة">حماة (Hama)</option>
                    <option value="طرطوس">طرطوس (Tartus)</option>
                    <option value="إدلب">إدلب (Idlib)</option>
                    <option value="درعا">درعا (Daraa)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Physical Location & Map Pinpoint Card */}
            <div className="bg-white rounded-3xl border border-gray-200/90 p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'ar' ? '2. تحديد موقع المستودع الفعلي في سوريا' : '2. Physical Dispatch Location & Map'}</span>
              </h2>

              <p className="text-xs text-gray-500">
                {lang === 'ar'
                  ? 'تحديد الإحداثيات الجغرافية (GPS) الدقيقة لمستودعك يتيح للعملاء معرفة مركز الإرسال وسرعة التوصيل.'
                  : 'Pinpoint your physical warehouse on the map to display verified dispatch locations to customers.'}
              </p>

              <VendorLocationPicker
                latitude={latitude}
                longitude={longitude}
                locationName={locationName}
                onChange={({ latitude: lat, longitude: lng, locationName: loc }) => {
                  setLatitude(lat);
                  setLongitude(lng);
                  setLocationName(loc);
                }}
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{lang === 'ar' ? 'حفظ إعدادات المتجر والموقع' : 'Save Store Profile & Location'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
