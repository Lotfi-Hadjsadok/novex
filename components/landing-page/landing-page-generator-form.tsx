"use client";

import { useTransition, useState } from "react";
import { useTranslations } from "next-intl";
import { useSyncLocaleLanguage } from "@/hooks/use-sync-locale-language";
import {
  ARABIC_DIALECTS,
  CURRENCIES,
  type ArabicDialect,
  type CopyLanguage,
  type Currency,
} from "@/types/landing-page";
import type { featuresOutputSchema } from "@/lib/ai/product-landing-page/features";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ChevronLeft, ChevronRight, Download, Loader2, Plus, Trash2 } from "lucide-react";
import { useLandingPageStore } from "@/store/landing-page-store";
import type { Phase } from "@/store/landing-page-store";
import { StepIndicator } from "./step-indicator";
import { AIGeneratingCanvas } from "./ai-generating-canvas";
import { ReviewCanvasSkeleton } from "./review-canvas-skeleton";
import { StepCanvasSkeleton } from "./step-canvas-skeleton";
import { CopyGeneratingSkeleton } from "./copy-generating-skeleton";

export function LandingPageGeneratorForm() {
  const tc = useTranslations("common");
  const tf = useTranslations("landingPage.form");
  const tr = useTranslations("landingPage.review");
  const tDialect = useTranslations("arabicDialects");

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
    customPrompt,
    setCustomPrompt,
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

  useSyncLocaleLanguage(setLanguage);

  const currentPhase: Phase = result
    ? "Design"
    : copyData
      ? "Review"
      : formStep === 1
        ? "Product"
        : "Pricing";

  const handleGenerateCopy = () => {
    startCopyTransition(async () => {
      const formattedPrice = `${price} ${currency}`;
      const { copy, features: generatedFeatures } = await generateCopyAndFeatures(
        productImages,
        language,
        dialect,
        productName,
        formattedPrice,
        customPrompt?.trim() || undefined
      );
      setCopyData(copy);
      setFeatures(generatedFeatures.features);
    });
  };

  const handleGenerateDesign = () => {
    startDesignTransition(async () => {
      const updatedFeatures: z.infer<typeof featuresOutputSchema> = { features };
      const generatedDesigner = await generateDesignerStep(copyData!, updatedFeatures, productImages, customPrompt?.trim() || undefined);
      setDesigner(generatedDesigner);
      const data = await generateImageStep(generatedDesigner, copyData!, updatedFeatures, productImages, customPrompt?.trim() || undefined);
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
                {formStep === 1 && tf("productDetails")}
                {formStep === 2 && tf("pricing")}
              </CardTitle>
              <CardDescription>
                {formStep === 1 && tf("productDetailsDesc")}
                {formStep === 2 && tf("pricingDesc")}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <FieldGroup>
                {formStep === 1 && (
                  <>
                    <Field>
                      <FieldLabel>
                        <FieldTitle>{tc("productImages")}</FieldTitle>
                      </FieldLabel>
                      <FieldContent>
                        <ImagePicker value={productImages} onChange={setProductImages} />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>
                        <FieldTitle>{tc("productName")}</FieldTitle>
                      </FieldLabel>
                      <Input
                        placeholder={tc("productNamePlaceholder")}
                        value={productName}
                        onChange={(event) => setProductName(event.target.value)}
                      />
                    </Field>

                    {language === "ar" && (
                      <Field>
                        <FieldLabel>
                          <FieldTitle>{tc("arabicDialect")}</FieldTitle>
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
                                {tDialect(dialectOption.value)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  </>
                )}

                {formStep === 2 && (
                  <>
                    <Field>
                      <FieldLabel>
                        <FieldTitle>{tc("price")}</FieldTitle>
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
                          placeholder={tc("pricePlaceholder")}
                          value={price}
                          onChange={(event) => setPrice(event.target.value)}
                        />
                      </div>
                    </Field>
                    <Field>
                      <FieldLabel>
                        <FieldTitle>{tc("customInstructions")}</FieldTitle>
                      </FieldLabel>
                      <Textarea
                        placeholder={tf("customPlaceholder")}
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                      />
                    </Field>
                  </>
                )}
              </FieldGroup>
            </CardContent>

            <CardFooter className="flex justify-between">
              {formStep > 1 ? (
                <Button
                  variant="ghost"
                  onClick={() => setFormStep((formStep - 1) as 1 | 2 | 3)}
                >
                  <ChevronLeft className="size-4 me-1" />
                  {tc("back")}
                </Button>
              ) : (
                <div />
              )}

              {formStep < 2 ? (
                <Button onClick={() => setFormStep((formStep + 1) as 2 | 3)}>
                  {tc("next")}
                  <ChevronRight className="size-4 ms-1" />
                </Button>
              ) : (
                <Button onClick={handleGenerateCopy} disabled={isCopyPending}>
                  {isCopyPending ? (
                    <>
                      <Loader2 className="size-4 me-2 animate-spin" />
                      {tc("generating")}
                    </>
                  ) : (
                    <>
                      {tf("generateCopyAndFeatures")}
                      <ChevronRight className="size-4 ms-1" />
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
                <CardTitle className="text-base">{tr("copy")}</CardTitle>
                <CardDescription>{tr("copyDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {tr("heroSection")}
                  </p>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>
                        <FieldTitle>{tc("headline")}</FieldTitle>
                      </FieldLabel>
                      <Input
                        value={copyData.section_1.headline}
                        onChange={(event) => updateSection1("headline", event.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>
                        <FieldTitle>{tc("subheadline")}</FieldTitle>
                      </FieldLabel>
                      <Input
                        value={copyData.section_1.subheadline}
                        onChange={(event) => updateSection1("subheadline", event.target.value)}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel>
                          <FieldTitle>{tc("tag")}</FieldTitle>
                        </FieldLabel>
                        <Input
                          value={copyData.section_1.tag ?? ""}
                          onChange={(event) => updateSection1("tag", event.target.value.trim() || null)}
                          placeholder={tc("tagPlaceholder")}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>
                          <FieldTitle>{tc("badge")}</FieldTitle>
                        </FieldLabel>
                        <Input
                          value={copyData.section_1.badge_text ?? ""}
                          onChange={(event) =>
                            updateSection1("badge_text", event.target.value || null)
                          }
                          placeholder={tc("badgePlaceholder")}
                        />
                      </Field>
                    </div>
                  </FieldGroup>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {tr("conversionSection")}
                  </p>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>
                        <FieldTitle>{tc("headline")}</FieldTitle>
                      </FieldLabel>
                      <Input
                        value={copyData.section_3.headline}
                        onChange={(event) => updateSection3("headline", event.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>
                        <FieldTitle>{tc("subheadline")}</FieldTitle>
                      </FieldLabel>
                      <Input
                        value={copyData.section_3.subheadline}
                        onChange={(event) => updateSection3("subheadline", event.target.value)}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel>
                          <FieldTitle>{tc("ctaText")}</FieldTitle>
                        </FieldLabel>
                        <Input
                          value={copyData.section_3.cta}
                          onChange={(event) => updateSection3("cta", event.target.value)}
                          placeholder={tc("ctaPlaceholder")}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>
                          <FieldTitle>{tr("displayedPrice")}</FieldTitle>
                        </FieldLabel>
                        <Input
                          value={copyData.section_3.price}
                          onChange={(event) => updateSection3("price", event.target.value)}
                          placeholder={tc("pricePlaceholder")}
                        />
                      </Field>
                    </div>
                    <Field>
                      <FieldLabel>
                        <FieldTitle>{tc("shopInfo")}</FieldTitle>
                      </FieldLabel>
                      <Input
                        value={copyData.section_3.shop_info ?? ""}
                        onChange={(event) =>
                          updateSection3("shop_info", event.target.value || null)
                        }
                        placeholder={tc("shopInfoPlaceholder")}
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
                    <CardTitle className="text-base">{tc("features")}</CardTitle>
                    <CardDescription>{tr("featuresDesc")}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={addFeature}>
                    <Plus className="size-3.5 me-1" />
                    {tc("add")}
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
                          {tc("label")}
                        </p>
                        <Input
                          value={featureItem.text}
                          onChange={(event) => updateFeature(featureIndex, "text", event.target.value)}
                          placeholder={tc("labelPlaceholder")}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                          {tc("visualHint")}
                        </p>
                        <Input
                          value={featureItem.visual}
                          onChange={(event) => updateFeature(featureIndex, "visual", event.target.value)}
                          placeholder={tc("visualHintPlaceholder")}
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
                  <ChevronLeft className="size-4 me-1" />
                  {tc("back")}
                </Button>
                <Button onClick={handleGenerateDesign} disabled={isDesignPending}>
                  {isDesignPending ? (
                    <>
                      <Loader2 className="size-4 me-2 animate-spin" />
                      {tc("generatingDesign")}
                    </>
                  ) : (
                    <>
                      {tc("generateDesignAndImage")}
                      <ChevronRight className="size-4 ms-1" />
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
              alt={tc("generatedAltLanding")}
              className="w-full h-auto object-contain"
              style={{ display: isImageLoaded ? "block" : "none" }}
              onLoad={() => setIsImageLoaded(true)}
            />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
              <Button size="sm" variant="outline" onClick={reset} className="bg-background/90 backdrop-blur-sm shadow-sm">
                {tc("startOver")}
              </Button>
              <Button size="sm" variant="secondary" onClick={handleDownloadImage} className="shadow-sm">
                <Download className="size-4 me-1.5" />
                {tc("download")}
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
