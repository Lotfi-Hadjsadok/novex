import type { AdCreativeDesignerOutput } from "./designer";
import type { AdCreativeCopy } from "./copy";
import type { AdAspectRatio } from "@/types/ad-creative";
import { fileToBase64 } from "@/lib/utils";
import { ChatGoogle } from "@langchain/google";
import { ChatPromptTemplate } from "@langchain/core/prompts";

function maxFeaturesForRatio(ratio: AdAspectRatio): number {
  return ratio === "9:16" || ratio === "2:3" ? 2 : ratio === "1:1" ? 3 : 4;
}

export async function generateAdCreativeImage(
  designer: AdCreativeDesignerOutput,
  copy: AdCreativeCopy,
  productImages: File[],
  targetWidth: number,
  targetHeight: number,
  aspectRatio: AdAspectRatio,
  customPrompt?: string
): Promise<{ imageDataUrl: string | null }> {
  const maxFeatures = maxFeaturesForRatio(aspectRatio);
  const featuresToShow = copy.features.slice(0, maxFeatures);
  const imageContentBlocks = await Promise.all(
    productImages.map(async (file) => ({
      type: "image_url" as const,
      image_url: { url: `data:image/jpeg;base64,${await fileToBase64(file)}` },
    }))
  );

  const systemPrompt = `YOU ARE RENDERING ONE SINGLE-PANEL SOCIAL MEDIA AD CREATIVE — NOT A LANDING PAGE, NOT A MULTI-SECTION DESIGN.

CANVAS: {targetWidth}×{targetHeight}px single panel. Zero borders, zero section dividers, zero background resets.

BACKGROUND — ENVIRONMENT FIRST (atmosphere related to the product):
- Render a real environment/scene where the product belongs (e.g. gym, bedroom, bathroom, kitchen). The background must represent an atmosphere related to the product — a recognizable place, not abstract gradients or flat color.
- Layer the design system (multi-stop gradient, texture, light blooms, motif) on top as atmosphere so the scene feels cohesive and conversion-focused. The environment is visible and product-related.
- One texture pattern tiles seamlessly. Light blooms at key positions. One motif tiles continuously.
- Never use a plain solid or two-stop gradient as the only background — always show the environment.

PRODUCT — IN USE / IN CONTEXT (NEVER FRAMED):
- The product is the visual anchor, shown in use, worn, or in context (e.g. worn on body, in hand, on a surface in the scene). Same fit, color, label as in the reference images. This triggers the feeling of owning or using the product.
- Never show the product inside an iframe, picture-in-picture, device frame, or screen mockup. The product must sit directly on the canvas in the scene — not inside a second image or window.

FEATURE VISUALS: Each feature has a text label AND a visual concept. Render both — e.g. small icon or illustration next to each feature pill (e.g. water drop for "Water resistant", heart for "Comfort"). Do not show features as text-only pills.

CTA DOMINANCE: The CTA button is the single most visually dominant element — min 52px height, vivid solid brand color, bold text, glowing drop-shadow. Price badge directly adjacent.

FULL COVERAGE: No empty corners, no dead whitespace.

NEGATIVE PROMPT: horizontal dividing line, section border, background seam, gradient restart, texture re-anchor, three separate panels, visible join, collage, multi-section layout, fixed equal thirds, plain gradient-only background with no environment, iframe, picture-in-picture, product inside frame, product on screen, product in device mockup, product in window.`;

  const userPrompt = `Render ONE single-panel ad creative image. {targetWidth}×{targetHeight}px. No sections. No seams. No borders.

ENVIRONMENT & PRODUCT IN USE:
- Environment scene: {environmentScene}
- Product in use: {productInUse}

COMPOSITION (from designer):
{panelComposition}

BACKGROUND SYSTEM (atmosphere on top of the environment):
{backgroundSystem}

DESIGN TOKENS:
{designTokens}

AD COPY TO RENDER:
Headline: {headline}
Subheadline: {subheadline}
Tag: {tag}
Badge: {badge}
Features — render each with its text AND visual (icon/illustration per feature): {featuresWithVisuals}
Feature visual direction: {featuresVisualDirection}
CTA button: {cta}
Price: {price}
Shop info: {shopInfo}

RENDERING RULES:
- Product: {productTreatment}
- Render the CTA as the most visually dominant element — vivid {ctaHex}, bold, glowing shadow
- Features: compact pills with text + small visual/icon per feature (e.g. droplet, heart, shield). Legible, minimal. Show the feature visuals, not only text.
- highlighted_words ({highlightedWords}) rendered in {accentHex}
- Font family: {fontFamily}
- All copy in {primaryTextHex} unless overridden by design tokens
{customPromptLine}`;

  const model = new ChatGoogle("gemini-3-pro-image-preview", {
    imageConfig: { imageSize: "2K" },
  });

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", userPrompt],
    ["human", imageContentBlocks],
  ]);

  const customPromptLine = customPrompt?.trim()
    ? `\n\nAdditional instructions from the user:\n${customPrompt.trim()}`
    : "";

  const chain = promptTemplate.pipe(model);
  const response = await chain.invoke({
    targetWidth:  String(targetWidth),
    targetHeight: String(targetHeight),
    environmentScene:   designer.panel.environment_scene,
    productInUse:       designer.panel.product_in_use_direction,
    panelComposition:   JSON.stringify(designer.panel),
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
    tag:              copy.tag ?? "(none)",
    badge:            copy.badge_text ?? "(none)",
    featuresWithVisuals: featuresToShow.map((f) => `"${f.text}" → visual: ${f.visual}`).join(" | "),
    featuresVisualDirection: designer.panel.features_visual_direction,
    cta:              copy.cta,
    price:            copy.price || "(none)",
    shopInfo:         copy.shop_info ?? "(none)",
    ctaHex:           designer.cta_hex,
    accentHex:        designer.accent_hex,
    primaryTextHex:   designer.primary_text_hex,
    fontFamily:       designer.font_family,
    highlightedWords: designer.panel.highlighted_words.join(", "),
    productTreatment: designer.panel.product_treatment,
    customPromptLine,
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
