"use client";

import { useActionState, useState, useEffect, startTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ARABIC_DIALECTS,
  CURRENCIES,
  type ArabicDialect,
  type CopyLanguage,
  type Currency,
} from "@/types/landing-page";
import { getRatioCssAspect, type AdAspectRatio } from "@/types/ad-creative";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdCreativeStore } from "@/store/ad-creative-store";
import type { AdCreativePhase } from "@/store/ad-creative-store";
import { AdCreativeStepIndicator } from "./step-indicator";
import { AdCreativeGeneratingCanvas } from "./ai-generating-canvas";
import { AdCreativeReviewSkeleton } from "./ad-creative-review-skeleton";
import { AdCreativeStepCanvas } from "./ad-creative-step-canvas";
import {
  generateAdCreativeCopyAction,
  generateAdCreativeDesignerAction,
  generateAdCreativeImageAction,
} from "@/app/actions/ad-creative";
import { CopyGeneratingSkeleton } from "./copy-generating-skeleton";
import { AspectRatioPicker } from "./aspect-ratio-picker";

export function AdCreativeGeneratorForm() {
  const locale = useLocale();
  const tc = useTranslations("common");
  const tf = useTranslations("adCreative.form");
  const tr = useTranslations("adCreative.review");
  const tDialect = useTranslations("arabicDialects");

  const {
    formStep,      setFormStep,
    productImages, setProductImages,
    productName,   setProductName,
    language,      setLanguage,
    dialect,       setDialect,
    price,         setPrice,
    currency,      setCurrency,
    customPrompt,  setCustomPrompt,
    aspectRatio,   setAspectRatio,
    copyData,      setCopyData,
    updateCopy,    updateFeature,
    addFeature,    removeFeature,
    designer,      setDesigner,
    result,        setResult,
    reset,
  } = useAdCreativeStore();

  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    const validLocales = ["en", "fr", "ar"];
    if (validLocales.includes(locale)) {
      setLanguage(locale as CopyLanguage);
    }
  }, [locale, setLanguage]);

  const [, dispatchCopy, isCopyPending] = useActionState(
    async (_prev: null): Promise<null> => {
      const store = useAdCreativeStore.getState();
      const copy = await generateAdCreativeCopyAction(
        store.productImages,
        store.language,
        store.dialect,
        store.price.trim() ? `${store.price.trim()} ${store.currency}` : "",
        store.productName,
        store.customPrompt?.trim() || undefined
      );
      store.setCopyData(copy);
      return null;
    },
    null
  );

  const [, dispatchDesigner, isDesignerPending] = useActionState(
    async (_prev: null): Promise<null> => {
      const store = useAdCreativeStore.getState();
      const d = await generateAdCreativeDesignerAction(
        store.copyData!,
        store.productImages,
        store.aspectRatio,
        store.customPrompt?.trim() || undefined
      );
      store.setDesigner(d);
      return null;
    },
    null
  );

  const [, dispatchImage, isImagePending] = useActionState(
    async (_prev: null): Promise<null> => {
      const store = useAdCreativeStore.getState();
      const imageData = await generateAdCreativeImageAction(
        store.designer!,
        store.copyData!,
        store.productImages,
        store.aspectRatio,
        store.customPrompt?.trim() || undefined
      );
      store.setDesigner(null);
      store.setResult(imageData);
      return null;
    },
    null
  );

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
        : "Pricing";

  return (
    <div className="w-full max-w-6xl flex flex-col gap-8 items-start lg:flex-row">
      <div className="flex-1 min-w-0 max-w-2xl space-y-6">
        <AdCreativeStepIndicator phase={currentPhase} />

        {!copyData && isCopyPending && <CopyGeneratingSkeleton />}

        {((!copyData && !isCopyPending) || allDone) && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {formStep === 1 && tf("productDetails")}
                  {formStep === 2 && tf("pricingAndFormat")}
                </CardTitle>
                <CardDescription>
                  {formStep === 1 && tf("productDetailsDesc")}
                  {formStep === 2 && (price.trim() ? tf("pricingAndFormatDesc") : tf("pricingAndFormatDesc"))}
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
                          onChange={(e) => setProductName(e.target.value)}
                        />
                      </Field>

                      {language === "ar" && (
                        <Field>
                          <FieldLabel>
                            <FieldTitle>{tc("arabicDialect")}</FieldTitle>
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
                                <SelectItem key={d.value} value={d.value}>{tDialect(d.value)}</SelectItem>
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
                          <FieldTitle>{price.trim() ? tc("price") : tc("priceOptional")}</FieldTitle>
                        </FieldLabel>
                        <div className="flex gap-2">
                          {price.trim() && (
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
                          )}
                          <Input
                            className="flex-1"
                            type="text"
                            placeholder={tc("pricePlaceholder")}
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                          />
                        </div>
                      </Field>

                      <Field>
                        <FieldLabel>
                          <FieldTitle>{tf("adFormat")}</FieldTitle>
                        </FieldLabel>
                        <AspectRatioPicker value={aspectRatio} onChange={setAspectRatio} />
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
                  <Button variant="ghost" onClick={() => setFormStep((formStep - 1) as 1 | 2 | 3)}>
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
                ) : allDone ? (
                  <Button variant="outline" onClick={reset}>
                    {tc("startOver")}
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
                        {tf("generateCopy")}
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
                  <CardTitle className="text-base">{tr("adCopy")}</CardTitle>
                  <CardDescription>{tr("adCopyDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FieldGroup>
                    <Field>
                      <FieldLabel><FieldTitle>{tc("headline")}</FieldTitle></FieldLabel>
                      <Input
                        value={copyData.headline}
                        onChange={(e) => updateCopy("headline", e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel><FieldTitle>{tc("subheadline")}</FieldTitle></FieldLabel>
                      <Input
                        value={copyData.subheadline}
                        onChange={(e) => updateCopy("subheadline", e.target.value)}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel><FieldTitle>{tc("tag")}</FieldTitle></FieldLabel>
                        <Input
                          value={copyData.tag ?? ""}
                          onChange={(e) => updateCopy("tag", e.target.value.trim() || null)}
                          placeholder={tc("tagPlaceholder")}
                        />
                      </Field>
                      <Field>
                        <FieldLabel><FieldTitle>{tc("badge")}</FieldTitle></FieldLabel>
                        <Input
                          value={copyData.badge_text ?? ""}
                          onChange={(e) => updateCopy("badge_text", e.target.value || null)}
                          placeholder={tc("badgePlaceholder")}
                        />
                      </Field>
                    </div>
                    <div className={cn("grid gap-3", copyData.price.trim() ? "grid-cols-2" : "grid-cols-1")}>
                      <Field>
                        <FieldLabel><FieldTitle>{tc("ctaText")}</FieldTitle></FieldLabel>
                        <Input
                          value={copyData.cta}
                          onChange={(e) => updateCopy("cta", e.target.value)}
                          placeholder={tc("ctaPlaceholder")}
                        />
                      </Field>
                      {copyData.price.trim() && (
                        <Field>
                          <FieldLabel><FieldTitle>{tc("price")}</FieldTitle></FieldLabel>
                          <Input
                            value={copyData.price}
                            onChange={(e) => updateCopy("price", e.target.value)}
                            placeholder={tc("pricePlaceholder")}
                          />
                        </Field>
                      )}
                    </div>
                    <Field>
                      <FieldLabel><FieldTitle>{tc("shopInfo")}</FieldTitle></FieldLabel>
                      <Input
                        value={copyData.shop_info ?? ""}
                        onChange={(e) => updateCopy("shop_info", e.target.value || null)}
                        placeholder={tc("shopInfoPlaceholder")}
                      />
                    </Field>
                  </FieldGroup>
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
                  {copyData.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"
                    >
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{tc("label")}</p>
                          <Input
                            value={feature.text}
                            onChange={(e) => updateFeature(featureIndex, "text", e.target.value)}
                            placeholder={tc("labelPlaceholder")}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{tc("visualHint")}</p>
                          <Input
                            value={feature.visual}
                            onChange={(e) => updateFeature(featureIndex, "visual", e.target.value)}
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
                    onClick={() => setCopyData(null)}
                  >
                    <ChevronLeft className="size-4 me-1" />
                    {tc("back")}
                  </Button>
                  <Button onClick={handleGenerateDesign} disabled={isDesigning}>
                    {isDesigning ? (
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

      <div className="w-full shrink-0 lg:w-[360px] xl:w-[420px] lg:sticky lg:top-8 lg:min-h-[520px] lg:flex lg:flex-col">
        {isDesigning ? (
          <AdCreativeGeneratingCanvas designer={designer} aspectRatio={aspectRatio} />
        ) : result?.imageDataUrl ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button size="sm" variant="outline" onClick={reset}>
                {tc("startOver")}
              </Button>
              <Button size="sm" variant="secondary" onClick={handleDownload}>
                <Download className="size-4 me-1.5" />
                {tc("download")}
              </Button>
            </div>
            <div className="relative">
              {!isImageLoaded && (
                <Skeleton className="w-full rounded-2xl" style={{ aspectRatio: getRatioCssAspect(aspectRatio) }} />
              )}
              <img
                src={result.imageDataUrl}
                alt={tc("generatedAltAd")}
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
