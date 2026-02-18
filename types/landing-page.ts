export type CopyLanguage = "en" | "fr" | "ar";
export type ArabicDialect = "standard" | "algerian" | "tunisian" | "moroccan";

export interface FeatureItem {
  visual?: string;
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

/** State for the landing page generator (input + output). */
export interface LandingPageState {
  productImageUrls: string[];
  language: CopyLanguage;
  dialect?: ArabicDialect;
  userFeatures?: string[];
  rawPriceLines?: string;
  copy?: CopyResult;
  features?: FeaturesResult;
  creative?: CreativeResult;
  generatedSectionImageUrls?: [string?, string?, string?];
  error?: string;
}

/** Alias for components that expect the same shape. */
export type LandingPageGraphState = LandingPageState;
