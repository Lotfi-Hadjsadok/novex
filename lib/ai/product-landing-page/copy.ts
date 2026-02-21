import { ArabicDialect, CopyLanguage } from "@/types/landing-page";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogle } from "@langchain/google";
import { z } from "zod";
import { fileToBase64 } from "@/lib/utils";

export const COPY_RULES = {
  tag: "Short product tag or category label; keep minimal. Use empty string if none.",
  price: "Price as shown or inferred from image; use empty string if unknown.",
  section1Headline: "Hero headline specific to THIS product. Never generic. Max 5 words—short, punchy, impactful.",
  section1Subheadline: "Supporting text expanding on the hero headline, specific to THIS product. Max 10 words.",
  section3Headline: "Short conversion headline. Max 5 words.",
  section3Subheadline: "Supporting line under section 3 headline. Max 8 words.",
  cta: "Call-to-action button text (2–5 words), specific to this product.",
  badgeText: "Use null by default—no badge. Only set if tag is non-empty and is a real promotional label.",
  shopInfo: "Optional shop/trust line (e.g. shipping, guarantee); use null if not needed.",
} as const;

export const adCopySystemPrompt = `CRITICAL RULES — Analyze product images before writing:
- Identify the exact product type and sub-category (e.g. baggy jeans, baby sneakers, face serum for mature skin)
- Identify the target demographic (age group, gender, niche)
- All copy must reflect the actual product and its real audience — never write generic copy
- If the product is for babies, copy targets parents. If it is a baggy jean, copy speaks to the relaxed-fit aesthetic.`;

export const adCopyUserPrompt = `You are an elite direct-response copywriter. Write high-converting, scroll-stopping marketing copy. Focus on clarity, persuasion, emotional triggers, and concrete benefits. Avoid fluff.

Write conversion-focused copy for a 3-section landing page.
{languageLine}
Price: {price}
Product name: {productName}`;

export const adCopyOutputSchema = z.object({
  section_1: z
    .object({
      headline: z.string().describe(COPY_RULES.section1Headline),
      subheadline: z.string().describe(COPY_RULES.section1Subheadline),
      tag: z.string().describe(COPY_RULES.tag),
      badge_text: z.string().nullable().describe(COPY_RULES.badgeText),
    })
    .describe("Hero section content"),
  section_2: z
    .object({
      headline: z.string().nullable(),
      subheadline: z.string().nullable(),
    })
    .describe("Features section (empty object - features extracted separately)"),
  section_3: z
    .object({
      headline: z.string().describe(COPY_RULES.section3Headline),
      subheadline: z.string().describe(COPY_RULES.section3Subheadline),
      cta: z.string().describe(COPY_RULES.cta),
      price: z.string().describe(`${COPY_RULES.price} Allow empty string.`),
      shop_info: z.string().nullable().describe(COPY_RULES.shopInfo),
    })
    .describe("Conversion section content"),
});

export async function generateCopy(
  language: CopyLanguage,
  dialect: ArabicDialect,
  price: string,
  productName: string,
  productImages: File[]
): Promise<z.infer<typeof adCopyOutputSchema>> {
  const imageContentBlocks = await Promise.all(
    productImages.map(async (file) => ({
      type: "image_url" as const,
      image_url: { url: `data:image/jpeg;base64,${await fileToBase64(file)}` },
    }))
  );

  const copyModel = new ChatGoogle("gemini-2.5-flash");
  const copyPrompt = ChatPromptTemplate.fromMessages([
    ["system", adCopySystemPrompt],
    ["human", adCopyUserPrompt],
    ["human", imageContentBlocks],
  ]);

  const languageLine =
    language === "ar"
      ? `Language and dialect: ${language} ${dialect}`
      : `Language: ${language}`;

  const structuredCopyModel = copyModel.withStructuredOutput(adCopyOutputSchema);
  const chain = copyPrompt.pipe(structuredCopyModel as any);
  const copyResult = await chain.invoke({ languageLine, price, productName });

  return copyResult as z.infer<typeof adCopyOutputSchema>;
}
