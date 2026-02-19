"use client";

import { useTransition, useState } from "react";
import {
  ARABIC_DIALECTS,
  CURRENCIES,
  LANGUAGES,
  type ArabicDialect,
  type CopyLanguage,
  type Currency,
} from "@/types/landing-page";
import type { FullDesignerSpec } from "@/lib/ai/product-landing-page/designer";
import type { adCopyOutputSchema } from "@/lib/ai/product-landing-page/copy";
import type { featuresOutputSchema } from "@/lib/ai/product-landing-page/features";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { ImagePicker } from "@/components/ui/image-picker";
import {
  generateCopyAndFeatures,
  generateDesignAndImage,
} from "@/app/actions/landing-page";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Download, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";

type CopyData = z.infer<typeof adCopyOutputSchema>;
type FeatureItem = { visual: string; text: string };
type GenerateResult = { creative: FullDesignerSpec; imageDataUrl: string | null };

const PHASES = ["Product", "Language", "Pricing", "Review", "Design"] as const;
type Phase = (typeof PHASES)[number];

function StepIndicator({ phase }: { phase: Phase }) {
  const idx = PHASES.indexOf(phase);
  return (
    <div className="flex items-center justify-center">
      {PHASES.map((p, i) => (
        <div key={p} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold border-2 transition-all duration-300",
                i < idx
                  ? "bg-primary border-primary text-primary-foreground"
                  : i === idx
                    ? "bg-primary border-primary text-primary-foreground shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]"
                    : "bg-background border-border text-muted-foreground"
              )}
            >
              {i < idx ? "✓" : i + 1}
            </div>
            <span
              className={cn(
                "text-[10px] font-medium hidden sm:block",
                i <= idx ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {p}
            </span>
          </div>
          {i < PHASES.length - 1 && (
            <div
              className={cn(
                "mx-2 mb-4 h-px w-8 sm:w-12 transition-colors duration-300",
                i < idx ? "bg-primary/60" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function AIGeneratingCanvas() {
  return (
    <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-zinc-950 border border-border">
      <style>{`
        @keyframes scan-line {
          0%   { top: -2px; opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes grid-drift {
          0%   { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        @keyframes shimmer-text {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
        .scan-line   { animation: scan-line 2.4s ease-in-out infinite; }
        .grid-drift  { animation: grid-drift 4s linear infinite; }
        .shimmer-txt { animation: shimmer-text 1.8s ease-in-out infinite; }
      `}</style>

      {/* Ambient blobs — branding primary */}
      <div className="absolute top-1/4 left-1/3 w-2/3 h-1/2 rounded-full bg-primary/20 blur-3xl animate-pulse [animation-duration:3s]" />
      <div className="absolute bottom-1/4 right-1/3 w-1/2 h-1/3 rounded-full bg-primary/15 blur-3xl animate-pulse [animation-duration:4s] [animation-delay:1s]" />
      <div className="absolute top-2/3 left-1/4 w-1/3 h-1/4 rounded-full bg-primary/10 blur-2xl animate-pulse [animation-duration:3.5s] [animation-delay:0.5s]" />

      {/* Drifting grid */}
      <div
        className="absolute inset-0 opacity-[0.07] grid-drift"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Scanning beam — primary */}
      <div
        className="scan-line absolute left-0 right-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.85) 40%, hsl(var(--primary)) 50%, hsl(var(--primary) / 0.85) 60%, transparent 100%)",
          boxShadow: "0 0 12px 3px hsl(var(--primary) / 0.5)",
        }}
      />

      {/* Center spinner + text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
        {/* Concentric spinning rings */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border border-primary/20 animate-spin [animation-duration:6s]" />
          <div className="absolute inset-1 rounded-full border border-primary/30 animate-spin [animation-duration:4s] [animation-direction:reverse]" />
          <div
            className="absolute inset-2 rounded-full border-2 border-transparent border-t-primary border-r-primary/40 animate-spin [animation-duration:2s]"
          />
          <div className="absolute inset-4 rounded-full border border-t-primary animate-spin [animation-duration:1.2s] [animation-direction:reverse]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="size-6 text-primary animate-pulse [animation-duration:1.5s]" />
          </div>
        </div>

        <div className="text-center space-y-1.5 px-6">
          <p className="shimmer-txt text-white/90 font-semibold text-sm tracking-wide">
            Generating your design
          </p>
          <p className="text-white/40 text-xs">AI is crafting your landing page canvas…</p>
        </div>

        {/* Bouncing dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      </div>

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </div>
  );
}

export function LandingPageGeneratorForm() {
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1);

  const [productImages, setProductImages] = useState<File[]>([]);
  const [productName, setProductName] = useState("");

  const [language, setLanguage] = useState<CopyLanguage>("en");
  const [dialect, setDialect] = useState<ArabicDialect>("standard");

  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");

  const [copyData, setCopyData] = useState<CopyData | null>(null);
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [isCopyPending, startCopyTransition] = useTransition();

  const [result, setResult] = useState<GenerateResult | null>(null);
  const [isDesignPending, startDesignTransition] = useTransition();

  const currentPhase: Phase = result
    ? "Design"
    : copyData
      ? "Review"
      : formStep === 1
        ? "Product"
        : formStep === 2
          ? "Language"
          : "Pricing";

  const handleGenerateCopy = () => {
    startCopyTransition(async () => {
      const formattedPrice = `${price} ${currency}`;
      const { copy, features: feats } = await generateCopyAndFeatures(
        productImages,
        language,
        dialect,
        productName,
        formattedPrice
      );
      setCopyData(copy);
      setFeatures(feats.features);
    });
  };

  const handleGenerateDesign = () => {
    startDesignTransition(async () => {
      const updatedCopy = copyData!;
      const updatedFeatures: z.infer<typeof featuresOutputSchema> = { features };
      const data = await generateDesignAndImage(
        updatedCopy,
        updatedFeatures,
        productImages
      );
      setResult(data);
    });
  };

  const updateSection1 = (field: string, value: string | null) => {
    setCopyData((prev) =>
      prev ? { ...prev, section_1: { ...prev.section_1, [field]: value } } : prev
    );
  };

  const updateSection3 = (field: string, value: string | null) => {
    setCopyData((prev) =>
      prev ? { ...prev, section_3: { ...prev.section_3, [field]: value } } : prev
    );
  };

  const updateFeature = (idx: number, field: keyof FeatureItem, value: string) => {
    setFeatures((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, [field]: value } : f))
    );
  };

  const handleReset = () => {
    setResult(null);
    setCopyData(null);
    setFeatures([]);
    setProductImages([]);
    setProductName("");
    setPrice("");
    setFormStep(1);
  };

  return (
    <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-start">
      {/* ── LEFT COLUMN: form ── */}
      <div className="flex-1 min-w-0 max-w-2xl space-y-6">
      <StepIndicator phase={currentPhase} />

      {/* ── WIZARD STEPS 1–3 ── */}
      {!copyData && !result && (
        <Card>
          <CardHeader>
            <CardTitle>
              {formStep === 1 && "Product details"}
              {formStep === 2 && "Language & dialect"}
              {formStep === 3 && "Pricing"}
            </CardTitle>
            <CardDescription>
              {formStep === 1 && "Upload your product images and enter the product name."}
              {formStep === 2 && "Choose the output language for your landing page copy."}
              {formStep === 3 && "Set the product price and currency."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <FieldGroup>
              {formStep === 1 && (
                <>
                  <Field>
                    <FieldLabel>
                      <FieldTitle>Product images</FieldTitle>
                    </FieldLabel>
                    <FieldContent>
                      <ImagePicker value={productImages} onChange={setProductImages} />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel>
                      <FieldTitle>Product name</FieldTitle>
                    </FieldLabel>
                    <Input
                      placeholder="e.g. NovaX Pro Headphones"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                    />
                  </Field>
                </>
              )}

              {formStep === 2 && (
                <>
                  <Field>
                    <FieldLabel>
                      <FieldTitle>Language</FieldTitle>
                    </FieldLabel>
                    <Select
                      value={language}
                      onValueChange={(v) => setLanguage(v as CopyLanguage)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  {language === "ar" && (
                    <Field>
                      <FieldLabel>
                        <FieldTitle>Arabic dialect</FieldTitle>
                      </FieldLabel>
                      <Select
                        value={dialect}
                        onValueChange={(v) => setDialect(v as ArabicDialect)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ARABIC_DIALECTS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                </>
              )}

              {formStep === 3 && (
                <Field>
                  <FieldLabel>
                    <FieldTitle>Price</FieldTitle>
                  </FieldLabel>
                  <div className="flex gap-2">
                    <Select
                      value={currency}
                      onValueChange={(v) => setCurrency(v as Currency)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      className="flex-1"
                      type="text"
                      placeholder="29.99"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </Field>
              )}
            </FieldGroup>
          </CardContent>

          <CardFooter className="flex justify-between">
            {formStep > 1 ? (
              <Button
                variant="ghost"
                onClick={() => setFormStep((s) => (s - 1) as 1 | 2 | 3)}
              >
                <ChevronLeft className="size-4 mr-1" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {formStep < 3 ? (
              <Button onClick={() => setFormStep((s) => (s + 1) as 2 | 3)}>
                Next
                <ChevronRight className="size-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleGenerateCopy} disabled={isCopyPending}>
                {isCopyPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    Generate copy & features
                    <ChevronRight className="size-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      )}

      {/* ── COPY + FEATURES REVIEW ── */}
      {copyData && !result && (
        <div className="space-y-4">
          {/* Copy editor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Copy</CardTitle>
              <CardDescription>
                Edit the generated copy before creating the design.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hero section */}
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Hero section
                </p>
                <FieldGroup>
                  <Field>
                    <FieldLabel>
                      <FieldTitle>Headline</FieldTitle>
                    </FieldLabel>
                    <Input
                      value={copyData.section_1.headline}
                      onChange={(e) => updateSection1("headline", e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>
                      <FieldTitle>Subheadline</FieldTitle>
                    </FieldLabel>
                    <Input
                      value={copyData.section_1.subheadline}
                      onChange={(e) => updateSection1("subheadline", e.target.value)}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field>
                      <FieldLabel>
                        <FieldTitle>Tag</FieldTitle>
                      </FieldLabel>
                      <Input
                        value={copyData.section_1.tag}
                        onChange={(e) => updateSection1("tag", e.target.value)}
                        placeholder="e.g. New Arrival"
                      />
                    </Field>
                    <Field>
                      <FieldLabel>
                        <FieldTitle>Badge</FieldTitle>
                      </FieldLabel>
                      <Input
                        value={copyData.section_1.badge_text ?? ""}
                        onChange={(e) =>
                          updateSection1("badge_text", e.target.value || null)
                        }
                        placeholder="e.g. –20% OFF"
                      />
                    </Field>
                  </div>
                </FieldGroup>
              </div>

              {/* Conversion section */}
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Conversion section
                </p>
                <FieldGroup>
                  <Field>
                    <FieldLabel>
                      <FieldTitle>Headline</FieldTitle>
                    </FieldLabel>
                    <Input
                      value={copyData.section_3.headline}
                      onChange={(e) => updateSection3("headline", e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>
                      <FieldTitle>Subheadline</FieldTitle>
                    </FieldLabel>
                    <Input
                      value={copyData.section_3.subheadline}
                      onChange={(e) => updateSection3("subheadline", e.target.value)}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field>
                      <FieldLabel>
                        <FieldTitle>CTA text</FieldTitle>
                      </FieldLabel>
                      <Input
                        value={copyData.section_3.cta}
                        onChange={(e) => updateSection3("cta", e.target.value)}
                        placeholder="e.g. Shop Now"
                      />
                    </Field>
                    <Field>
                      <FieldLabel>
                        <FieldTitle>Displayed price</FieldTitle>
                      </FieldLabel>
                      <Input
                        value={copyData.section_3.price}
                        onChange={(e) => updateSection3("price", e.target.value)}
                        placeholder="e.g. $29.99"
                      />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>
                      <FieldTitle>Shop info</FieldTitle>
                    </FieldLabel>
                    <Input
                      value={copyData.section_3.shop_info ?? ""}
                      onChange={(e) =>
                        updateSection3("shop_info", e.target.value || null)
                      }
                      placeholder="e.g. Free shipping · 30-day returns"
                    />
                  </Field>
                </FieldGroup>
              </div>
            </CardContent>
          </Card>

          {/* Features repeater */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">Features</CardTitle>
                  <CardDescription>
                    Edit, add, or remove product feature cards.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFeatures((prev) => [...prev, { visual: "", text: "" }])}
                >
                  <Plus className="size-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {features.map((feat, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"
                >
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                        Label
                      </p>
                      <Input
                        value={feat.text}
                        onChange={(e) => updateFeature(i, "text", e.target.value)}
                        placeholder="e.g. Waterproof Design"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                        Visual hint
                      </p>
                      <Input
                        value={feat.visual}
                        onChange={(e) => updateFeature(i, "visual", e.target.value)}
                        placeholder="Visual concept for AI"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-muted-foreground hover:text-destructive mt-4"
                    onClick={() => setFeatures((prev) => prev.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="ghost"
                onClick={() => {
                  setCopyData(null);
                  setFeatures([]);
                }}
              >
                <ChevronLeft className="size-4 mr-1" />
                Back
              </Button>
              <Button onClick={handleGenerateDesign} disabled={isDesignPending}>
                {isDesignPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Generating design…
                  </>
                ) : (
                  <>
                    Generate design & image
                    <ChevronRight className="size-4 ml-1" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* ── DESIGN RESULT ── */}
      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Design spec</CardTitle>
                <Badge variant="secondary">{result.creative.background_motif}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3 text-sm">
              {(["section_1", "section_2", "section_3"] as const).map((key, i) => {
                const section = result.creative[key];
                return (
                  <div key={key} className="rounded-lg border p-3 space-y-1">
                    <p className="font-medium text-muted-foreground text-xs">
                      Section {i + 1}
                    </p>
                    {section?.visual_prompt_english && (
                      <p className="text-xs line-clamp-4">
                        {section.visual_prompt_english}
                      </p>
                    )}
                    {section?.composition_notes && (
                      <p className="text-xs text-muted-foreground line-clamp-2 italic">
                        {section.composition_notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Button variant="outline" onClick={handleReset}>
            Start over
          </Button>
        </div>
      )}
      </div>{/* end left column */}

      {/* ── RIGHT COLUMN: generated image / loading animation ── */}
      {(isDesignPending || result?.imageDataUrl) && (
        <div className="w-full lg:w-[400px] xl:w-[460px] shrink-0 lg:sticky lg:top-8">
          {isDesignPending ? (
            <AIGeneratingCanvas />
          ) : (
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" />
                      Generated landing page
                    </CardTitle>
                    <CardDescription>Single-canvas ad image for your product.</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = result!.imageDataUrl!;
                      a.download = "landing-page.png";
                      a.click();
                    }}
                  >
                    <Download className="size-4 mr-1.5" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-hidden bg-muted">
                  <img
                    src={result!.imageDataUrl!}
                    alt="Generated landing page"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
