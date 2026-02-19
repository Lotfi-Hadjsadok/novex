"use client";

import { useTransition } from "react";
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
  generateDesignAndImage,
} from "@/app/actions/landing-page";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Download, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { useLandingPageStore } from "@/store/landing-page-store";
import type { Phase } from "@/store/landing-page-store";
import { StepIndicator } from "./step-indicator";
import { AIGeneratingCanvas } from "./ai-generating-canvas";

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
      const data = await generateDesignAndImage(
        copyData!,
        updatedFeatures,
        productImages
      );
      setResult(data);
    });
  };

  const handleDownloadImage = () => {
    const downloadLink = document.createElement("a");
    downloadLink.href = result!.imageDataUrl!;
    downloadLink.download = "landing-page.png";
    downloadLink.click();
  };

  return (
    <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-start">
      <div className="flex-1 min-w-0 max-w-2xl space-y-6">
        <StepIndicator phase={currentPhase} />

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
                {(["section_1", "section_2", "section_3"] as const).map((sectionKey, sectionIndex) => {
                  const section = result.creative[sectionKey];
                  return (
                    <div key={sectionKey} className="rounded-lg border p-3 space-y-1">
                      <p className="font-medium text-muted-foreground text-xs">
                        Section {sectionIndex + 1}
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

            <Button variant="outline" onClick={reset}>
              Start over
            </Button>
          </div>
        )}
      </div>

      <div className="w-full lg:w-[400px] xl:w-[460px] shrink-0 lg:sticky lg:top-8">
        {isDesignPending ? (
          <AIGeneratingCanvas />
        ) : result?.imageDataUrl ? (
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
                <Button size="sm" variant="secondary" onClick={handleDownloadImage}>
                  <Download className="size-4 mr-1.5" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden bg-muted">
                <img
                  src={result.imageDataUrl}
                  alt="Generated landing page"
                  className="w-full h-auto object-contain"
                />
              </div>
            </CardContent>
          </Card>
        ) : isCopyPending ? (
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-primary" />
                Generating copy & features
              </CardTitle>
              <CardDescription>
                AI is writing your landing page copy and feature list…
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center px-4">
                  Review and generate design in the next step
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="size-4 text-primary/70" />
                Preview
              </CardTitle>
              <CardDescription>
                Your generated landing page will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className=" rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 flex flex-col items-center justify-center gap-3 p-6">
                <div className="rounded-full bg-muted p-3">
                  <Sparkles className="size-6 text-muted-foreground/60" />
                </div>
                <p className="text-sm text-muted-foreground text-center max-w-[220px]">
                  Complete the steps on the left, then generate copy and design to see your landing page here.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
