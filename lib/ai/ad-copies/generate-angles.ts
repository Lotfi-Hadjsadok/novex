import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogle } from "@langchain/google";
import { z } from "zod";
import { fileToBase64 } from "@/lib/utils";
import type { CopyLanguage, ArabicDialect } from "@/types/landing-page";
import type { AdCopyTone, CopyAngle } from "@/types/ad-copies";

const angleSchema = z.object({
  id: z.enum(["benefit", "pain-point", "lifestyle", "urgency", "social-proof", "curiosity"]),
  name:             z.string().describe("Short angle name (2–3 words, e.g. 'Pain Point')"),
  description:      z.string().describe("1 sentence explaining the angle strategy"),
  headline_preview: z.string().describe("A real headline in the target language that demonstrates this angle. Max 7 words."),
  hook:             z.string().describe("One compelling opening line in the target language that sets the tone for this angle. Max 15 words."),
});

const anglesOutputSchema = z.object({
  angles: z.array(angleSchema).min(5).max(6).describe("5–6 distinct marketing angle approaches"),
});

const systemPrompt = `You are a master direct-response copywriter analyzing product images to develop strategic ad angles.

CRITICAL — Study the product images before writing:
- Identify the exact product type, category, and sub-niche
- Identify the primary target demographic (age, gender, lifestyle, pain points)
- Identify 3–5 core product benefits
- Identify the main problem the product solves

Generate 5–6 distinct, powerful marketing angles. Each angle must:
- Be genuinely distinct in strategy and emotional register
- Contain a real, compelling headline preview (not a template placeholder)
- Reflect the ACTUAL product from the images — never generic copy
- Be written in the specified language/dialect`;

const userPrompt = `Analyze the uploaded product images and generate 5–6 marketing angles.

{languageLine}
Tone to match: {tone}
Product name: {productName}
Price: {price}
{customPromptLine}

Each angle must include a concrete headline preview and hook line in the target language that immediately demonstrates the angle's strategic approach.`;

export async function generateAdCopyAngles(
  language:      CopyLanguage,
  dialect:       ArabicDialect,
  tone:          AdCopyTone,
  price:         string,
  productName:   string,
  productImages: File[],
  customPrompt?: string
): Promise<CopyAngle[]> {
  const imageContentBlocks = await Promise.all(
    productImages.map(async (file) => ({
      type:      "image_url" as const,
      image_url: { url: `data:image/jpeg;base64,${await fileToBase64(file)}` },
    }))
  );

  const languageLine =
    language === "ar"
      ? `Language and dialect: Arabic (${dialect})`
      : `Language: ${language === "en" ? "English" : "French"}`;

  const customPromptLine = customPrompt?.trim()
    ? `\n\nAdditional instructions from the user:\n${customPrompt.trim()}`
    : "";

  const model  = new ChatGoogle("gemini-2.5-flash");
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", userPrompt],
    ["human", imageContentBlocks],
  ]);

  const structured = model.withStructuredOutput(anglesOutputSchema);
  const chain      = prompt.pipe(structured as any);
  const result     = await chain.invoke({ languageLine, tone, price, productName, customPromptLine });

  const seen = new Set<string>();
  return (result as z.infer<typeof anglesOutputSchema>).angles.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  }) as CopyAngle[];
}
