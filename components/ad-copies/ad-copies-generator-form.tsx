"use client";

import { useActionState, startTransition, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ARABIC_DIALECTS,
  CURRENCIES,
  type ArabicDialect,
  type CopyLanguage,
  type Currency,
} from "@/types/landing-page";
import type { AdCopyAngleId } from "@/types/ad-copies";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge }    from "@/components/ui/badge";
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
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAdCopiesStore }            from "@/store/ad-copies-store";
import { generateAnglesAction, generateCopiesAction } from "@/app/actions/ad-copies";
import { AnglesGeneratingSkeleton } from "./angles-generating-skeleton";
import { CopiesGeneratingSkeleton } from "./copies-generating-skeleton";
import { TonePicker } from "./tone-picker";
import { SizePicker } from "./size-picker";
import { CountPicker } from "./count-picker";
import { AdCopiesStepIndicator } from "./step-indicator";
import { CopyCard } from "./copy-card";
import { AngleCard } from "./angle-card";

export function AdCopiesGeneratorForm() {
  const locale = useLocale();
  const tc = useTranslations("common");
  const tf = useTranslations("adCopies.form");
  const ta = useTranslations("adCopies.angles");
  const tr = useTranslations("adCopies.results");
  const tDialect = useTranslations("arabicDialects");

  const {
    formStep,        setFormStep,
    productImages,   setProductImages,
    productName,     setProductName,
    language,        setLanguage,
    dialect,         setDialect,
    tone,            setTone,
    useEmojis,       setUseEmojis,
    price,           setPrice,
    currency,        setCurrency,
    customPrompt,    setCustomPrompt,
    copySize,        setCopySize,
    copyCount,       setCopyCount,
    angles,          setAngles,
    selectedAngleId, setSelectedAngleId,
    generatedCopies, setGeneratedCopies,
    reset,
  } = useAdCopiesStore();

  useEffect(() => {
    const validLocales = ["en", "fr", "ar"];
    if (validLocales.includes(locale)) {
      setLanguage(locale as CopyLanguage);
    }
  }, [locale, setLanguage]);

  const [, dispatchAngles, isAnglesPending] = useActionState(
    async (_prev: null): Promise<null> => {
      const s = useAdCopiesStore.getState();
      const result = await generateAnglesAction(
        s.productImages,
        s.language,
        s.dialect,
        s.tone,
        `${s.price} ${s.currency}`,
        s.productName,
        s.customPrompt?.trim() || undefined
      );
      s.setAngles(result);
      s.setSelectedAngleId(result[0]?.id ?? null);
      return null;
    },
    null
  );

  const [, dispatchCopies, isCopiesPending] = useActionState(
    async (_prev: null): Promise<null> => {
      const s = useAdCopiesStore.getState();
      const angle = s.angles!.find((a) => a.id === s.selectedAngleId)!;
      const result = await generateCopiesAction(
        s.productImages,
        s.language,
        s.dialect,
        s.tone,
        s.copySize,
        s.useEmojis,
        `${s.price} ${s.currency}`,
        s.productName,
        s.copyCount,
        angle,
        s.customPrompt?.trim() || undefined
      );
      s.setGeneratedCopies(result);
      return null;
    },
    null
  );

  const handleGenerateAngles = () => startTransition(() => dispatchAngles());
  const handleGenerateCopies = () => startTransition(() => dispatchCopies());

  const selectedAngle = angles?.find((a) => a.id === selectedAngleId);

  const phase =
    generatedCopies          ? "Copies" :
    angles                   ? "Angles" :
    formStep === 1           ? "Product" :
    formStep === 2           ? "Settings" :
                               "Pricing";

  return (
    <div className="w-full max-w-3xl space-y-6">
      {!generatedCopies && (
        <AdCopiesStepIndicator step={formStep} phase={phase} />
      )}

      {isAnglesPending && <AnglesGeneratingSkeleton />}

      {!angles && !isAnglesPending && !generatedCopies && (
        <Card>
          <CardHeader>
            <CardTitle>
              {formStep === 1 && tf("productDetails")}
              {formStep === 2 && tf("toneAndStyle")}
              {formStep === 3 && tf("pricingAndFormat")}
            </CardTitle>
            <CardDescription>
              {formStep === 1 && tf("productDetailsDesc")}
              {formStep === 2 && tf("toneAndStyleDesc")}
              {formStep === 3 && tf("pricingAndFormatDesc")}
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
                </>
              )}

              {formStep === 2 && (
                <>
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

                  <Field>
                    <FieldLabel>
                      <FieldTitle>{tf("tone")}</FieldTitle>
                    </FieldLabel>
                    <TonePicker value={tone} onChange={setTone} />
                  </Field>

                  <Field>
                    <FieldLabel>
                      <FieldTitle>{tf("emojis")}</FieldTitle>
                    </FieldLabel>
                    <div className="flex gap-2">
                      {[
                        { label: tf("withoutEmojis"), value: false },
                        { label: tf("withEmojis"),    value: true  },
                      ].map((opt) => (
                        <button
                          key={String(opt.value)}
                          type="button"
                          onClick={() => setUseEmojis(opt.value)}
                          className={cn(
                            "flex-1 rounded-xl border-2 py-2.5 text-[13px] font-medium transition-all duration-150",
                            useEmojis === opt.value
                              ? "border-primary bg-primary/5 text-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
                              : "border-border bg-muted/20 text-foreground hover:border-primary/40"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </Field>
                </>
              )}

              {formStep === 3 && (
                <>
                  <Field>
                    <FieldLabel>
                      <FieldTitle>{tc("price")}</FieldTitle>
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
                        placeholder={tc("pricePlaceholder")}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                  </Field>

                  <Field>
                    <FieldLabel>
                      <FieldTitle>{tf("copySize")}</FieldTitle>
                    </FieldLabel>
                    <SizePicker value={copySize} onChange={setCopySize} />
                  </Field>

                  <Field>
                    <FieldLabel>
                      <FieldTitle>{tf("numberOfCopies")}</FieldTitle>
                    </FieldLabel>
                    <CountPicker value={copyCount} onChange={setCopyCount} />
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

            {formStep < 3 ? (
              <Button onClick={() => setFormStep((formStep + 1) as 2 | 3)}>
                {tc("next")}
                <ChevronRight className="size-4 ms-1" />
              </Button>
            ) : (
              <Button
                onClick={handleGenerateAngles}
                disabled={isAnglesPending || productImages.length === 0}
              >
                {isAnglesPending ? (
                  <>
                    <Loader2 className="size-4 me-2 animate-spin" />
                    {tc("generating")}
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 me-1.5" />
                    {tf("generateAngles")}
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      )}

      {angles && !generatedCopies && !isCopiesPending && (() => {
        const seen = new Set<string>();
        const uniqueAngles = angles.filter((a) => {
          if (seen.has(a.id)) return false;
          seen.add(a.id);
          return true;
        });
        return (
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{ta("chooseTitle")}</h2>
            <p className="text-sm text-muted-foreground">
              {ta("chooseDescription", { count: uniqueAngles.length })}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {uniqueAngles.map((angle, index) => (
              <div key={`${index}-${angle.id}`}>
                <AngleCard
                  angle={angle}
                  selected={selectedAngleId === angle.id}
                  onSelect={() => setSelectedAngleId(angle.id as AdCopyAngleId)}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => { setAngles(null); setSelectedAngleId(null); }}
              >
                <ChevronLeft className="size-4 me-1" />
                {tc("back")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateAngles}
                disabled={isAnglesPending}
              >
                <RefreshCw className={cn("size-3.5 me-1.5", isAnglesPending && "animate-spin")} />
                {tc("regenerate")}
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {selectedAngle && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[11px]">
                    {selectedAngle.name}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {copyCount} {copyCount === 1 ? "copy" : "copies"}
                  </span>
                </div>
              )}
              <Button onClick={handleGenerateCopies} disabled={!selectedAngleId || isCopiesPending}>
                {isCopiesPending ? (
                  <>
                    <Loader2 className="size-4 me-2 animate-spin" />
                    {ta("writing")}
                  </>
                ) : (
                  <>
                    <Zap className="size-4 me-1.5" />
                    {ta("chooseTitle")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        );
      })()}

      {isCopiesPending && <CopiesGeneratingSkeleton count={copyCount} />}

      {generatedCopies && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-semibold">
                {tr("title", { count: generatedCopies.length })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {selectedAngle?.name} · {copySize} · {useEmojis ? tr("withEmojis") : tr("noEmojis")} · {language.toUpperCase()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateCopies}
                disabled={isCopiesPending}
              >
                <RefreshCw className={cn("size-3.5 me-1.5", isCopiesPending && "animate-spin")} />
                {tc("regenerate")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setGeneratedCopies(null);
                }}
              >
                {tr("changeAngle")}
              </Button>
              <Button variant="ghost" size="sm" onClick={reset}>
                {tc("startOver")}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {generatedCopies.map((copy, i) => (
              <CopyCard key={i} copy={copy} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
