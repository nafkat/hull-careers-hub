import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Language } from "./translations";

const STORAGE_KEY = "eurohull-lang";

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

function readSavedLang(): Language | null {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "el" || saved === "en" ? saved : null;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Always start at the default ("el") so SSR and first client render match;
  // the saved preference is applied after hydration to avoid mismatches.
  const [lang, setLangState] = useState<Language>("el");

  useEffect(() => {
    const saved = readSavedLang();
    if (saved && saved !== lang) setLangState(saved);
    document.documentElement.lang = saved ?? "el";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "el" ? "en" : "el");
  }, [lang, setLang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
