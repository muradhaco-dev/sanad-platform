'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  LanguageInfo,
  SUPPORTED_LANGUAGES,
  translations,
  TranslationKey,
} from './translations';

interface LanguageContextType {
  lang: Language;
  dir: 'ltr' | 'rtl';
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
  currentLanguage: LanguageInfo;
  languages: LanguageInfo[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default is Arabic (العربية) - Default, RTL
  const [lang, setLangState] = useState<Language>('ar');

  useEffect(() => {
    // Check saved language preference from localStorage or cookie
    const saved = localStorage.getItem('sanad_lang') as Language;
    const isValid = SUPPORTED_LANGUAGES.some((l) => l.code === saved);

    if (saved && isValid) {
      setLangState(saved);
      const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === saved);
      const newDir = langInfo?.dir || (saved === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.lang = saved;
      document.documentElement.dir = newDir;
    } else {
      // Default: Arabic, RTL
      setLangState('ar');
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
    }
  }, []);

  const setLang = (newLang: Language) => {
    const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === newLang);
    const newDir = langInfo?.dir || (newLang === 'ar' ? 'rtl' : 'ltr');

    setLangState(newLang);
    try {
      localStorage.setItem('sanad_lang', newLang);
      document.cookie = `sanad_lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // ignore storage errors
    }
    document.documentElement.lang = newLang;
    document.documentElement.dir = newDir;
  };

  const toggleLang = () => {
    // Quick toggle between primary RTL (ar) and primary LTR (en)
    setLang(lang === 'ar' ? 'en' : 'ar');
  };

  const t = (key: TranslationKey): string => {
    const activeDict = translations[lang] as Record<string, string> | undefined;
    if (activeDict && activeDict[key]) {
      return activeDict[key];
    }
    const enDict = translations['en'] as Record<string, string>;
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    const arDict = translations['ar'] as Record<string, string>;
    if (arDict && arDict[key]) {
      return arDict[key];
    }
    return String(key);
  };

  const currentLanguage: LanguageInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  const dir = currentLanguage.dir;

  return (
    <LanguageContext.Provider
      value={{
        lang,
        dir,
        setLang,
        toggleLang,
        t,
        currentLanguage,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      <div dir={dir} className="w-full">
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
