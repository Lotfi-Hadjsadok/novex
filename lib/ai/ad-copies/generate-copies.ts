import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogle } from "@langchain/google";
import { z } from "zod";
import { fileToBase64 } from "@/lib/utils";
import type { CopyLanguage, ArabicDialect } from "@/types/landing-page";
import type { AdCopyTone, AdCopySize, CopyAngle, GeneratedCopy } from "@/types/ad-copies";

const generatedCopySchema = z.object({
  headline: z.string().describe("Punchy, angle-specific headline in target language"),
  body:     z.string().describe("Body copy — length depends on requested size"),
  cta:      z.string().describe("Action-focused CTA text. 2–5 words."),
  hashtags: z.array(z.string()).nullable().describe("Relevant hashtags without # symbol. Null for short size."),
});

const copiesOutputSchema = z.object({
  copies: z.array(generatedCopySchema).describe("All generated ad copies"),
});

const SIZE_INSTRUCTIONS: Record<AdCopySize, string> = {
  short:  "SHORT: headline (max 5 words) + body (1 sentence, max 20 words) + cta (2–4 words). No hashtags.",
  medium: "MEDIUM: headline (max 7 words) + body (2–3 sentences, 30–55 words) + cta + 3–5 hashtags.",
  long:   "LONG: headline (max 8 words) + body (4–6 sentences with key benefits and a social proof hint, 80–120 words) + cta + 5–8 hashtags.",
};

const systemPrompt = `You are an elite direct-response copywriter generating a batch of high-converting social media ad copies.

CRITICAL — Analyze product images to inform the copy:
- Exact product type, sub-niche, packaging, and visual cues
- Core benefits and the problem it solves
- Target demographic (age, gender, lifestyle)

All copies must:
- Follow the selected marketing ANGLE consistently
- Match the specified TONE (word choice, energy level, register)
- Be written entirely in the target LANGUAGE
- Vary in phrasing, hooks, and structure — never duplicate each other
- Be immediately compelling for a paid ad`;

const userPrompt = `Generate {count} ad copies for the product shown in the images.

{languageLine}
Tone: {tone}
Product: {productName}
Price: {price}
Use emojis: {useEmojis}

MARKETING ANGLE: {angleName}
Angle strategy: {angleDescription}
Angle direction: {angleHook}

SIZE FORMAT — {sizeInstruction}

Generate exactly {count} distinct, non-repetitive copies. Each must take a fresh approach while keeping the same angle.`;

export async function generateAdCopies(
  language:      CopyLanguage,
  dialect:       ArabicDialect,
  tone:          AdCopyTone,
  size:          AdCopySize,
  useEmojis:     boolean,
  price:         string,
  productName:   string,
  count:         number,
  angle:         CopyAngle,
  productImages: File[]
): Promise<GeneratedCopy[]> {
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

  const model  = new ChatGoogle("gemini-2.5-flash");
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", userPrompt],
    ["human", imageContentBlocks],
  ]);

  const structured = model.withStructuredOutput(copiesOutputSchema);
  const chain      = prompt.pipe(structured as any);

  const result = await chain.invoke({
    languageLine,
    tone,
    productName,
    price,
    useEmojis:        useEmojis ? "Yes — use relevant emojis naturally throughout the copy" : "No — plain text only, no emojis",
    angleName:        angle.name,
    angleDescription: angle.description,
    angleHook:        angle.hook,
    sizeInstruction:  SIZE_INSTRUCTIONS[size],
    count:            String(count),
  });

  return (result as z.infer<typeof copiesOutputSchema>).copies as GeneratedCopy[];
}
