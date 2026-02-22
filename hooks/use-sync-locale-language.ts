"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import type { CopyLanguage } from "@/types/landing-page";

const VALID_LOCALES: CopyLanguage[] = ["en", "fr", "ar"];

export function useSyncLocaleLanguage(setLanguage: (language: CopyLanguage) => void) {
  const locale = useLocale();

  useEffect(() => {
    if (VALID_LOCALES.includes(locale as CopyLanguage)) {
      setLanguage(locale as CopyLanguage);
    }
  }, [locale, setLanguage]);
}
