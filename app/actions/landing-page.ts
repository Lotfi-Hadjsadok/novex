"use server";

import type { ArabicDialect, CopyLanguage } from "@/types/landing-page";

export type FormOptions = {
  languages: { value: CopyLanguage; label: string }[];
  arabicDialects: { value: ArabicDialect; label: string }[];
};

export async function getLandingPageFormOptions(): Promise<FormOptions> {
  return {
    languages: [
      { value: "en", label: "English" },
      { value: "fr", label: "French" },
      { value: "ar", label: "Arabic" },
    ],
    arabicDialects: [
      { value: "standard", label: "Standard" },
      { value: "algerian", label: "Algerian" },
      { value: "tunisian", label: "Tunisian" },
      { value: "moroccan", label: "Moroccan" },
    ],
  };
}
