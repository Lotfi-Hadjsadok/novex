"use server";

import { generateCopy, adCopyOutputSchema } from "@/lib/ai/product-landing-page/copy";
import type { ArabicDialect, CopyLanguage } from "@/types/landing-page";
import { generateFeatures, featuresOutputSchema } from "@/lib/ai/product-landing-page/features";
import { generateDesigner, mergeDesignerWithCopyAndFeatures } from "@/lib/ai/product-landing-page/designer";
import { generateCanvaImage } from "@/lib/ai/product-landing-page/canva";
import type { z } from "zod";

export async function generateCopyAndFeatures(
  productImages: File[],
  language: CopyLanguage,
  dialect: ArabicDialect,
  productName: string,
  price: string
) {
  const [copy, features] = await Promise.all([
    generateCopy(language, dialect, price, productName, productImages),
    generateFeatures(language, dialect, productImages),
  ]);
  return { copy, features };
}

export async function generateDesignAndImage(
  copy: z.infer<typeof adCopyOutputSchema>,
  features: z.infer<typeof featuresOutputSchema>,
  productImages: File[]
) {
  const designer = await generateDesigner(copy, features, productImages);
  const creative = mergeDesignerWithCopyAndFeatures(designer, copy, features);
  const { imageDataUrl } = await generateCanvaImage(
    creative,
    672,
    1584,
    productImages,
    copy,
    features,
    designer
  );
  return { creative, imageDataUrl };
}
