"use client";

import { useActionState, useState, useEffect, startTransition } from "react";
import {
  ARABIC_DIALECTS,
  CURRENCIES,
  LANGUAGES,
  type ArabicDialect,
  type CopyLanguage,
  type Currency,
} from "@/types/landing-page";
import { AD_ASPECT_RATIOS, getRatioCssAspect, type AdAspectRatio } from "@/types/ad-creative";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdCreativeStore } from "@/store/ad-creative-store";
import type { AdCreativePhase } from "@/store/ad-creative-store";
import { AdCreativeStepIndicator } from "./step-indicator";
import {
  AdCreativeGeneratingCanvas,
  AdCreativeReviewSkeleton,
  AdCreativeStepCanvas,
} from "./ai-generating-canvas";
import {
  generateAdCreativeCopyAction,
  generateAdCreativeDesignerAction,
  generateAdCreativeImageAction,
} from "@/app/actions/ad-creative";

// ─── Copy generating skeleton ────────────────────────────────────────────────

function CopyGeneratingSkeleton() {
  return (
    <Card>
      <style>{`
        @keyframes acf-fill {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .acf-fill-bar { transform-origin: left; animation: acf-fill 1.8s ease-out forwards; }
      `}</style>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
            <Sparkles className="size-4 text-primary animate-pulse" />
          </div>
          <div className="space-y-0.5 pt-0.5">
            <CardTitle className="text-base">Generating ad copy</CardTitle>
            <CardDescription>AI is analyzing your product and writing ad creative copy…</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3.5">
          {(
            [
              { label: "Analyzing product images", pct: 80 },
              { label: "Writing headline & copy",  pct: 55 },
              { label: "Crafting feature labels",  pct: 30 },
            ] as const
          ).map(({ label, pct }, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-bounce shrink-0"
                    style={{ background: "hsl(var(--primary))", animationDelay: `${i * 0.25}s` }}
                  />
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
                <span className="text-[10px] tabular-nums text-muted-foreground/50">{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="acf-fill-bar h-full rounded-full"
                  style={{ background: "hsl(var(--primary)/0.6)", width: `${pct}%`, animationDelay: `${i * 0.4}s` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Copy preview
          </p>
          <div className="space-y-2 animate-pulse">
            <div className="h-3.5 rounded-md bg-primary/10 w-4/5" />
            <div className="h-3.5 rounded-md bg-primary/10 w-[55%]" />
            <div className="h-2.5 rounded bg-muted w-2/3 mt-1" />
          </div>
          <div className="border-t border-border/40 pt-3 flex gap-2 flex-wrap">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-6 w-16 rounded-full bg-primary/12 animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Aspect ratio picker ──────────────────────────────────────────────────────

function AspectRatioPicker({
  value,
  onChange,
}: {
  value: AdAspectRatio;
  onChange: (ratio: AdAspectRatio) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {AD_ASPECT_RATIOS.map((ratio) => (
        <button
          key={ratio.value}
          type="button"
          onClick={() => onChange(ratio.value)}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border-2 p-2.5 transition-all duration-150",
            value === ratio.value
              ? "border-primary bg-primary/5 shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
              : "border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40"
          )}
        >
          <div className="flex items-center justify-center w-full h-9">
            <div
              className={cn(
                "rounded border-2 transition-colors",
                value === ratio.value ? "border-primary bg-primary/20" : "border-muted-foreground/40 bg-muted/50"
              )}
              style={{
                aspectRatio: getRatioCssAspect(ratio.value),
                maxWidth: "100%",
                maxHeight: "100%",
                width: ratio.value === "16:9" ? "100%" : undefined,
                height: ratio.value === "16:9" ? undefined : "100%",
              }}
            />
          </div>
          <div className="text-center">
            <p className={cn("text-[11px] font-semibold leading-none", value === ratio.value ? "text-primary" : "text-foreground")}>
              {ratio.label}
            </p>
            <p className="text-[9px] text-muted-foreground mt-0.5 leading-none">{ratio.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function AdCreativeGeneratorForm() {
  const {
    formStep,      setFormStep,
    productImages, setProductImages,
    productName,   setProductName,
    language,      setLanguage,
    dialect,       setDialect,
    price,         setPrice,
    currency,      setCurrency,
    aspectRatio,   setAspectRatio,
    copyData,      setCopyData,
    updateCopy,    updateFeature,
    addFeature,    removeFeature,
    designer,      setDesigner,
    result,        setResult,
    reset,
  } = useAdCreativeStore();

  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // ── Copy generation ──────────────────────────────────────────────────────
  const [, dispatchCopy, isCopyPending] = useActionState(
    async (_prev: null): Promise<null> => {
      const store = useAdCreativeStore.getState();
      const copy = await generateAdCreativeCopyAction(
        store.productImages,
        store.language,
        store.dialect,
        `${store.price} ${store.currency}`,
        store.productName
      );
      store.setCopyData(copy);
      return null;
    },
    null
  );

  // ── Designer generation ──────────────────────────────────────────────────
  const [, dispatchDesigner, isDesignerPending] = useActionState(
    async (_prev: null): Promise<null> => {
      const store = useAdCreativeStore.getState();
      const d = await generateAdCreativeDesignerAction(
        store.copyData!,
        store.productImages,
        store.aspectRatio
      );
      store.setDesigner(d);
      return null;
    },
    null
  );

  // ── Image generation ─────────────────────────────────────────────────────
  const [, dispatchImage, isImagePending] = useActionState(
    async (_prev: null): Promise<null> => {
      const store = useAdCreativeStore.getState();
      const imageData = await generateAdCreativeImageAction(
        store.designer!,
        store.copyData!,
        store.productImages,
        store.aspectRatio
      );
      store.setDesigner(null);
      store.setResult(imageData);
      return null;
    },
    null
  );

  // Auto-chain: when designer tokens arrive, start image generation
  useEffect(() => {
    if (!designer) return;
    startTransition(() => dispatchImage());
  }, [designer]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerateCopy = () => startTransition(() => dispatchCopy());

  const handleGenerateDesign = () => startTransition(() => dispatchDesigner());

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = result!.imageDataUrl!;
    link.download = `ad-creative-${aspectRatio.replace(":", "x")}.png`;
    link.click();
  };

  const isDesigning = isDesignerPending || isImagePending;
  const allDone     = !!result?.imageDataUrl;

  const currentPhase: AdCreativePhase = result
    ? "Design"
    : copyData
      ? "Review"
      : formStep === 1
        ? "Product"
        : formStep === 2
          ? "Language"
          : "Pricing";

  return (
    <div className="w-full max-w-6xl flex flex-col gap-8 items-start lg:flex-row">
      {/* ── Left panel (form) ── */}
      <div className="flex-1 min-w-0 max-w-2xl space-y-6">
        <AdCreativeStepIndicator phase={currentPhase} />

        {/* Copy generating skeleton */}
        {!copyData && isCopyPending && <CopyGeneratingSkeleton />}

        {/* Multi-step input form */}
        {((!copyData && !isCopyPending) || allDone) && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {formStep === 1 && "Product details"}
                  {formStep === 2 && "Language & dialect"}
                  {formStep === 3 && "Pricing & format"}
                </CardTitle>
                <CardDescription>
                  {formStep === 1 && "Upload your product images and enter the product name."}
                  {formStep === 2 && "Choose the output language for your ad copy."}
                  {formStep === 3 && "Set the price, currency, and ad format."}
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
                            {LANGUAGES.map((l) => (
                              <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
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
                              {ARABIC_DIALECTS.map((d) => (
                                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                      )}
                    </>
                  )}

                  {formStep === 3 && (
                    <>
                      <Field>
                        <FieldLabel>
                          <FieldTitle>Price</FieldTitle>
                        </FieldLabel>
                        <div className="flex gap-2">
                          <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CURRENCIES.map((c) => (
                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
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

                      <Field>
                        <FieldLabel>
                          <FieldTitle>Ad format</FieldTitle>
                        </FieldLabel>
                        <AspectRatioPicker value={aspectRatio} onChange={setAspectRatio} />
                      </Field>
                    </>
                  )}
                </FieldGroup>
              </CardContent>

              <CardFooter className="flex justify-between">
                {formStep > 1 ? (
                  <Button variant="ghost" onClick={() => setFormStep((formStep - 1) as 1 | 2 | 3)}>
                    <ChevronLeft className="size-4 mr-1" />
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {formStep < 3 ? (
                  <Button onClick={() => setFormStep((formStep + 1) as 2 | 3)}>
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
                        Generate copy
                        <ChevronRight className="size-4 ml-1" />
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )}

          {/* Copy editing form */}
          {copyData && !result && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ad copy</CardTitle>
                  <CardDescription>Edit the generated copy before creating the design.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FieldGroup>
                    <Field>
                      <FieldLabel><FieldTitle>Headline</FieldTitle></FieldLabel>
                      <Input
                        value={copyData.headline}
                        onChange={(e) => updateCopy("headline", e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel><FieldTitle>Subheadline</FieldTitle></FieldLabel>
                      <Input
                        value={copyData.subheadline}
                        onChange={(e) => updateCopy("subheadline", e.target.value)}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel><FieldTitle>Tag</FieldTitle></FieldLabel>
                        <Input
                          value={copyData.tag}
                          onChange={(e) => updateCopy("tag", e.target.value)}
                          placeholder="e.g. New Arrival"
                        />
                      </Field>
                      <Field>
                        <FieldLabel><FieldTitle>Badge</FieldTitle></FieldLabel>
                        <Input
                          value={copyData.badge_text ?? ""}
                          onChange={(e) => updateCopy("badge_text", e.target.value || null)}
                          placeholder="e.g. –20% OFF"
                        />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel><FieldTitle>CTA text</FieldTitle></FieldLabel>
                        <Input
                          value={copyData.cta}
                          onChange={(e) => updateCopy("cta", e.target.value)}
                          placeholder="e.g. Shop Now"
                        />
                      </Field>
                      <Field>
                        <FieldLabel><FieldTitle>Price</FieldTitle></FieldLabel>
                        <Input
                          value={copyData.price}
                          onChange={(e) => updateCopy("price", e.target.value)}
                          placeholder="e.g. $29.99"
                        />
                      </Field>
                    </div>
                    <Field>
                      <FieldLabel><FieldTitle>Shop info</FieldTitle></FieldLabel>
                      <Input
                        value={copyData.shop_info ?? ""}
                        onChange={(e) => updateCopy("shop_info", e.target.value || null)}
                        placeholder="e.g. Free shipping · 30-day returns"
                      />
                    </Field>
                  </FieldGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">Features</CardTitle>
                      <CardDescription>Edit or add the feature labels shown on the ad.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={addFeature}>
                      <Plus className="size-3.5 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {copyData.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"
                    >
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Label</p>
                          <Input
                            value={feature.text}
                            onChange={(e) => updateFeature(featureIndex, "text", e.target.value)}
                            placeholder="e.g. Waterproof Design"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Visual hint</p>
                          <Input
                            value={feature.visual}
                            onChange={(e) => updateFeature(featureIndex, "visual", e.target.value)}
                            placeholder="Visual concept for AI"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-muted-foreground hover:text-destructive mt-4"
                        onClick={() => removeFeature(featureIndex)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setCopyData(null)}
                  >
                    <ChevronLeft className="size-4 mr-1" />
                    Back
                  </Button>
                  <Button onClick={handleGenerateDesign} disabled={isDesigning}>
                    {isDesigning ? (
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
        </div>

      {/* ── Right panel (canvas preview) ── */}
      <div className="w-full shrink-0 lg:w-[360px] xl:w-[420px] lg:sticky lg:top-8">
        {isDesigning ? (
          <AdCreativeGeneratingCanvas designer={designer} aspectRatio={aspectRatio} />
        ) : result?.imageDataUrl ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button size="sm" variant="outline" onClick={reset}>
                Start over
              </Button>
              <Button size="sm" variant="secondary" onClick={handleDownload}>
                <Download className="size-4 mr-1.5" />
                Download
              </Button>
            </div>
            <div className="relative">
              {!isImageLoaded && (
                <Skeleton className="w-full rounded-2xl" style={{ aspectRatio: getRatioCssAspect(aspectRatio) }} />
              )}
              <img
                src={result.imageDataUrl}
                alt="Generated ad creative"
                className="w-full h-auto object-contain rounded-2xl"
                style={{ display: isImageLoaded ? "block" : "none" }}
                onLoad={() => setIsImageLoaded(true)}
              />
            </div>
          </div>
        ) : isCopyPending ? (
          <AdCreativeStepCanvas step={3} generating aspectRatio={aspectRatio} />
        ) : copyData ? (
          <AdCreativeReviewSkeleton copy={copyData} aspectRatio={aspectRatio} />
        ) : (
          <AdCreativeStepCanvas step={formStep} aspectRatio={aspectRatio} />
        )}
      </div>
    </div>
  );
}
