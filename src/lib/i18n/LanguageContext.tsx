'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from './translations';

interface LanguageContextType {
  lang: Language;
  dir: 'ltr' | 'rtl';
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    // Check saved language preference or browser setting
    const saved = localStorage.getItem('sanad_lang') as Language;
    if (saved === 'ar' || saved === 'en') {
      setLangState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
    } else {
      // Default is English
      setLangState('en');
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('sanad_lang', newLang);
    document.cookie = `sanad_lang=${newLang}; path=/; max-age=31536000`;
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'ar' : 'en');
  };

  const t = (key: keyof typeof translations['en']): string => {
    const dict = translations[lang] || translations['en'];
    return dict[key] || translations['en'][key] || String(key);
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, toggleLang, t }}>
      <div className={lang === 'ar' ? 'font-sans' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
