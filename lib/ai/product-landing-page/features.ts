import { ArabicDialect, CopyLanguage } from "@/types/landing-page";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogle } from "@langchain/google";
import { z } from "zod";
import { fileToBase64 } from "../../utils";

export const FEATURE_RULES = {
  productOnly:
    "Focus ONLY on the actual product and its functional benefits. Ignore models, hands, props, background, logos, or UI unless they directly reflect a product feature.",
  visual:
    "One clear visual concept for this feature. Describe what should appear in the illustration or photo (objects, composition, and key details). No full sentences; use concise visual phrases.",
  text:
    "Short feature label (2–5 words) that could sit as a bold title on a feature card. Make it specific to this product, not a generic marketing phrase.",
  description:
    "Short benefit-focused line (5–12 words) explaining why this feature matters to the buyer. Tie it to real-world usage or outcome when possible.",
} as const;

export const featuresSystemPrompt = `
You are an expert product analyst and visual content strategist.
You extract key product features from images and turn them into clear, benefit-driven feature cards.
Focus only on what the product actually does. Never invent features not visible or implied by the product.
Always output in JSON format.

`;

export const featuresUserPrompt = `
Analyze the product image and extract 3–5 key PRODUCT features.
{userFeaturesInstruction}
Always answer using the following language and dialect: {language} {dialect}
`;

export const featuresOutputSchema = z.object({
  section_2: z
    .object({
      features: z
        .array(
          z.object({
            visual: z
              .string()
              .describe(`${FEATURE_RULES.visual} Example: "Water droplet with protective shield around it, showing waterproof protection"`),
            text: z
              .string()
              .describe(`${FEATURE_RULES.text} Word count: 2–5 words.`),
            description: z
              .string()
              .describe(`${FEATURE_RULES.description} Word count: 5–12 words.`),
          })
        )
        .min(3)
        .max(5)
        .describe("Array of 3–5 product features"),
    })
    .describe("Features section"),
});

export async function generateFeatures(
  language: CopyLanguage,
  dialect: ArabicDialect,
  productImages: File[],
  userFeatures?: string[]
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

  const structuredFeaturesModel = featuresModel.withStructuredOutput(featuresOutputSchema);

  const chain = featuresPromptTemplate.pipe(structuredFeaturesModel as any);
  const featuresResult = await chain.invoke({
    language,
    dialect,
    userFeaturesInstruction: userFeatures?.length
      ? `The user has provided these features: ${userFeatures.join(", ")} add more if needed.`
      : '',
  });

  return featuresResult as z.infer<typeof featuresOutputSchema>;
}
