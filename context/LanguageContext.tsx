"use client";

import { createContext, useContext, useEffect } from "react";
import en, { TranslationKeys } from "@/locales/en";

type Lang = "en";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKeys, replacements?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => en[key],
  isRTL: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // This storefront is intentionally English-only.
  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.setAttribute("lang", "en");
  }, []);

  const t = (key: TranslationKeys, replacements?: Record<string, string | number>): string => {
    let str = en[key] ?? key;
    if (replacements) {
      for (const [token, value] of Object.entries(replacements)) {
        str = str.replace(`{${token}}`, String(value));
      }
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ lang: "en", setLang: () => {}, t, isRTL: false }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
