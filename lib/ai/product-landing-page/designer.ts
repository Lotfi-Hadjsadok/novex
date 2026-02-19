import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogle } from "@langchain/google";
import { z, toJSONSchema } from "zod/v4";
import { fileToBase64 } from "@/lib/utils";
import { adCopyOutputSchema } from "./copy";
import { featuresOutputSchema } from "./features";

export const designerSystemPrompt = `NON-NEGOTIABLE RULES:
1. PRODUCT IDENTITY: Product is IDENTICAL across all 3 zones — same packaging, colors, label, fit, size category, demographic. Only POV/angle/context changes. State the exact fit in every visual_prompt_english (e.g. "baggy jean — NOT slim fit"; "infant shoe — NOT adult sized").
2. UNIFIED CANVAS: ONE multi-layer background system running top-to-bottom + ONE product-derived motif tiling uninterrupted through all zones. Background must have at least 3 layers: (a) a rich multi-stop gradient base using ONLY product-extracted hex values, (b) a grain/noise/halftone texture overlay, (c) radial or angular light blooms at key focal points. Motif progresses: sparse 4–6% opacity in Zone 1 → medium 8–10% in Zone 2 → most present 12–14% in Zone 3. No borders, no dividing lines, no per-zone background resets, no seams.
3. BACKGROUND COMPLEXITY: NEVER output a plain solid color or a simple two-stop gradient. Backgrounds must use at least 4 gradient stops, directional light sources, and a named texture type. Every per-section background field must describe that zone's local atmospheric treatment ON TOP OF the global system — never replace it.
4. MOTIF DERIVATION: The repeating motif MUST be derived from a physical attribute of the product (material texture, packaging geometry, brand mark silhouette, product cross-section, pattern from the product surface). Name the exact geometric form and how it tiles (e.g. "hexagonal grid derived from bottlecap ridges, rotated 15°, 45px repeat").
5. FULL COVERAGE: Every zone completely filled — no empty corners, no dead whitespace.
6. TYPOGRAPHY: One Google Font covering Latin and Arabic (Cairo, Tajawal, Almarai, IBM Plex Arabic, or Noto Sans Arabic). accent_hex = highlight_hex = cta_hex — single brand accent only.
7. NO IMAGE-IN-IMAGE: No device frames, no screen mockups, no photo-within-photo. All shots must be direct and full-bleed.
8. HERO ALWAYS SQUARE: Section 1 is 1:1 — same width and height, no exceptions.
9. CTA DOMINANCE: Section 3 CTA is the most visually dominant element — min 52px height, vivid solid brand color, glow/shadow. Price badge directly adjacent.
10. tag_visible = false when tag is empty (you will be told if tag exists).

OUTPUT RULES: Output styling only — no copy text, no headlines, no CTA text, no feature text. highlighted_words must be 1–3 exact words from the provided copy — do not invent them. features_items: one visual_concept string per feature slot, no feature text.`;

export const designerUserPrompt = `You are a designer for a single-canvas product landing page. You receive ad copy and features for context. Output ONLY styling, layout, typography, colors, and visual direction — never any copy text.

STEP 1 — Background architecture (mandatory, do this first):
a) Extract 5–7 dominant hex values from the product images (packaging, material, label, surface).
b) Build a background_gradient: at least 4 stops using those extracted hexes, with named direction (e.g. "160deg radial from top-center").
c) Identify the grain/texture type that matches the product material (options: fine-grain noise, halftone dots, linen weave, brushed metal lines, cross-hatch, stipple, micro-diamond). Name it exactly.
d) Define 2–3 radial light blooms (soft glows) positioned where the product sits per zone — use a lighter or warmer tint of the brand accent.
e) Derive the repeating motif from a physical product attribute. Name the exact geometric form and tiling specification (size, rotation, repeat). This motif tiles continuously, never resets between zones.

STEP 2 — Continuity directive:
Write a single paragraph describing how the background gradient + texture + light blooms + motif all connect across all 3 zones as one unbroken visual system. No zone should feel isolated.

SECTION ROLES (styling only):
- Section 1 (Hero — 1:1): Product 55–70% of zone height. Define positions and styles for headline/subheadline/tag/badge. background field = zone-specific atmospheric treatment layered ON TOP of global system. highlighted_words: 1–3 exact words from provided section_1 copy.
- Section 2 (Features): Product at different angle, ≥35% of zone height. features_items: one visual_concept per feature slot, no text. background field = mid-canvas atmospheric shift.
- Section 3 (Conversion): Product in emotional use-case. Define cta_position, cta_style, price_position, price_style. background field = deepened, more saturated atmospheric finale. highlighted_words: 1–3 exact words from provided section_3 copy.

Ad copy and features (context only — output styling, not this text):
{adCopy}`;

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
      tag_text: copy.section_1.tag,
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
  productImages: File[]
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

  const chain = designerPromptTemplate.pipe(structuredDesignerModel as any);
  const rawResult = await chain.invoke({
    adCopy: JSON.stringify(adCopy, null, 2),
  });

  const parsed = designerOutputSchema.parse(rawResult);
  return {
    ...parsed,
    highlight_hex: parsed.accent_hex,
    cta_hex: parsed.accent_hex,
  };
}
