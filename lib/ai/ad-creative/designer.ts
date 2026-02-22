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
    environment_scene:       z.string().describe("Product-appropriate real environment: e.g. gym for sneakers, bathroom shelf for serum, bed for bedding, kitchen counter for appliance. A specific place where the product would be used or seen, not abstract or gradient-only."),
    product_in_use_direction: z.string().describe("How the product is shown in use or in context: e.g. worn on wrist, applied to skin, on a bed, in hand, on a table in the scene. Triggers the feeling of owning/using the product."),
    product_position:      z.string().describe("Where the product sits on the canvas (e.g. 'center, vertically 20–70%')"),
    product_treatment:     z.string().describe("How the product is rendered: lighting, shadow, angle, in-context with the environment"),
    product_size_pct:      z.string().describe("What percentage of the canvas height the product occupies"),
    headline_position:     z.string().describe("Where the headline sits (e.g. 'top-center, 8% from top')"),
    headline_style:        z.string().describe("Typography style for the headline"),
    subheadline_position:  z.string(),
    features_layout:       z.enum(["pills-bottom", "pills-around", "side-stack", "floating-corners"]),
    features_position:     z.string().describe("Where features appear relative to the canvas"),
    features_style:        z.string().describe("Visual style for feature pills/labels — include both text and a small visual/icon per feature (e.g. water drop for water-resistant)."),
    features_visual_direction: z.string().describe("How to show each feature visually: e.g. small icon left of label, inline illustration, or subtle graphic that conveys the feature (e.g. droplet, heart, shield). Each feature gets its visual concept rendered."),
    cta_position:          z.string().describe("CTA button position (e.g. 'bottom-center, 82% from top')"),
    cta_style:             z.string().describe("CTA style: color, border-radius, shadow, glow"),
    price_position:        z.string(),
    price_style:           z.string(),
    tag_visible:           z.boolean(),
    tag_position:          z.string(),
    badge_position:        z.string().describe("Position of promotional badge if present"),
    highlighted_words:     z.array(z.string()).describe("1–3 exact words from headline to highlight with accent color"),
    visual_prompt_english: z.string().describe("Concise English visual direction for the AI image: product shown in use/worn/in context + the environment scene. Must trigger the feeling of using or owning the product."),
    composition_notes:     z.string().describe("How all elements work together as a unified single-panel ad — environment, product in use, and feature visuals."),
  }),
});

export type AdCreativeDesignerOutput = z.infer<typeof adCreativeDesignerSchema>;

const systemPrompt = `RULES:
1. PRODUCT IDENTITY: Same product, accurate to images — same packaging, colors, label. Exact product type stated in visual_prompt_english.
2. ENVIRONMENT-BASED BACKGROUND: The background must be a real product-appropriate environment (e.g. gym, bedroom, bathroom, kitchen, office), not just gradients or abstract shapes. environment_scene describes this place. Gradient/texture/light blooms layer on top as atmosphere; the base is always a recognizable setting where the product belongs.
3. PRODUCT IN USE: The product must be shown in use, worn, or in context (e.g. worn on body, in hand, on a surface in the scene) so it triggers the feeling of owning or using it. product_in_use_direction and visual_prompt_english must both describe this.
4. FEATURE VISUALS: Each feature has a text label AND a visual (from copy). features_style and features_visual_direction describe how to show both — e.g. small icon or illustration per feature pill so the ad shows feature visuals, not only text.
5. BACKGROUND COMPLEXITY: On top of the environment, use minimum 4 gradient stops, directional light, named texture for atmosphere. One unified look covering the full canvas.
6. MOTIF: Derived from physical product attribute. Name exact geometric form and tiling spec (size, rotation, repeat).
7. TYPOGRAPHY: One Google Font covering Latin and Arabic (Cairo, Tajawal, Almarai, IBM Plex Arabic, or Noto Sans Arabic). accent_hex = highlight_hex = cta_hex.
8. CTA DOMINANCE: CTA button is the most visually dominant text element — min 52px height, vivid solid brand color, bold, glow/shadow.
9. SINGLE PANEL: This is ONE ad creative panel. Elements coexist on one canvas. Product in context is the visual anchor; environment supports it.
10. ASPECT RATIO AWARENESS: Layout must respect the given aspect ratio. Landscape = horizontal split (product + text side by side). Portrait/Story = vertical stack (product above, text/CTA below). Square = product center, elements around.
11. tag_visible = false when tag is null or empty.
12. NO FRAMES AROUND PRODUCT: Never show the product inside an iframe, picture-in-picture, device frame, screen mockup, or any embedded frame. The product must sit directly on the canvas within the environment scene — never inside a second “image” or window.
13. BACKGROUND = PRODUCT ATMOSPHERE: The background must represent an atmosphere related to the product (the real environment where it belongs). Design so the ad feels cohesive and conversion-focused — every element should support the goal of converting the viewer.

FEATURE COUNT BY SIZE/PLACEMENT: The number of features to show depends on the canvas size and placement. Smaller/tall formats (9:16, 2:3) = show 2 features; square (1:1) = 3; landscape or wider (16:9, 4:5) = 3–4. Use features_layout and features_position accordingly so the layout never feels cramped.

OUTPUT: Styling only — no copy text, no headlines, no CTA text, no feature text. highlighted_words: 1–3 exact words from provided copy.`;

const userPrompt = `You are a designer for a single-panel social media ad creative. Output ONLY styling, layout, typography, colors, and visual direction — no copy text.

CANVAS ASPECT RATIO: {aspectRatio} ({width}×{height}px)

STEP 1 — Environment and product in use:
a) Choose a real environment_scene where the product would be used or seen (e.g. gym for sportswear, bathroom for skincare, living room for furniture). Not abstract — a specific place.
b) Define product_in_use_direction: how the product is shown in use, worn, or in context (e.g. worn on wrist, on a bed, in hand) to trigger the feeling of using/owning it.
c) visual_prompt_english must describe both the environment and the product in use — concise direction for the image model.

STEP 2 — Background architecture (atmosphere on top of environment):
a) Extract 5–7 dominant hex values from the product images.
b) Build background_gradient: using extracted hexes, with named direction — layered over the environment for mood.
c) Name texture type matching the product material.
d) Define 2–3 radial light blooms positioned where the product sits.
e) Derive repeating motif from physical product attribute. Name exact geometric form and tiling spec.

STEP 3 — Single-panel composition and feature visuals:
Design the layout for a {aspectRatio} canvas. The product in context is the visual anchor. Text, features (each with its visual — icon or small illustration per feature), and CTA surround or overlay. features_visual_direction: how each feature’s visual concept is shown (e.g. icon left of label). No dividers, no sections, no horizontal lines.

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
