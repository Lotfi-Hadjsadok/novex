export type CopyLanguage = "en" | "fr" | "ar";
export type ArabicDialect = "standard" | "algerian" | "tunisian" | "moroccan";

export interface ImageData {
  type: "image_url";
  image_url: { url: string };
}

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

export interface FeatureItem {
  visual?: ImageData;
  text: string;
  description?: string;
}

export interface CopySection1 {
  headline: string;
  subheadline: string;
  tag: string;
  badge_text?: string | null;
}

export interface CopySection3 {
  headline: string;
  subheadline: string;
  cta: string;
  price: string;
  shop_info?: string | null;
}

export interface CopyResult {
  section_1: CopySection1;
  section_2: Record<string, unknown>;
  section_3: CopySection3;
}

export interface FeaturesResult {
  section_2: { features: FeatureItem[] };
}

export interface CreativeSpecSection {
  panel_goal?: string;
  panel_size?: "SQR" | "WIDE";
  panel_number?: number;
  accentColor?: string;
  text_content?: Record<string, unknown>;
  headline?: Record<string, unknown>;
  subheadline?: Record<string, unknown>;
  product?: Record<string, unknown>;
  features?: Record<string, unknown>;
  tag?: Record<string, unknown>;
  cta?: Record<string, unknown>;
  price?: Record<string, unknown>;
  composition_notes?: string;
  visual_prompt_english?: string;
  requires_product_reference?: boolean;
  background?: string;
}

export interface CreativeResult {
  background_motif?: string;
  theme?: Record<string, unknown>;
  global_directive?: Record<string, unknown>;
  section_1?: CreativeSpecSection;
  section_2?: CreativeSpecSection;
  section_3?: CreativeSpecSection;
}

export interface LandingPageState {
  productImages: ImageData[];
  language: CopyLanguage;
  dialect?: ArabicDialect;
  userFeatures?: string[];
  rawPriceLines?: string;
  copy?: CopyResult;
  features?: FeaturesResult;
  creative?: CreativeResult;
  generatedSectionImages?: [ImageData?, ImageData?, ImageData?];
  error?: string;
}

export type LandingPageGraphState = LandingPageState;
