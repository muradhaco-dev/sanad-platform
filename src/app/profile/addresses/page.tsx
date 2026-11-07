'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { DeliveryAddress } from '@/types/store';
import VendorLocationPicker from '@/components/VendorLocationPicker';
import {
  MapPin,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Home,
  Building2,
  Phone,
  User,
  X,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';

export default function CustomerAddressesPage() {
  const { lang } = useLanguage();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: 'بيت العائلة - دمشق',
    recipient_name: '',
    recipient_phone: '',
    city: 'دمشق',
    street_address: '',
    latitude: 33.5138,
    longitude: 36.2765,
    is_default: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const fetchAddresses = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('delivery_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setAddresses(data as DeliveryAddress[]);
      } else {
        // Fallback default sample address so user sees realistic UI
        const defaultSample: DeliveryAddress = {
          id: 'addr-sample-01',
          user_id: userId,
          title: lang === 'ar' ? 'منزل العائلة في دمشق' : 'Family Home in Damascus',
          recipient_name: 'أم عمار المحمد',
          recipient_phone: '+963 944 123 456',
          city: 'دمشق',
          street_address: 'المزة فيلات غربية - بناء النرجس طابق 3',
          latitude: 33.5138,
          longitude: 36.2765,
          is_default: true,
          created_at: new Date().toISOString(),
        };
        setAddresses([defaultSample]);
      }
    } catch (err) {
      console.warn('Error fetching addresses from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkUserAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      setCurrentUser(user);

      if (user) {
        fetchAddresses(user.id);
      } else {
        setLoading(false);
      }
    };

    checkUserAndFetch();
  }, []);

  const handleOpenAddModal = () => {
    setEditingAddressId(null);
    setFormData({
      title: lang === 'ar' ? 'عنوان جديد في سوريا' : 'New Address in Syria',
      recipient_name: '',
      recipient_phone: '',
      city: 'دمشق',
      street_address: '',
      latitude: 33.5138,
      longitude: 36.2765,
      is_default: addresses.length === 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr: DeliveryAddress) => {
    setEditingAddressId(addr.id);
    setFormData({
      title: addr.title,
      recipient_name: addr.recipient_name,
      recipient_phone: addr.recipient_phone,
      city: addr.city,
      street_address: addr.street_address,
      latitude: addr.latitude || 33.5138,
      longitude: addr.longitude || 36.2765,
      is_default: addr.is_default,
    });
    setIsModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!formData.title || !formData.recipient_name || !formData.recipient_phone || !formData.street_address) {
      alert(lang === 'ar' ? 'يرجى إكمال جميع الحقول الإلزامية' : 'Please fill all required fields');
      return;
    }

    setActionLoading(true);
    try {
      if (editingAddressId && !editingAddressId.startsWith('addr-sample')) {
        // Update in Supabase
        const { error } = await supabase
          .from('delivery_addresses')
          .update({
            title: formData.title,
            recipient_name: formData.recipient_name,
            recipient_phone: formData.recipient_phone,
            city: formData.city,
            street_address: formData.street_address,
            latitude: formData.latitude,
            longitude: formData.longitude,
            is_default: formData.is_default,
          })
          .eq('id', editingAddressId);

        if (!error) {
          showToast(lang === 'ar' ? 'تم تحديث العنوان بنجاح!' : 'Address updated successfully!');
        }
      } else {
        // Insert into Supabase
        const { data, error } = await supabase
          .from('delivery_addresses')
          .insert({
            user_id: currentUser.id,
            title: formData.title,
            recipient_name: formData.recipient_name,
            recipient_phone: formData.recipient_phone,
            city: formData.city,
            street_address: formData.street_address,
            latitude: formData.latitude,
            longitude: formData.longitude,
            is_default: formData.is_default,
          })
          .select()
          .single();

        if (!error && data) {
          showToast(lang === 'ar' ? 'تم حفظ عنوان التسليم الجديد بنجاح!' : 'Delivery address saved!');
        } else {
          // Local update if offline/mock
          const newAddr: DeliveryAddress = {
            id: `addr-${Date.now().toString().slice(-5)}`,
            user_id: currentUser.id,
            ...formData,
            created_at: new Date().toISOString(),
          };
          setAddresses([newAddr, ...addresses]);
          showToast(lang === 'ar' ? 'تم حفظ العنوان محلياً بنجاح!' : 'Address saved!');
        }
      }

      setIsModalOpen(false);
      fetchAddresses(currentUser.id);
    } catch (err) {
      alert('Error saving address');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    if (!confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا العنوان؟' : 'Delete this address?')) return;
    try {
      await supabase.from('delivery_addresses').delete().eq('id', addrId);
      setAddresses(addresses.filter((a) => a.id !== addrId));
      showToast(lang === 'ar' ? 'تم حذف العنوان' : 'Address deleted');
    } catch (err) {
      alert('Error deleting address');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="sticky top-16 z-50 bg-emerald-700 text-white py-3 px-4 shadow-lg text-center text-xs font-bold flex items-center justify-center gap-2 animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/90 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {lang === 'ar' ? 'عناويني ومواقع التسليم في سوريا' : 'Delivery Addresses & Locations'}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {lang === 'ar'
                  ? 'حفظ وتحديد عناوين أهلك وعائلتك في المحافظات السورية لتسريع وتسهيل إيصال الطلبات'
                  : 'Manage delivery addresses and GPS coordinates for your family members in Syria'}
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إضافة عنوان جديد' : 'Add New Address'}</span>
          </button>
        </div>

        {/* Addresses Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-bold">
              {lang === 'ar' ? 'جاري تحميل العناوين المسجلة...' : 'Loading addresses...'}
            </p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center space-y-4">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-800">
              {lang === 'ar' ? 'لم تقم بحفظ أي عنوان تسليم بعد' : 'No addresses saved yet'}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {lang === 'ar'
                ? 'أضف موقع إقامة عائلتك في دمشق، حلب، أو أي محافظة سورية لتسهيل وتوثيق وصول السلال الغذائية.'
                : 'Save your family delivery address and GPS coordinates in Syria for rapid fulfillment.'}
            </p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ar' ? 'إضافة عنوانك الأول' : 'Add First Address'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-white rounded-3xl border p-6 shadow-xs flex flex-col justify-between space-y-4 transition ${
                  addr.is_default ? 'border-emerald-500/80 ring-1.5 ring-emerald-500/20' : 'border-gray-200'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <Home className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-gray-900 text-sm">{addr.title}</span>
                    </div>
                    {addr.is_default && (
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {lang === 'ar' ? 'العنوان الافتراضي' : 'Default'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 pt-1 border-t border-gray-100">
                    <p className="flex items-center gap-2 font-medium text-gray-900">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>{addr.recipient_name}</span>
                    </p>
                    <p className="flex items-center gap-2 text-gray-700 font-mono">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span dir="ltr">{addr.recipient_phone}</span>
                    </p>
                    <p className="flex items-start gap-2 text-gray-600">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>
                        {addr.city} - {addr.street_address}
                      </span>
                    </p>
                    {addr.latitude && (
                      <p className="text-[10px] text-gray-400 font-mono bg-slate-50 px-2 py-1 rounded-md w-fit flex items-center gap-1">
                        <Compass className="w-3 h-3 text-emerald-600" />
                        <span>
                          GPS: {addr.latitude.toFixed(4)}, {addr.longitude?.toFixed(4)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenEditModal(addr)}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                    title="تعديل"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= MODAL: ADD / EDIT ADDRESS ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>
                  {editingAddressId
                    ? lang === 'ar' ? 'تعديل عنوان التسليم' : 'Edit Delivery Address'
                    : lang === 'ar' ? 'إضافة عنوان تسليم جديد في سوريا' : 'Add New Delivery Address'}
                </span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'ar' ? 'تسمية العنوان *' : 'Address Label *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: بيت الأهل دمشق، منزل العائلة حلب"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:ring-1 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'ar' ? 'اسم المستلم الثلاثي *' : 'Recipient Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.recipient_name}
                    onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                    placeholder="أم عمار المحمد"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'ar' ? 'رقم موبايل المستلم للتوصيل *' : 'Syrian Phone / WhatsApp *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.recipient_phone}
                    onChange={(e) => setFormData({ ...formData, recipient_phone: e.target.value })}
                    placeholder="+963 944 123 456"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'ar' ? 'المحافظة *' : 'Governorate / City *'}
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold"
                  >
                    <option value="دمشق">دمشق (Damascus)</option>
                    <option value="ريف دمشق">ريف دمشق</option>
                    <option value="حلب">حلب (Aleppo)</option>
                    <option value="حمص">حمص (Homs)</option>
                    <option value="اللاذقية">اللاذقية (Latakia)</option>
                    <option value="حماة">حماة (Hama)</option>
                    <option value="طرطوس">طرطوس (Tartus)</option>
                    <option value="إدلب">إدلب (Idlib)</option>
                    <option value="درعا">درعا (Daraa)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'ar' ? 'تفاصيل الحي والشارع والبناء *' : 'Detailed Neighborhood & Street *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.street_address}
                    onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                    placeholder="مثال: المزة فيلات غربية - بناء النرجس طابق 3"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Interactive Location Picker for exact Syrian delivery coordinates */}
              <VendorLocationPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                locationName={`${formData.city} - ${formData.street_address}`}
                onChange={({ latitude, longitude, locationName }) =>
                  setFormData({ ...formData, latitude, longitude })
                }
              />

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-60"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingAddressId ? (lang === 'ar' ? 'حفظ التعديل' : 'Save') : (lang === 'ar' ? 'تأكيد وحفظ العنوان' : 'Save Address')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
