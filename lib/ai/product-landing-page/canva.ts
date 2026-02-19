import { fullDesignerSpecSchema, type DesignerOutput } from "./designer";
import { type adCopyOutputSchema } from "./copy";
import { type featuresOutputSchema } from "./features";
import { z } from "zod";
import { fileToBase64 } from "@/lib/utils";
import { ChatGoogle } from "@langchain/google";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export interface CreativeAgentDirectivesForImage {
  theme?: string | null;
  global_directive?: string | null;
}

export async function generateCanvaImage(
  creative: z.infer<typeof fullDesignerSpecSchema>,
  targetWidth: number,
  targetHeight: number,
  productImages: File[],
  copy: z.infer<typeof adCopyOutputSchema>,
  features: z.infer<typeof featuresOutputSchema>,
  designer: DesignerOutput
): Promise<{ imageDataUrl: string | null }> {

  const imageContentBlocks = await Promise.all(
    productImages.map(async (file) => ({
      type: "image_url" as const,
      image_url: { url: `data:image/jpeg;base64,${await fileToBase64(file)}` },
    }))
  );

  const canvaSystemPrompt = `CANVAS: Three content zones, one continuous image.
- Zone 1 (Hero): 1:1 square. Product at 55–70% of zone height. Headline + subheadline.
- Zone 2 (Features): Product at different angle, ≥35% of zone height. Feature icons + titles.
- Zone 3 (Conversion): Product in emotional use-case. Headline + subheadline + CTA + price badge.

PRODUCT FIDELITY: Product in all three zones MUST be identical to reference images — same fit, size category, colors, label, silhouette, demographic. Only angle or context changes. A baggy jean stays baggy. A baby shoe stays infant-sized.

CTA DOMINANCE: Zone 3 CTA is the most visually dominant element — min 52px height, vivid solid color, bold text, glow/shadow. Price badge directly adjacent. Nothing else competes.

BACKGROUND SYSTEM (execute exactly from background_system in creativeAgentDirectives):
- Render gradient_stops at gradient_direction as the base layer — minimum 4 stops, never a plain flat color.
- Overlay texture_type at texture_opacity uniformly across the entire canvas height.
- Place each light_bloom at its specified position with given color_hex, radius, and opacity — blooms do NOT restart per zone, they exist at absolute canvas positions.
- Tile motif_shape (sourced from motif_source) at motif_tile_size rotated by motif_rotation continuously from canvas top to bottom — opacity transitions zone by zone as: motif_opacity_zone1 → motif_opacity_zone2 → motif_opacity_zone3. The tile pattern NEVER resets, cuts, or re-anchors between zones.
- NEVER substitute a plain gradient or solid background. The three-layer system (gradient + texture + motif) is mandatory.

ONE LONG CANVAS: Background flows top-to-bottom as one unbroken visual system. No borders, no dividing lines, no color bands, no seams. Every zone completely filled — no empty corners, no dead whitespace.`;

  const canvaUserPrompt = `You are a world-class image generation director for high-converting product landing pages. You receive a fully resolved creative spec and product reference images. Faithfully render that spec into ONE long vertical canvas image — do NOT re-analyze, just execute.

Create ONE continuous landing page image (single canvas, no section borders, no seams, no per-zone background resets):

dimensions_and_format: {requirements}
creative_spec: {creativeAgentDirectives}

Zone 1 — HERO: {section1}
Zone 2 — FEATURES: {section2}
Zone 3 — CONVERSION: {section3}

raw_copy: {rawCopy}
raw_features: {rawFeatures}
designer_tokens: {designerTokens}`;

  const canvaModel = new ChatGoogle('gemini-3-pro-image-preview',{
    imageConfig: {
      imageSize:"2K"
    },
  });
  const canvaPromptTemplate = ChatPromptTemplate.fromMessages([
    ["system", canvaSystemPrompt],
    ["human", canvaUserPrompt],
    ["human", imageContentBlocks],
  ]);

  const chain = canvaPromptTemplate.pipe(canvaModel);
  const response = await chain.invoke({
    requirements: targetWidth && targetHeight ? `Dimensions: ${targetWidth}x${targetHeight}px. Single image, one canvas. Negative: blurry, watermark, empty corners, blank areas, product inconsistency between zones.` : "Single image, one continuous canvas. Negative: blurry, watermark, empty corners, blank areas, product inconsistency between zones.",
    creativeAgentDirectives: JSON.stringify({
      continuity_directive: creative.continuity_directive ?? null,
      background_motif: creative.background_motif ?? null,
      background_system: creative.background_system ?? null,
      product_palette: creative.accent_hex ? { accent: creative.accent_hex, bg: creative.background_hex, text: creative.primary_text_hex } : null,
      lighting: creative.lighting ?? null,
      aesthetic: creative.aesthetic ?? null,
      brand_hex: creative.accent_hex,
      highlight_hex: creative.accent_hex,
      highlight_style: creative.highlight_style ?? null,
      cta_hex: creative.accent_hex,
      branding_rule: "Highlighted words and CTA button MUST use brand_hex only—no separate colors for emphasis or CTA.",
      background_rule: "Use the background_system exactly as specified: render gradient_stops at gradient_direction, overlay texture_type at texture_opacity, place each light_bloom at its position with given color and radius, and tile motif_shape (derived from motif_source) at motif_tile_size rotated motif_rotation — opacity per zone as specified. NEVER substitute a simple gradient or solid fill.",
    }),
    section1: JSON.stringify(creative.section_1),
    section2: JSON.stringify({
      ...creative.section_2,
      features_visual_concepts: features.features.map((f) => ({ text: f.text, visual: f.visual })),
    }),
    section3: JSON.stringify(creative.section_3),
    rawCopy: JSON.stringify(copy),
    rawFeatures: JSON.stringify(features),
    designerTokens: JSON.stringify({
      background_motif: designer.background_motif,
      background_system: designer.background_system,
      accent_color: designer.accent_color,
      font_headline: designer.font_headline,
      font_body: designer.font_body,
      font_family: designer.font_family,
      highlight_hex: designer.highlight_hex,
      highlight_style: designer.highlight_style,
      lighting: designer.lighting,
      aesthetic: designer.aesthetic,
      cta_hex: designer.cta_hex,
      accent_hex: designer.accent_hex,
      background_hex: designer.background_hex,
      primary_text_hex: designer.primary_text_hex,
      continuity_directive: designer.continuity_directive,
    }),
  });

  const blocks = Array.isArray(response.content) ? response.content : [];
  const imageBlock = blocks.find(
    (b: { type?: string }) => b.type === "inlineData"
  ) as { inlineData?: { mimeType?: string; data?: string } } | undefined;

  const imageDataUrl = imageBlock?.inlineData?.data
    ? `data:${imageBlock.inlineData.mimeType ?? "image/png"};base64,${imageBlock.inlineData.data}`
    : null;

  return { imageDataUrl };
}
