import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogle } from "@langchain/google";
import { z, toJSONSchema } from "zod/v4";
import { fileToBase64 } from "@/lib/utils";
import { adCopyOutputSchema } from "./copy";
import { featuresOutputSchema } from "./features";

export const designerSystemPrompt = `RULES:
1. PRODUCT IDENTITY: Identical product across all 3 zones — same packaging, colors, label, fit, size, demographic. Only angle/context changes. State exact fit in every visual_prompt_english.
2. BACKGROUND REFLECTS THE PRODUCT: The background must represent an atmosphere or environment related to the product — not a generic gradient. environment_atmosphere describes a real setting or mood where the product belongs (e.g. soft bathroom shelf with natural light, gym floor with overhead glow, minimal kitchen counter, bedroom vanity). The multi-layer system (gradient, texture, light blooms, motif) is built from product colors and layered on top of this atmosphere so the canvas feels product-specific and conversion-focused. Never use a plain solid or abstract two-stop gradient as the only background — the background should reflect where or how the product is used.
3. UNIFIED CANVAS: One multi-layer background system spanning top-to-bottom with no resets or seams. Three layers: (a) multi-stop gradient using product-extracted hex values only, (b) grain/noise/halftone texture overlay, (c) radial or angular light blooms at key focal points. Motif progresses: 4–6% opacity in Zone 1 → 8–10% in Zone 2 → 12–14% in Zone 3.
4. BACKGROUND COMPLEXITY: Never use a plain solid color or simple two-stop gradient. Minimum 4 gradient stops, directional light sources, named texture type. Per-section background field = zone-local atmospheric treatment layered on top of the global system, never a replacement.
5. MOTIF DERIVATION: Motif derived from a physical product attribute (material texture, packaging geometry, brand mark silhouette). Name exact geometric form and tiling spec (size, rotation, repeat).
6. FULL COVERAGE: Every zone fully filled — no empty corners, no dead whitespace.
7. TYPOGRAPHY: One Google Font covering Latin and Arabic (Cairo, Tajawal, Almarai, IBM Plex Arabic, or Noto Sans Arabic). accent_hex = highlight_hex = cta_hex.
8. NO IFRAME OR PICTURE-IN-PICTURE: Never show the product inside an iframe, picture-in-picture, device frame, screen mockup, or any embedded frame. The product must sit directly on the canvas — never inside a second image or window. Always show the product in use (worn, in hand, on a surface in the environment, applied) so it triggers emotional desire and conversion.
9. HERO SQUARE: Section 1 is 1:1 — height equals width. Sections 2 and 3 have no fixed height; they expand to fit their content.
10. CTA SECTION = EMOTIONAL DESIRE: Section 3 (Conversion) must show the product in use — worn, in place, or used (e.g. worn on body, in hand, on a surface in the environment, applied to skin). product_in_use_direction describes this. Triggers "I want that" and conversion. CTA is the most visually dominant element — min 52px height, vivid solid brand color, glow/shadow. Price badge directly adjacent.
11. tag_visible = false when tag is null or empty.

OUTPUT: Styling only — no copy text, no headlines, no CTA text, no feature text. highlighted_words: 1–3 exact words from provided copy. features_items: one visual_concept per feature slot.`;

export const designerUserPrompt = `You are a designer for a single-canvas product landing page. Output ONLY styling, layout, typography, colors, and visual direction — no copy text.

STEP 1 — Environment atmosphere (background reflects the product):
a) Choose environment_atmosphere: a real setting or mood where the product would be used or seen (e.g. soft bathroom shelf with natural light, gym floor with overhead glow, minimal kitchen counter, bedroom vanity, office desk with warm lamp). Not abstract — a specific product-appropriate atmosphere that the background will suggest. The gradient, texture, and light will be layered on top of this so the canvas feels cohesive and product-specific.
b) Extract 5–7 dominant hex values from the product images (packaging, material, label, surface).
c) Build background_gradient: using extracted hexes, with named direction — layered over the environment atmosphere for mood.
d) Identify grain/texture type matching the product material (options: fine-grain-noise, halftone-dots, linen-weave, brushed-metal-lines, cross-hatch, stipple, micro-diamond). Name it exactly.
e) Define 2–3 radial light blooms positioned where the product sits per zone, using a lighter tint of the brand accent.
f) Derive the repeating motif from a physical product attribute. Name exact geometric form and tiling spec (size, rotation, repeat). This motif tiles continuously and never resets.

STEP 2 — Continuity:
Write one paragraph describing how environment_atmosphere + gradient + texture + light blooms + motif connect across all 3 zones as one unbroken visual system.

SECTION ROLES:
- Section 1 (Hero — 1:1 square): Product 55–70% of zone height. Define positions and styles for headline/subheadline/tag/badge. highlighted_words: 1–3 exact words from section_1 copy.
- Section 2 (Features — natural height): Product at different angle, ≥35% of height. features_items: one visual_concept per feature slot.
- Section 3 (Conversion — natural height): EMOTIONAL DESIRE TRIGGER — Show the product in use so the client converts. Define product_in_use_direction: how the product is shown in use (e.g. worn on wrist, in hand, on a surface in the environment, applied to skin, on a bed). Product sits directly on the canvas in that context — never iframe, picture-in-picture, or inside a frame/window. product_position and product_treatment: sharp clarity, label readable, strong cast shadow beneath product. Define cta_position, cta_style (vivid solid brand color, bold, glow), price_position, price_style. highlighted_words: 1–3 exact words from section_3 copy that reinforce possession ("yours", "get", "now", or equivalent in target language).

Ad copy and features (context only):
{adCopy}
{customPromptLine}`;

const sectionBaseSchema = z.object({
  panel_number: z.number(),
  accentColor: z.string(),
  composition_notes: z.string(),
  visual_prompt_english: z.string(),
  background: z.string(),
});

export const backgroundSystemSchema = z.object({
  gradient_stops: z.array(z.object({ hex: z.string(), position: z.string() })),
  gradient_direction: z.string(),
  texture_type: z.enum(["fine-grain-noise", "halftone-dots", "linen-weave", "brushed-metal-lines", "cross-hatch", "stipple", "micro-diamond"]),
  texture_opacity: z.string(),
  light_blooms: z.array(z.object({ position: z.string(), color_hex: z.string(), radius: z.string(), opacity: z.string() })),
  motif_shape: z.string(),
  motif_source: z.string(),
  motif_tile_size: z.string(),
  motif_rotation: z.string(),
  motif_opacity_zone1: z.string(),
  motif_opacity_zone2: z.string(),
  motif_opacity_zone3: z.string(),
});

export const designerOutputSchema = z.object({
  environment_atmosphere: z.string().describe("Product-appropriate setting or mood the background should reflect: e.g. soft bathroom shelf with natural light, gym floor with overhead glow, minimal kitchen counter. The canvas background suggests this atmosphere; gradient/texture/light sit on top."),
  background_motif: z.string(),
  background_system: backgroundSystemSchema,
  accent_color: z.string(),
  font_headline: z.string(),
  font_body: z.string(),
  font_family: z.string(),
  highlight_hex: z.string(),
  highlight_style: z.enum(["underline", "glow", "gradient", "circle", "highlight-bar", "outline", "stamp"]),
  lighting: z.string(),
  aesthetic: z.string(),
  cta_hex: z.string(),
  accent_hex: z.string(),
  background_hex: z.string(),
  primary_text_hex: z.string(),
  continuity_directive: z.string(),
  section_1: sectionBaseSchema.extend({
    tag_visible: z.boolean(),
    tag_position: z.string(),
    headline_position: z.string(),
    headline_style: z.string(),
    product_position: z.string(),
    product_treatment: z.string(),
    highlighted_words: z.array(z.string()),
  }),
  section_2: sectionBaseSchema.extend({
    features_layout: z.string(),
    features_position: z.string(),
    features_style: z.string(),
    features_items: z.array(z.object({ visual_concept: z.string() })),
    product_position: z.string(),
    product_treatment: z.string(),
  }),
  section_3: sectionBaseSchema.extend({
    product_in_use_direction: z.string().describe("How the product is shown in use for conversion: e.g. worn on body, in hand, on a surface in the environment, applied to skin. Triggers emotional desire and 'I want that'. Never iframe or picture-in-picture."),
    cta_position: z.string(),
    cta_style: z.string(),
    price_position: z.string(),
    price_style: z.string(),
    product_position: z.string(),
    product_treatment: z.string(),
    highlighted_words: z.array(z.string()),
  }),
});

export type DesignerOutput = z.infer<typeof designerOutputSchema>;

const fullSection1Schema = sectionBaseSchema.extend({
  headline: z.string(),
  subheadline: z.string(),
  badge_text: z.string(),
  tag_text: z.string(),
  tag_visible: z.boolean(),
  tag_position: z.string(),
  headline_position: z.string(),
  headline_style: z.string(),
  product_position: z.string(),
  product_treatment: z.string(),
  highlighted_words: z.array(z.string()),
});

const fullSection2Schema = sectionBaseSchema.extend({
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  features_layout: z.string(),
  features_position: z.string(),
  features_style: z.string(),
  features_items: z.array(z.object({ text: z.string() })),
  product_position: z.string(),
  product_treatment: z.string(),
});

const fullSection3Schema = sectionBaseSchema.extend({
  headline: z.string(),
  subheadline: z.string(),
  cta_text: z.string(),
  product_in_use_direction: z.string().optional(),
  cta_position: z.string(),
  cta_style: z.string(),
  price_text: z.string(),
  price_position: z.string(),
  price_style: z.string(),
  product_position: z.string(),
  product_treatment: z.string(),
  highlighted_words: z.array(z.string()),
});

export const fullDesignerSpecSchema = z.object({
  environment_atmosphere: z.string().optional(),
  background_motif: z.string(),
  background_system: backgroundSystemSchema,
  accent_color: z.string(),
  font_headline: z.string(),
  font_body: z.string(),
  font_family: z.string(),
  highlight_hex: z.string(),
  highlight_style: z.enum(["underline", "glow", "gradient", "circle", "highlight-bar", "outline", "stamp"]),
  lighting: z.string(),
  aesthetic: z.string(),
  cta_hex: z.string(),
  accent_hex: z.string(),
  background_hex: z.string(),
  primary_text_hex: z.string(),
  continuity_directive: z.string(),
  section_1: fullSection1Schema,
  section_2: fullSection2Schema,
  section_3: fullSection3Schema,
});

export type FullDesignerSpec = z.infer<typeof fullDesignerSpecSchema>;

export function mergeDesignerWithCopyAndFeatures(
  designer: DesignerOutput,
  copy: z.infer<typeof adCopyOutputSchema>,
  features: z.infer<typeof featuresOutputSchema>
): FullDesignerSpec {
  return {
    ...designer,
    highlight_hex: designer.accent_hex,
    cta_hex: designer.accent_hex,
    section_1: {
      ...designer.section_1,
      headline: copy.section_1.headline,
      subheadline: copy.section_1.subheadline,
      badge_text: copy.section_1.badge_text ?? "",
      tag_text: copy.section_1.tag ?? "",
    },
    section_2: {
      ...designer.section_2,
      headline: copy.section_2.headline ?? undefined,
      subheadline: copy.section_2.subheadline ?? undefined,
      features_items: features.features.map((f) => ({ text: f.text })),
    },
    section_3: {
      ...designer.section_3,
      headline: copy.section_3.headline,
      subheadline: copy.section_3.subheadline,
      cta_text: copy.section_3.cta,
      price_text: copy.section_3.price ?? "",
    },
  };
}

export async function generateDesigner(
  copy: z.infer<typeof adCopyOutputSchema>,
  features: z.infer<typeof featuresOutputSchema>,
  productImages: File[],
  customPrompt?: string
): Promise<DesignerOutput> {
  const adCopy = {
    section_1: {
      headline: copy.section_1.headline,
      subheadline: copy.section_1.subheadline,
      tag: copy.section_1.tag,
      badge_text: copy.section_1.badge_text ?? null,
    },
    section_2: {
      features: features.features,
      ...(copy.section_2.headline != null && { headline: copy.section_2.headline }),
      ...(copy.section_2.subheadline != null && { subheadline: copy.section_2.subheadline }),
    },
    section_3: {
      headline: copy.section_3.headline,
      subheadline: copy.section_3.subheadline,
      cta: copy.section_3.cta,
      price: copy.section_3.price ?? "",
    },
  };

  const imageContentBlocks = await Promise.all(
    productImages.map(async (file) => ({
      type: "image_url" as const,
      image_url: { url: `data:image/jpeg;base64,${await fileToBase64(file)}` },
    }))
  );

  const designerModel = new ChatGoogle("gemini-2.5-flash");
  const designerPromptTemplate = ChatPromptTemplate.fromMessages([
    ["system", designerSystemPrompt],
    ["human", designerUserPrompt],
    ["human", imageContentBlocks],
  ]);

  const jsonSchema = toJSONSchema(designerOutputSchema, { unrepresentable: "any" });
  const structuredDesignerModel = designerModel.withStructuredOutput(jsonSchema as Record<string, unknown>);

  const customPromptLine = customPrompt?.trim()
    ? `\n\nAdditional instructions from the user:\n${customPrompt.trim()}`
    : "";

  const chain = designerPromptTemplate.pipe(structuredDesignerModel as any);
  const rawResult = await chain.invoke({
    adCopy: JSON.stringify(adCopy, null, 2),
    customPromptLine,
  });

  const parsed = designerOutputSchema.parse(rawResult);
  return {
    ...parsed,
    highlight_hex: parsed.accent_hex,
    cta_hex: parsed.accent_hex,
  };
}
