export type CopyLanguage = "en" | "fr" | "ar";
export type ArabicDialect = "standard" | "algerian" | "tunisian" | "moroccan";
export type Currency = "EUR" | "USD" | "DZD";

export const LANGUAGES: { value: CopyLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "ar", label: "Arabic" },
];

export const ARABIC_DIALECTS: { value: ArabicDialect; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "algerian", label: "Algerian" },
  { value: "tunisian", label: "Tunisian" },
  { value: "moroccan", label: "Moroccan" },
];

export const CURRENCIES: { value: Currency; label: string }[] = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "DZD", label: "DZD" },
];
