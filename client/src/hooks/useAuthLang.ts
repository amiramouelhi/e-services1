import { useCallback, useState } from "react";

export type Lang = "ar" | "fr";

const STORAGE_KEY = "otdav_auth_lang";

const readStoredLang = (): Lang => {
  if (typeof window === "undefined") return "ar";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "fr" ? "fr" : "ar";
};

export const useAuthLang = (): [Lang, (next: Lang) => void] => {
  const [lang, setLangState] = useState<Lang>(readStoredLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  return [lang, setLang];
};
