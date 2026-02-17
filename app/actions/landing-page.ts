"use server";

import type {
  CopyLanguage,
  ArabicDialect,
  LandingPageState,
  CopyResult,
  FeaturesResult,
  CreativeResult,
  FeatureItem,
} from "@/lib/landing-page/types";

export type GenerateLandingPageInput = {
  productImageUrls: string[];
  language: CopyLanguage;
  dialect?: ArabicDialect;
  userFeatures?: string[];
  rawPriceLines?: string;
};

/**
 * Server action: build landing page state from user input (no AI).
 * Returns state with placeholder copy/features and product images used for sections.
 */
export async function generateLandingPage(
  input: GenerateLandingPageInput
): Promise<LandingPageState> {
  const imageUrls = input.productImageUrls?.length ? input.productImageUrls : [];
  if (!imageUrls.length) {
    throw new Error("At least one product image is required");
  }

  const features: FeatureItem[] = (input.userFeatures ?? []).map((text) => ({
    text: text.trim(),
  }));

  const price = input.rawPriceLines?.trim() ?? "—";
  const copy: CopyResult = {
    section_1: {
      headline: "Your Product",
      subheadline: "Describe your product here.",
      tag: "New",
    },
    section_2: {},
    section_3: {
      headline: "Get yours today",
      subheadline: "Add to cart or visit our store.",
      cta: "Shop now",
      price,
    },
  };

  const featuresResult: FeaturesResult =
    features.length > 0 ? { section_2: { features } } : { section_2: { features: [] } };

  const creative: CreativeResult = {
    theme: { accentColor: "hsl(var(--primary))" },
  };

  const generatedSectionImageUrls: [string?, string?, string?] = [
    imageUrls[0],
    imageUrls[1] ?? imageUrls[0],
    imageUrls[2] ?? imageUrls[0],
  ];

  return {
    productImageUrls: imageUrls,
    language: input.language,
    dialect: input.dialect,
    userFeatures: input.userFeatures,
    rawPriceLines: input.rawPriceLines,
    copy,
    features: featuresResult,
    creative,
    generatedSectionImageUrls,
  };
}
