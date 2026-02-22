"use server";

import { generateAdCopyAngles } from "@/lib/ai/ad-copies/generate-angles";
import { generateAdCopies }     from "@/lib/ai/ad-copies/generate-copies";
import type { CopyLanguage, ArabicDialect } from "@/types/landing-page";
import type { AdCopyTone, AdCopySize, CopyAngle, GeneratedCopy } from "@/types/ad-copies";

export async function generateAnglesAction(
  productImages: File[],
  language:      CopyLanguage,
  dialect:       ArabicDialect,
  tone:          AdCopyTone,
  price:         string,
  productName:   string,
  customPrompt?: string
): Promise<CopyAngle[]> {
  const angles = await generateAdCopyAngles(language, dialect, tone, price, productName, productImages, customPrompt);
  const seen = new Set<string>();
  return angles.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
}

export async function generateCopiesAction(
  productImages: File[],
  language:      CopyLanguage,
  dialect:       ArabicDialect,
  tone:          AdCopyTone,
  size:          AdCopySize,
  useEmojis:     boolean,
  price:         string,
  productName:   string,
  count:         number,
  angle:         CopyAngle,
  customPrompt?: string
): Promise<GeneratedCopy[]> {
  return await generateAdCopies(language, dialect, tone, size, useEmojis, price, productName, count, angle, productImages, customPrompt);
}
