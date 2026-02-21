import type { AdCreativeDesignerOutput } from "./designer";
import type { AdCreativeCopy } from "./copy";
import { fileToBase64 } from "@/lib/utils";
import { ChatGoogle } from "@langchain/google";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export async function generateAdCreativeImage(
  designer: AdCreativeDesignerOutput,
  copy: AdCreativeCopy,
  productImages: File[],
  targetWidth: number,
  targetHeight: number
): Promise<{ imageDataUrl: string | null }> {
  const imageContentBlocks = await Promise.all(
    productImages.map(async (file) => ({
      type: "image_url" as const,
      image_url: { url: `data:image/jpeg;base64,${await fileToBase64(file)}` },
    }))
  );

  const systemPrompt = `YOU ARE RENDERING ONE SINGLE-PANEL SOCIAL MEDIA AD CREATIVE — NOT A LANDING PAGE, NOT A MULTI-SECTION DESIGN.

CANVAS: {targetWidth}×{targetHeight}px single panel. Zero borders, zero section dividers, zero background resets.

BACKGROUND (one global system, full canvas — never resets):
- One multi-stop gradient covers the full canvas.
- One texture pattern tiles seamlessly across the entire canvas.
- Light blooms at absolute canvas positions — not bound to any element.
- One motif tiles continuously — never re-anchors.
- Never substitute a solid or two-stop gradient.

PRODUCT: The visual anchor of the entire composition. Accurate to the product images — same fit, color, label. No scene, no environmental frame, no lifestyle context.

CTA DOMINANCE: The CTA button is the single most visually dominant element — min 52px height, vivid solid brand color, bold text, glowing drop-shadow. Price badge directly adjacent.

FULL COVERAGE: No empty corners, no dead whitespace.

NEGATIVE PROMPT: horizontal dividing line, section border, background seam, gradient restart, texture re-anchor, three separate panels, visible join, collage, multi-section layout, fixed equal thirds, product-in-a-scene, lifestyle-scene-box.`;

  const userPrompt = `Render ONE single-panel ad creative image. {targetWidth}×{targetHeight}px. No sections. No seams. No borders.

COMPOSITION (from designer):
{panelComposition}

BACKGROUND SYSTEM:
{backgroundSystem}

DESIGN TOKENS:
{designTokens}

AD COPY TO RENDER:
Headline: {headline}
Subheadline: {subheadline}
Tag: {tag}
Badge: {badge}
Features (as compact pills/labels): {features}
CTA button: {cta}
Price: {price}
Shop info: {shopInfo}

RENDERING RULES:
- Product: {productTreatment}
- Render the CTA as the most visually dominant element — vivid {ctaHex}, bold, glowing shadow
- Features appear as compact pill-shaped labels with subtle background. Legible, minimal.
- highlighted_words ({highlightedWords}) rendered in {accentHex}
- Font family: {fontFamily}
- All copy in {primaryTextHex} unless overridden by design tokens`;

  const model = new ChatGoogle("gemini-3-pro-image-preview", {
    imageConfig: { imageSize: "2K" },
  });

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", userPrompt],
    ["human", imageContentBlocks],
  ]);

  const chain = promptTemplate.pipe(model);
  const response = await chain.invoke({
    targetWidth:  String(targetWidth),
    targetHeight: String(targetHeight),
    panelComposition: JSON.stringify(designer.panel),
    backgroundSystem: JSON.stringify({
      background_motif:     designer.background_motif,
      background_system:    designer.background_system,
      continuity_directive: designer.continuity_directive,
      background_rule:      "Use the background_system exactly: render gradient_stops at gradient_direction, overlay texture_type at texture_opacity, place each light_bloom at its position, and tile motif_shape at motif_tile_size rotated motif_rotation. NEVER substitute a simple gradient or solid fill.",
    }),
    designTokens: JSON.stringify({
      font_family:       designer.font_family,
      font_headline:     designer.font_headline,
      font_body:         designer.font_body,
      highlight_style:   designer.highlight_style,
      lighting:          designer.lighting,
      aesthetic:         designer.aesthetic,
      background_hex:    designer.background_hex,
    }),
    headline:         copy.headline,
    subheadline:      copy.subheadline,
    tag:              copy.tag || "(none)",
    badge:            copy.badge_text ?? "(none)",
    features:         copy.features.map((f) => f.text).join(" · "),
    cta:              copy.cta,
    price:            copy.price || "(none)",
    shopInfo:         copy.shop_info ?? "(none)",
    ctaHex:           designer.cta_hex,
    accentHex:        designer.accent_hex,
    primaryTextHex:   designer.primary_text_hex,
    fontFamily:       designer.font_family,
    highlightedWords: designer.panel.highlighted_words.join(", "),
    productTreatment: designer.panel.product_treatment,
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
