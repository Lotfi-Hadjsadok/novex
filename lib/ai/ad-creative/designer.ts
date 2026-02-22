import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogle } from "@langchain/google";
import { z, toJSONSchema } from "zod/v4";
import { fileToBase64 } from "@/lib/utils";
import type { AdCreativeCopy } from "./copy";
import type { AdAspectRatio } from "@/types/ad-creative";

// Shared background system schema (same as landing page)
export const backgroundSystemSchema = z.object({
  gradient_stops:     z.array(z.object({ hex: z.string(), position: z.string() })),
  gradient_direction: z.string(),
  texture_type:       z.enum(["fine-grain-noise", "halftone-dots", "linen-weave", "brushed-metal-lines", "cross-hatch", "stipple", "micro-diamond"]),
  texture_opacity:    z.string(),
  light_blooms:       z.array(z.object({ position: z.string(), color_hex: z.string(), radius: z.string(), opacity: z.string() })),
  motif_shape:        z.string(),
  motif_source:       z.string(),
  motif_tile_size:    z.string(),
  motif_rotation:     z.string(),
  motif_opacity:      z.string(),
});

export const adCreativeDesignerSchema = z.object({
  background_motif:      z.string(),
  background_system:     backgroundSystemSchema,
  accent_color:          z.string(),
  font_headline:         z.string(),
  font_body:             z.string(),
  font_family:           z.string(),
  highlight_hex:         z.string(),
  highlight_style:       z.enum(["underline", "glow", "gradient", "circle", "highlight-bar", "outline", "stamp"]),
  lighting:              z.string(),
  aesthetic:             z.string(),
  cta_hex:               z.string(),
  accent_hex:            z.string(),
  background_hex:        z.string(),
  primary_text_hex:      z.string(),
  continuity_directive:  z.string(),
  panel: z.object({
    product_position:      z.string().describe("Where the product sits on the canvas (e.g. 'center, vertically 20–70%')"),
    product_treatment:     z.string().describe("How the product is rendered: lighting, shadow, angle"),
    product_size_pct:      z.string().describe("What percentage of the canvas height the product occupies"),
    headline_position:     z.string().describe("Where the headline sits (e.g. 'top-center, 8% from top')"),
    headline_style:        z.string().describe("Typography style for the headline"),
    subheadline_position:  z.string(),
    features_layout:       z.enum(["pills-bottom", "pills-around", "side-stack", "floating-corners"]),
    features_position:     z.string().describe("Where features appear relative to the canvas"),
    features_style:        z.string().describe("Visual style for feature pills/labels"),
    cta_position:          z.string().describe("CTA button position (e.g. 'bottom-center, 82% from top')"),
    cta_style:             z.string().describe("CTA style: color, border-radius, shadow, glow"),
    price_position:        z.string(),
    price_style:           z.string(),
    tag_visible:           z.boolean(),
    tag_position:          z.string(),
    badge_position:        z.string().describe("Position of promotional badge if present"),
    highlighted_words:     z.array(z.string()).describe("1–3 exact words from headline to highlight with accent color"),
    visual_prompt_english: z.string().describe("Concise English visual direction for the AI image model"),
    composition_notes:     z.string().describe("How all elements work together as a unified single-panel ad"),
  }),
});

export type AdCreativeDesignerOutput = z.infer<typeof adCreativeDesignerSchema>;

const systemPrompt = `RULES:
1. PRODUCT IDENTITY: Same product, accurate to images — same packaging, colors, label. Exact product type stated in visual_prompt_english.
2. BACKGROUND COMPLEXITY: Never plain solid or simple gradient. Minimum 4 gradient stops, directional light sources, named texture. One unified background covering the full canvas.
3. MOTIF: Derived from physical product attribute. Name exact geometric form and tiling spec (size, rotation, repeat).
4. TYPOGRAPHY: One Google Font covering Latin and Arabic (Cairo, Tajawal, Almarai, IBM Plex Arabic, or Noto Sans Arabic). accent_hex = highlight_hex = cta_hex.
5. CTA DOMINANCE: CTA button is the most visually dominant text element — min 52px height, vivid solid brand color, bold, glow/shadow.
6. SINGLE PANEL: This is ONE ad creative panel, not a multi-section page. Elements coexist on one canvas. Product is the visual anchor.
7. ASPECT RATIO AWARENESS: Layout must respect the given aspect ratio. Landscape = horizontal split (product + text side by side). Portrait/Story = vertical stack (product above, text/CTA below). Square = product center, elements around.
8. tag_visible = false when tag is empty.
9. NO IMAGE-IN-IMAGE: No device frames, no screen mockups.

OUTPUT: Styling only — no copy text, no headlines, no CTA text, no feature text. highlighted_words: 1–3 exact words from provided copy.`;

const userPrompt = `You are a designer for a single-panel social media ad creative. Output ONLY styling, layout, typography, colors, and visual direction — no copy text.

CANVAS ASPECT RATIO: {aspectRatio} ({width}×{height}px)

STEP 1 — Background architecture:
a) Extract 5–7 dominant hex values from the product images.
b) Build background_gradient: using extracted hexes, with named direction.
c) Name texture type matching the product material.
d) Define 2–3 radial light blooms positioned where the product sits.
e) Derive repeating motif from physical product attribute. Name exact geometric form and tiling spec.

STEP 2 — Single-panel composition:
Design the layout for a {aspectRatio} canvas. The product is the visual anchor. Text, features, and CTA surround or overlay the product. No dividers, no sections, no horizontal lines.

Ad copy and features (context only):
{adCopy}
{customPromptLine}`;

export async function generateAdCreativeDesigner(
  copy: AdCreativeCopy,
  productImages: File[],
  aspectRatio: AdAspectRatio,
  width: number,
  height: number,
  customPrompt?: string
): Promise<AdCreativeDesignerOutput> {
  const adCopy = {
    headline:    copy.headline,
    subheadline: copy.subheadline,
    tag:         copy.tag,
    badge_text:  copy.badge_text,
    features:    copy.features,
    cta:         copy.cta,
    price:       copy.price,
    shop_info:   copy.shop_info,
  };

  const imageContentBlocks = await Promise.all(
    productImages.map(async (file) => ({
      type: "image_url" as const,
      image_url: { url: `data:image/jpeg;base64,${await fileToBase64(file)}` },
    }))
  );

  const model = new ChatGoogle("gemini-2.5-flash");
  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", userPrompt],
    ["human", imageContentBlocks],
  ]);

  const jsonSchema = toJSONSchema(adCreativeDesignerSchema, { unrepresentable: "any" });
  const structuredModel = model.withStructuredOutput(jsonSchema as Record<string, unknown>);
  const chain = promptTemplate.pipe(structuredModel as any);

  const customPromptLine = customPrompt?.trim()
    ? `\n\nAdditional instructions from the user:\n${customPrompt.trim()}`
    : "";

  const rawResult = await chain.invoke({
    aspectRatio,
    width: String(width),
    height: String(height),
    adCopy: JSON.stringify(adCopy, null, 2),
    customPromptLine,
  });

  const parsed = adCreativeDesignerSchema.parse(rawResult);
  return {
    ...parsed,
    highlight_hex: parsed.accent_hex,
    cta_hex:       parsed.accent_hex,
  };
}
