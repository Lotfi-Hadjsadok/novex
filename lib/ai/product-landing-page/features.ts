import { ArabicDialect, CopyLanguage } from "@/types/landing-page";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogle } from "@langchain/google";
import { z } from "zod";
import { fileToBase64 } from "@/lib/utils";

export const FEATURE_RULES = {
  productOnly:
    "Focus ONLY on the actual product and its functional benefits. Ignore models, hands, props, background, logos, or UI unless they directly reflect a product feature.",
  visual:
    "One clear visual concept for this feature, in the same language as the landing page copy. Describe what should appear in the illustration or photo (objects, composition, and key details). No full sentences; use concise visual phrases.",
  text:
    "Short feature label (2–5 words) that could sit as a bold title on a feature card. Make it specific to this product, not a generic marketing phrase.",
} as const;

export const featuresSystemPrompt = `CRITICAL RULES — Analyze product images before extracting features:
- Identify the exact product type (e.g. baggy jeans, baby sneakers, face serum)
- Identify the target demographic (age group, gender, niche)
- Features must be relevant to the ACTUAL product and its REAL audience — never write features for a different category or demographic.`;

export const featuresUserPrompt = `You are an expert product analyst and visual content strategist. Extract key product features from images and turn them into clear, benefit-driven feature cards. Focus only on what the product actually does. Never invent features not visible or implied by the product.

Extract 3–5 key product features.
{userFeaturesInstruction}
{languageLine}
{customPromptLine}`;

const featureItemSchema = z.object({
  visual: z
    .string()
    .describe(`${FEATURE_RULES.visual} Example: "Water droplet with protective shield around it, showing waterproof protection"`),
  text: z
    .string()
    .describe(`${FEATURE_RULES.text} Word count: 2–5 words.`),
});

export const featuresOutputSchema = z.object({
  features: z
    .array(featureItemSchema)
    .min(3)
    .max(5)
    .describe("Array of 3–5 product features"),
});

export async function generateFeatures(
  language: CopyLanguage,
  dialect: ArabicDialect,
  productImages: File[],
  userFeatures?: string[],
  customPrompt?: string
): Promise<z.infer<typeof featuresOutputSchema>> {
  const imageContentBlocks = await Promise.all(
    productImages.map(async (file) => ({
      type: "image_url" as const,
      image_url: { url: `data:image/jpeg;base64,${await fileToBase64(file)}` },
    }))
  );

  const featuresModel = new ChatGoogle("gemini-2.5-flash");
  const featuresPromptTemplate = ChatPromptTemplate.fromMessages([
    ["system", featuresSystemPrompt],
    ["human", featuresUserPrompt],
    ["human", imageContentBlocks],
  ]);

  const languageLine =
    language === "ar"
      ? `Language and dialect: ${language} ${dialect}`
      : `Language: ${language}`;

  const structuredFeaturesModel = featuresModel.withStructuredOutput(featuresOutputSchema);

  const customPromptLine = customPrompt?.trim()
    ? `\n\nAdditional instructions from the user:\n${customPrompt.trim()}`
    : "";

  const chain = featuresPromptTemplate.pipe(structuredFeaturesModel as any);
  const featuresResult = await chain.invoke({
    languageLine,
    customPromptLine,
    userFeaturesInstruction: userFeatures?.length
      ? `The user has provided these features: ${userFeatures.join(", ")} add more if needed.`
      : "",
  });

  return featuresResult as z.infer<typeof featuresOutputSchema>;
}
