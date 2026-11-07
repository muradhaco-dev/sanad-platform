'use client';

import { useState } from 'react';
import { SYRIAN_CITIES_COORDINATES } from '@/lib/vendorStore';
import { MapPin, Navigation, Compass, Check } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface VendorLocationPickerProps {
  latitude: number;
  longitude: number;
  locationName: string;
  onChange: (coords: { latitude: number; longitude: number; locationName: string }) => void;
}

export default function VendorLocationPicker({
  latitude,
  longitude,
  locationName,
  onChange,
}: VendorLocationPickerProps) {
  const { lang } = useLanguage();
  const [selectedCity, setSelectedCity] = useState<string>('');

  const handleCitySelect = (cityObj: (typeof SYRIAN_CITIES_COORDINATES)[0]) => {
    setSelectedCity(cityObj.city_ar);
    onChange({
      latitude: cityObj.lat,
      longitude: cityObj.lng,
      locationName: `${cityObj.city_ar} - ${cityObj.address}`,
    });
  };

  // OpenStreetMap embed URL centered on coordinates
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.05}%2C${latitude - 0.05}%2C${longitude + 0.05}%2C${latitude + 0.05}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <div className="space-y-3 sm:space-y-4 rounded-2xl border border-gray-200 bg-slate-50/70 p-3 sm:p-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-900">
          <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{lang === 'ar' ? 'تحديد موقع المتجر / مستودع الإرسال' : 'Store & Dispatch Location'}</span>
        </div>
        <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500">
          {lang === 'ar' ? 'إحداثيات جغرافية دقيقة' : 'Precise GPS Coordinates'}
        </span>
      </div>

      {/* Quick City Presets */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-600">
          {lang === 'ar' ? 'اختر المحافظة السورية لتعبئة الإحداثيات فوراً:' : 'Quick Select Syrian Governorate:'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
          {SYRIAN_CITIES_COORDINATES.map((c) => {
            const isSelected =
              Math.abs(latitude - c.lat) < 0.01 && Math.abs(longitude - c.lng) < 0.01;
            return (
              <button
                key={c.city_en}
                type="button"
                onClick={() => handleCitySelect(c)}
                className={`flex items-center justify-between px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition border cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                }`}
              >
                <span className="truncate">{lang === 'ar' ? c.city_ar : c.city_en}</span>
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 shrink-0 ms-1" />
                ) : (
                  <Compass className="w-3.5 h-3.5 opacity-40 shrink-0 ms-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Map Visualizer */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-inner relative w-full">
        <iframe
          title="Dispatch Map"
          src={mapEmbedUrl}
          className="h-40 sm:h-48 w-full border-0"
          loading="lazy"
        />
        <div className="absolute top-2 end-2 bg-white/95 backdrop-blur-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] font-bold text-gray-800 shadow-xs flex items-center gap-1.5 border border-gray-200">
          <Navigation className="w-3 h-3 text-emerald-600 animate-pulse shrink-0" />
          <span>
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Coordinate & Address Input Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <div>
          <label className="mb-1 block text-[11px] sm:text-xs font-semibold text-gray-700">
            {lang === 'ar' ? 'خط العرض (Latitude)' : 'Latitude'}
          </label>
          <input
            type="number"
            step="0.000001"
            value={latitude}
            onChange={(e) =>
              onChange({
                latitude: parseFloat(e.target.value) || 0,
                longitude,
                locationName,
              })
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder="33.5138"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] sm:text-xs font-semibold text-gray-700">
            {lang === 'ar' ? 'خط الطول (Longitude)' : 'Longitude'}
          </label>
          <input
            type="number"
            step="0.000001"
            value={longitude}
            onChange={(e) =>
              onChange({
                latitude,
                longitude: parseFloat(e.target.value) || 0,
                locationName,
              })
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder="36.2765"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] sm:text-xs font-semibold text-gray-700">
            {lang === 'ar' ? 'عنوان المستودع / الحي' : 'Neighborhood / Hub'}
          </label>
          <input
            type="text"
            value={locationName}
            onChange={(e) =>
              onChange({
                latitude,
                longitude,
                locationName: e.target.value,
              })
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder={lang === 'ar' ? 'دمشق، كفرسوسة' : 'Damascus, Mezzeh'}
          />
        </div>
      </div>
    </div>
  );
}
