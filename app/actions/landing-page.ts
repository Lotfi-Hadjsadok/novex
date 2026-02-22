"use server";

import { generateCopy, adCopyOutputSchema } from "@/lib/ai/product-landing-page/copy";
import type { ArabicDialect, CopyLanguage } from "@/types/landing-page";
import { generateFeatures, featuresOutputSchema } from "@/lib/ai/product-landing-page/features";
import { generateDesigner, mergeDesignerWithCopyAndFeatures, type DesignerOutput } from "@/lib/ai/product-landing-page/designer";
import { generateCanvaImage } from "@/lib/ai/product-landing-page/canva";
import type { z } from "zod";

export async function generateCopyAndFeatures(
  productImages: File[],
  language: CopyLanguage,
  dialect: ArabicDialect,
  productName: string,
  price: string,
  customPrompt?: string
) {
  const [copy, features] = await Promise.all([
    generateCopy(language, dialect, price, productName, productImages, customPrompt),
    generateFeatures(language, dialect, productImages, undefined, customPrompt),
  ]);
  return { copy, features };
}

export async function generateDesignerStep(
  copy: z.infer<typeof adCopyOutputSchema>,
  features: z.infer<typeof featuresOutputSchema>,
  productImages: File[],
  customPrompt?: string
): Promise<DesignerOutput> {
  return await generateDesigner(copy, features, productImages, customPrompt);
}

export async function generateImageStep(
  designer: DesignerOutput,
  copy: z.infer<typeof adCopyOutputSchema>,
  features: z.infer<typeof featuresOutputSchema>,
  productImages: File[],
  customPrompt?: string
) {
  const creative = mergeDesignerWithCopyAndFeatures(designer, copy, features);
  const { imageDataUrl } = await generateCanvaImage(
    creative,
    600,
    1584,
    productImages,
    copy,
    features,
    designer,
    customPrompt
  );
  return { creative, imageDataUrl };
}
