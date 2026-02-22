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
  designer: DesignerOutput,
  customPrompt?: string
): Promise<{ imageDataUrl: string | null }> {

  const imageContentBlocks = await Promise.all(
    productImages.map(async (file) => ({
      type: "image_url" as const,
      image_url: { url: `data:image/jpeg;base64,${await fileToBase64(file)}` },
    }))
  );

  const canvaSystemPrompt = `YOU ARE RENDERING ONE SINGLE CONTINUOUS VERTICAL IMAGE — NOT THREE IMAGES, NOT A COLLAGE.

CANVAS: One tall vertical image. Zero borders, zero seams, zero background resets, zero horizontal lines anywhere.

BACKGROUND (one global system, full canvas height — never resets):
- One multi-stop gradient flows top to bottom without interruption.
- One texture pattern tiles seamlessly across the full height.
- Light blooms at absolute canvas positions — not bound to any content area.
- One motif tiles continuously top to bottom — opacity increases toward bottom, tile grid never re-anchors.
- Never substitute a solid or two-stop gradient.

CONTENT AREAS (vertical windows into one canvas — not separate images):
- Section 1 (Hero): Square (1:1). Product centered at 55–70% of this height. Headline + subheadline.
- Section 2 (Features): Natural height — expands to fit content. Product at different angle ≥35% of height. Feature icons + labels.
- Section 3 (Conversion — OWNERSHIP TRIGGER): Natural height — expands to fit content. Product directly on canvas — no scene, no environmental frame, no container box. OWNERSHIP PSYCHOLOGY: render the product front-facing at eye level, label fully legible, product body tilted ~8–12° toward the viewer as if being physically handed to them. The viewer must feel "this is already mine." Product occupies 40–55% of section height. Strong cast shadow directly beneath the product anchors it on the canvas. CTA button is the single most dominant element — min 52px height, vivid solid brand color, bold text, glowing drop-shadow. Price badge adjacent. Headline copy frames the product as already belonging to the viewer.

SEAM TEST — if any of the following exist between content areas, the image is wrong:
horizontal line · background color shift · gradient restart · texture re-anchor · border · dividing element

PRODUCT FIDELITY: Identical product across all areas — same fit, colors, label, silhouette. Only angle and context change.

CTA DOMINANCE: CTA button is the most visually dominant element in Section 3 — min 52px height, vivid solid brand color, bold text, glow/shadow. Price badge directly adjacent.

FULL COVERAGE: No empty corners, no dead whitespace.`;

  const canvaUserPrompt = `Render ONE continuous vertical landing page image. Single canvas. No sections. No seams. No borders.

The background_system in creative_spec describes ONE visual system spanning the full canvas height. Render it without any reset, re-anchor, or interruption.

SECTION 1 — Hero (square, 1:1 — {targetWidth}×{targetWidth}px): {section1}

SECTION 2 — Features (natural height — expands to fit content): {section2}

SECTION 3 — Conversion / Ownership Trigger (natural height — expands to fit content): {section3}

OWNERSHIP DIRECTIVE: The product in this section must feel like it already belongs to the person looking at it. Front-facing, label fully legible, body tilted 8–12° toward the viewer — as if being handed directly to them. No scene, no box, no surface. Strong cast shadow beneath the product grounds it. The viewer's eye should land on the product first, then be pulled immediately to the CTA. Render the CTA button as the most dominant typographic element on the canvas.

All three areas share the same unbroken background. The background does not change, restart, or shift between content areas.

canvas: {targetWidth}×{targetHeight}px — Section 1 is square ({targetWidth}×{targetWidth}px). Sections 2 and 3 fill the remaining height naturally.
creative_spec: {creativeAgentDirectives}
raw_copy: {rawCopy}
raw_features: {rawFeatures}
designer_tokens: {designerTokens}
{customPromptLine}

NEGATIVE PROMPT: horizontal dividing line, section border, background seam, color reset, collage, three separate panels, visible join, gradient restart, texture re-anchor, fixed equal thirds, product-in-a-scene, lifestyle-scene-box, environmental-frame-box, scene-within-section, product-in-a-room, isolated-scene-container`;

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

  const customPromptLine = customPrompt?.trim()
    ? `\n\nAdditional instructions from the user:\n${customPrompt.trim()}`
    : "";

  const chain = canvaPromptTemplate.pipe(canvaModel);
  const response = await chain.invoke({
    targetWidth: String(targetWidth),
    targetHeight: String(targetHeight),
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
      features_visual_concepts: features.features.map((featureItem) => ({ text: featureItem.text, visual: featureItem.visual })),
    }),
    section3: JSON.stringify(creative.section_3),
    customPromptLine,
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
    (block: { type?: string }) => block.type === "inlineData"
  ) as { inlineData?: { mimeType?: string; data?: string } } | undefined;

  const imageDataUrl = imageBlock?.inlineData?.data
    ? `data:${imageBlock.inlineData.mimeType ?? "image/png"};base64,${imageBlock.inlineData.data}`
    : null;

  return { imageDataUrl };
}
