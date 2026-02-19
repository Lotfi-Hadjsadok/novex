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
  generateDesignerStep,
  generateImageStep,
} from "@/app/actions/landing-page";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Download, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { useLandingPageStore } from "@/store/landing-page-store";
import type { Phase } from "@/store/landing-page-store";
import { StepIndicator } from "./step-indicator";
import { AIGeneratingCanvas, ReviewCanvasSkeleton, StepCanvasSkeleton } from "./ai-generating-canvas";

function CopyGeneratingSkeleton() {
  return (
    <Card>
      <style>{`
        @keyframes cg-fill {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .cg-fill-bar {
          transform-origin: left;
          animation: cg-fill 1.8s ease-out forwards;
        }
      `}</style>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
            <Sparkles className="size-4 text-primary animate-pulse" />
          </div>
          <div className="space-y-0.5 pt-0.5">
            <CardTitle className="text-base">Generating copy & features</CardTitle>
            <CardDescription>
              AI is analyzing your product and writing landing page content…
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Animated task progress */}
        <div className="space-y-3.5">
          {(
            [
              { label: "Analyzing product images",  pct: 80 },
              { label: "Writing hero headlines",     pct: 55 },
              { label: "Crafting feature cards",     pct: 30 },
            ] as const
          ).map(({ label, pct }, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-bounce shrink-0"
                    style={{
                      background: "hsl(var(--primary))",
                      animationDelay: `${i * 0.25}s`,
                    }}
                  />
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
                <span className="text-[10px] tabular-nums text-muted-foreground/50">{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="cg-fill-bar h-full rounded-full"
                  style={{
                    background: "hsl(var(--primary)/0.6)",
                    width: `${pct}%`,
                    animationDelay: `${i * 0.4}s`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Copy preview skeleton */}
        <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Hero copy preview
          </p>
          <div className="space-y-2 animate-pulse">
            <div className="h-3.5 rounded-md bg-primary/10 w-4/5" />
            <div className="h-3.5 rounded-md bg-primary/10 w-[58%]" />
            <div className="h-2.5 rounded bg-muted w-2/3 mt-1" />
          </div>

          <div className="border-t border-border/40 pt-3 space-y-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Feature cards
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-lg border bg-background p-3 space-y-2 animate-pulse"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className="h-5 w-5 rounded-md bg-primary/12 mx-auto" />
                  <div className="h-2 rounded bg-muted w-full" />
                  <div className="h-2 rounded bg-muted w-3/4 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LandingPageGeneratorForm() {
  const {
    formStep,
    setFormStep,
    productImages,
    setProductImages,
    productName,
    setProductName,
    language,
    setLanguage,
    dialect,
    setDialect,
    price,
    setPrice,
    currency,
    setCurrency,
    copyData,
    setCopyData,
    features,
    setFeatures,
    designer,
    setDesigner,
    result,
    setResult,
    updateSection1,
    updateSection3,
    updateFeature,
    addFeature,
    removeFeature,
    reset,
  } = useLandingPageStore();

  const [isCopyPending, startCopyTransition] = useTransition();
  const [isDesignPending, startDesignTransition] = useTransition();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

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
      const { copy, features: generatedFeatures } = await generateCopyAndFeatures(
        productImages,
        language,
        dialect,
        productName,
        formattedPrice
      );
      setCopyData(copy);
      setFeatures(generatedFeatures.features);
    });
  };

  const handleGenerateDesign = () => {
    startDesignTransition(async () => {
      const updatedFeatures: z.infer<typeof featuresOutputSchema> = { features };
      const generatedDesigner = await generateDesignerStep(copyData!, updatedFeatures, productImages);
      setDesigner(generatedDesigner);
      const data = await generateImageStep(generatedDesigner, copyData!, updatedFeatures, productImages);
      setDesigner(null);
      setIsImageLoaded(false);
      setResult(data);
    });
  };

  const handleDownloadImage = () => {
    const downloadLink = document.createElement("a");
    downloadLink.href = result!.imageDataUrl!;
    downloadLink.download = "landing-page.png";
    downloadLink.click();
  };

  const allStepsDone = !!result?.imageDataUrl;

  return (
    <div className={`w-full max-w-6xl flex flex-col gap-8 items-start ${allStepsDone ? "lg:justify-center lg:items-center" : "lg:flex-row"}`}>
      {!allStepsDone && (
      <div className="flex-1 min-w-0 max-w-2xl space-y-6">
        <StepIndicator phase={currentPhase} />

        {!copyData && !result && isCopyPending && <CopyGeneratingSkeleton />}

        {!copyData && !result && !isCopyPending && (
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
                        onChange={(event) => setProductName(event.target.value)}
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
                        onValueChange={(selectedValue) => setLanguage(selectedValue as CopyLanguage)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((languageOption) => (
                            <SelectItem key={languageOption.value} value={languageOption.value}>
                              {languageOption.label}
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
                          onValueChange={(selectedValue) => setDialect(selectedValue as ArabicDialect)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ARABIC_DIALECTS.map((dialectOption) => (
                              <SelectItem key={dialectOption.value} value={dialectOption.value}>
                                {dialectOption.label}
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
                        onValueChange={(selectedValue) => setCurrency(selectedValue as Currency)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((currencyOption) => (
                            <SelectItem key={currencyOption.value} value={currencyOption.value}>
                              {currencyOption.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        className="flex-1"
                        type="text"
                        placeholder="29.99"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
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
                  onClick={() => setFormStep((formStep - 1) as 1 | 2 | 3)}
                >
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
                      Generate copy & features
                      <ChevronRight className="size-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        )}

        {copyData && !result && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Copy</CardTitle>
                <CardDescription>
                  Edit the generated copy before creating the design.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                        onChange={(event) => updateSection1("headline", event.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>
                        <FieldTitle>Subheadline</FieldTitle>
                      </FieldLabel>
                      <Input
                        value={copyData.section_1.subheadline}
                        onChange={(event) => updateSection1("subheadline", event.target.value)}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel>
                          <FieldTitle>Tag</FieldTitle>
                        </FieldLabel>
                        <Input
                          value={copyData.section_1.tag}
                          onChange={(event) => updateSection1("tag", event.target.value)}
                          placeholder="e.g. New Arrival"
                        />
                      </Field>
                      <Field>
                        <FieldLabel>
                          <FieldTitle>Badge</FieldTitle>
                        </FieldLabel>
                        <Input
                          value={copyData.section_1.badge_text ?? ""}
                          onChange={(event) =>
                            updateSection1("badge_text", event.target.value || null)
                          }
                          placeholder="e.g. –20% OFF"
                        />
                      </Field>
                    </div>
                  </FieldGroup>
                </div>

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
                        onChange={(event) => updateSection3("headline", event.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>
                        <FieldTitle>Subheadline</FieldTitle>
                      </FieldLabel>
                      <Input
                        value={copyData.section_3.subheadline}
                        onChange={(event) => updateSection3("subheadline", event.target.value)}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel>
                          <FieldTitle>CTA text</FieldTitle>
                        </FieldLabel>
                        <Input
                          value={copyData.section_3.cta}
                          onChange={(event) => updateSection3("cta", event.target.value)}
                          placeholder="e.g. Shop Now"
                        />
                      </Field>
                      <Field>
                        <FieldLabel>
                          <FieldTitle>Displayed price</FieldTitle>
                        </FieldLabel>
                        <Input
                          value={copyData.section_3.price}
                          onChange={(event) => updateSection3("price", event.target.value)}
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
                        onChange={(event) =>
                          updateSection3("shop_info", event.target.value || null)
                        }
                        placeholder="e.g. Free shipping · 30-day returns"
                      />
                    </Field>
                  </FieldGroup>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">Features</CardTitle>
                    <CardDescription>
                      Edit, add, or remove product feature cards.
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={addFeature}>
                    <Plus className="size-3.5 mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {features.map((featureItem, featureIndex) => (
                  <div
                    key={featureIndex}
                    className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                          Label
                        </p>
                        <Input
                          value={featureItem.text}
                          onChange={(event) => updateFeature(featureIndex, "text", event.target.value)}
                          placeholder="e.g. Waterproof Design"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                          Visual hint
                        </p>
                        <Input
                          value={featureItem.visual}
                          onChange={(event) => updateFeature(featureIndex, "visual", event.target.value)}
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

      </div>
      )}

      <div className={`w-full shrink-0 ${allStepsDone ? "max-w-[460px] mx-auto" : "lg:w-[400px] xl:w-[460px] lg:sticky lg:top-8"}`}>
        {isDesignPending ? (
          <AIGeneratingCanvas designer={designer} />
        ) : result?.imageDataUrl ? (
          <div className="relative">
            {!isImageLoaded && (
              <Skeleton className="w-full" style={{ aspectRatio: "600 / 1584" }} />
            )}
            <img
              src={result.imageDataUrl}
              alt="Generated landing page"
              className="w-full h-auto object-contain"
              style={{ display: isImageLoaded ? "block" : "none" }}
              onLoad={() => setIsImageLoaded(true)}
            />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
              <Button size="sm" variant="outline" onClick={reset} className="bg-background/90 backdrop-blur-sm shadow-sm">
                Start over
              </Button>
              <Button size="sm" variant="secondary" onClick={handleDownloadImage} className="shadow-sm">
                <Download className="size-4 mr-1.5" />
                Download
              </Button>
            </div>
          </div>
        ) : isCopyPending ? (
          <StepCanvasSkeleton step={3} generating />
        ) : copyData ? (
          <ReviewCanvasSkeleton copyData={copyData} features={features} />
        ) : (
          <StepCanvasSkeleton step={formStep} />
        )}
      </div>
    </div>
  );
}
