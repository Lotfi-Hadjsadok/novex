import type { ArabicDialect, CopyLanguage } from "@/types/landing-page";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogle } from "@langchain/google";
import { z } from "zod";
import { fileToBase64 } from "@/lib/utils";

export const adCreativeCopyRules = {
  headline:    "Hero headline specific to THIS product. Max 5 words — short, punchy, scroll-stopping.",
  subheadline: "Supporting text expanding the headline. Max 10 words. Specific to this product.",
  tag:         "Short product category label. Keep minimal. Use empty string if none.",
  badgeText:   "Use null by default. Only set if there is a real promotional label (e.g. –20% OFF).",
  featureText: "2–4 word feature label. Specific to the product. Not generic marketing.",
  featureVisual: "One clear visual concept for this feature. Concise visual phrase.",
  cta:         "Call-to-action button text. 2–4 words. Specific to this product.",
  price:       "Price as shown or inferred. Use empty string if unknown.",
  shopInfo:    "Optional trust line (e.g. Free shipping · 30-day returns). Null if not needed.",
} as const;

export const adCreativeCopySchema = z.object({
  headline:    z.string().describe(adCreativeCopyRules.headline),
  subheadline: z.string().describe(adCreativeCopyRules.subheadline),
  tag:         z.string().describe(adCreativeCopyRules.tag),
  badge_text:  z.string().nullable().describe(adCreativeCopyRules.badgeText),
  features: z
    .array(
      z.object({
        text:   z.string().describe(adCreativeCopyRules.featureText),
        visual: z.string().describe(adCreativeCopyRules.featureVisual),
      })
    )
    .min(3)
    .max(4)
    .describe("3–4 compact product feature labels for the ad creative"),
  cta:       z.string().describe(adCreativeCopyRules.cta),
  price:     z.string().describe(adCreativeCopyRules.price),
  shop_info: z.string().nullable().describe(adCreativeCopyRules.shopInfo),
});

export type AdCreativeCopy = z.infer<typeof adCreativeCopySchema>;

const systemPrompt = `CRITICAL RULES — Analyze product images before writing:
- Identify the exact product type and sub-category (e.g. baggy jeans, baby sneakers, face serum for mature skin)
- Identify the target demographic (age group, gender, niche)
- All copy must reflect the actual product and its real audience — never write generic copy
- This is a SINGLE-PANEL social media ad. Copy must be ultra-concise and high-impact.`;

const userPrompt = `You are an elite direct-response copywriter. Write high-converting, scroll-stopping ad creative copy for a single-panel social media ad. The copy must be punchy, benefit-driven, and immediately clear.

{languageLine}
Price: {price}
Product name: {productName}`;

export async function generateAdCreativeCopy(
  language: CopyLanguage,
  dialect: ArabicDialect,
  price: string,
  productName: string,
  productImages: File[]
): Promise<AdCreativeCopy> {
  const imageContentBlocks = await Promise.all(
    productImages.map(async (file) => ({
      type: "image_url" as const,
      image_url: { url: `data:image/jpeg;base64,${await fileToBase64(file)}` },
    }))
  );

  const model = new ChatGoogle("gemini-2.5-flash");
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", userPrompt],
    ["human", imageContentBlocks],
  ]);

  const languageLine =
    language === "ar"
      ? `Language and dialect: ${language} ${dialect}`
      : `Language: ${language}`;

  const structured = model.withStructuredOutput(adCreativeCopySchema);
  const chain = prompt.pipe(structured as any);
  const result = await chain.invoke({ languageLine, price, productName });
  return result as AdCreativeCopy;
}
