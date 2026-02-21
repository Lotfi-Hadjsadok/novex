"use server";

import { generateAdCreativeCopy } from "@/lib/ai/ad-creative/copy";
import { generateAdCreativeDesigner } from "@/lib/ai/ad-creative/designer";
import { generateAdCreativeImage } from "@/lib/ai/ad-creative/canva";
import type { AdCreativeCopy } from "@/lib/ai/ad-creative/copy";
import type { AdCreativeDesignerOutput } from "@/lib/ai/ad-creative/designer";
import type { CopyLanguage, ArabicDialect } from "@/types/landing-page";
import type { AdAspectRatio } from "@/types/ad-creative";
import { getRatioDimensions } from "@/types/ad-creative";

export async function generateAdCreativeCopyAction(
  productImages: File[],
  language: CopyLanguage,
  dialect: ArabicDialect,
  price: string,
  productName: string
): Promise<AdCreativeCopy> {
  return await generateAdCreativeCopy(language, dialect, price, productName, productImages);
}

export async function generateAdCreativeDesignerAction(
  copy: AdCreativeCopy,
  productImages: File[],
  aspectRatio: AdAspectRatio
): Promise<AdCreativeDesignerOutput> {
  const { width, height } = getRatioDimensions(aspectRatio);
  return await generateAdCreativeDesigner(copy, productImages, aspectRatio, width, height);
}

export async function generateAdCreativeImageAction(
  designer: AdCreativeDesignerOutput,
  copy: AdCreativeCopy,
  productImages: File[],
  aspectRatio: AdAspectRatio
): Promise<{ imageDataUrl: string | null }> {
  const { width, height } = getRatioDimensions(aspectRatio);
  return await generateAdCreativeImage(designer, copy, productImages, width, height);
}
