import { ArabicDialect, CopyLanguage, ImageData } from "@/types/landing-page";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogle } from "@langchain/google";
import { z } from "zod";
import { fileToBase64 } from "../utils";

export const COPY_RULES = {
  tag: "Short product tag or category label; keep minimal. Use empty string if none.",
  price: "Price as shown or inferred from image; use empty string if unknown.",
  section3Headline: "Short conversion headline (2–5 words).",
  section3Subheadline: "Supporting line under section 3 headline (4–12 words).",
  cta: "Call-to-action button text (2–5 words), specific to this product.",
  shopInfo: "Optional shop/trust line (e.g. shipping, guarantee); use null if not needed.",
} as const;

export const adCopySystemPrompt = `
You are an elite direct-response copywriter
You write high-converting, scroll-stopping marketing copy.
You focus on clarity, persuasion, emotional triggers, and concrete benefits.
Avoid fluff.
Always output in JSON format.

`;

export const adCopyUserPrompt = `
Analyze product images and write conversion-focused copy for a 3-section landing page.
Extract ALL content from the image. Headline and CTA must be specific to THIS product never generic.
Always answer using the following language and dialect: {language} {dialect}
Price: {price}
Product name: {productName}
`;

export const adCopyOutputSchema = z.object({
  section_1: z
    .object({
      headline: z
        .string()
        .describe(
          "Main attention-grabbing headline for hero section, specific to THIS product never generic"
        ),
      subheadline: z
        .string()
        .describe("Supporting text that expands on headline, specific to THIS product"),
      tag: z.string().describe(COPY_RULES.tag),
      badge_text: z
        .string()
        .nullable()
        .describe(
          "Use null by default—no badge. Do not use Free Shipping or توصيل مجاني as default. Only set if tag is non-empty and is a real promotional label."
        ),
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
      headline: z
        .string()
        .describe(`${COPY_RULES.section3Headline} Word count: 2–5 words.`),
      subheadline: z
        .string()
        .describe(`${COPY_RULES.section3Subheadline} Word count: 4–12 words.`),
      cta: z
        .string()
        .describe(`${COPY_RULES.cta} Word count: 2–5 words.`),
      price: z.string().describe(`${COPY_RULES.price} Allow empty string.`),
      shop_info: z.string().nullable().describe(COPY_RULES.shopInfo),
    })
    .describe("Conversion section content"),
});



export async function generateAdCopy(
  language:CopyLanguage,
  dialect:ArabicDialect,
  price:string,
  productName:string,
  productImages:File[]
):Promise<z.infer<typeof adCopyOutputSchema>> {

  const imageContentBlocks = await Promise.all(productImages.map(async (file) => ({
    type: "image_url" as const,
    image_url: { url: `data:image/jpeg;base64,${await fileToBase64(file)}` },
  })));

  const copyModel = new ChatGoogle("gemini-2.5-flash");
  const copyPrompt = ChatPromptTemplate.fromMessages([
    ['system', adCopySystemPrompt],
    ['human', adCopyUserPrompt],
    ['human', imageContentBlocks],
  ]);
  
  const structuredCopyModel = copyModel.withStructuredOutput(adCopyOutputSchema);
  
  const chain = copyPrompt.pipe(structuredCopyModel as any);
  const copyResult = await chain.invoke({
    language,
    dialect,
    price,
    productName,
  });

  return copyResult as z.infer<typeof adCopyOutputSchema>;
}

