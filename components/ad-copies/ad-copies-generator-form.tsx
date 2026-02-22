"use client";

import { useActionState, startTransition, useState } from "react";
import {
  ARABIC_DIALECTS,
  CURRENCIES,
  LANGUAGES,
  type ArabicDialect,
  type CopyLanguage,
  type Currency,
} from "@/types/landing-page";
import {
  AD_COPY_TONES,
  AD_COPY_SIZES,
  AD_COPY_COUNTS,
  type AdCopyTone,
  type AdCopySize,
  type AdCopyCount,
  type AdCopyAngleId,
} from "@/types/ad-copies";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge }    from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Copy,
  Loader2,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdCopiesStore }            from "@/store/ad-copies-store";
import { generateAnglesAction, generateCopiesAction } from "@/app/actions/ad-copies";

// ─── Angle generating skeleton ────────────────────────────────────────────────

function AnglesGeneratingSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
              <Sparkles className="size-4 text-primary animate-pulse" />
            </div>
            <div className="space-y-0.5 pt-0.5">
              <CardTitle className="text-base">Generating angles</CardTitle>
              <CardDescription>AI is analyzing your product and crafting marketing angles…</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <style>{`
            @keyframes acf-fill {
              0%   { width: 0%; opacity: 0; }
              8%   { opacity: 1; }
              45%  { width: var(--fill-pct); }
              90%  { width: var(--fill-pct); opacity: 1; }
              100% { width: var(--fill-pct); opacity: 0; }
            }
            @keyframes acf-shimmer {
              0%   { background-position: -200% center; }
              100% { background-position:  200% center; }
            }
            @keyframes acf-pct {
              0%, 100% { opacity: 0.35; }
              50%      { opacity: 0.65; }
            }
            .acf-fill-bar {
              width: 0;
              animation: acf-fill 4s ease-out infinite, acf-shimmer 2s linear infinite;
              background: linear-gradient(90deg,
                hsl(var(--primary)/0.5) 0%,
                hsl(var(--primary)/0.75) 45%,
                hsl(var(--primary)/0.9) 55%,
                hsl(var(--primary)/0.75) 65%,
                hsl(var(--primary)/0.5) 100%
              );
              background-size: 200% 100%;
            }
            .acf-pct { animation: acf-pct 2.5s ease-in-out infinite; }
          `}</style>
          {(
            [
              { label: "Studying product images",      pct: 90 },
              { label: "Identifying target audience",  pct: 70 },
              { label: "Crafting strategic angles",    pct: 45 },
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
                <span className="acf-pct text-[10px] tabular-nums text-muted-foreground/50">{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                className="acf-fill-bar h-full rounded-full"
                style={{ '--fill-pct': `${pct}%`, animationDelay: `${i * 0.4}s` } as any}
                />
              </div>
            </div>
          ))}

          <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Angle preview</p>
            <div className="space-y-3 animate-pulse">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-lg border bg-card/50 p-3 space-y-1.5">
                  <div className="h-3 rounded-md bg-primary/10 w-1/3" />
                  <div className="h-2.5 rounded bg-muted w-4/5" />
                  <div className="h-2.5 rounded bg-muted w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Copy generating skeleton ────────────────────────────────────────────────

function CopiesGeneratingSkeleton({ count }: { count: number }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
            <Zap className="size-4 text-primary animate-pulse" />
          </div>
          <div className="space-y-0.5 pt-0.5">
            <CardTitle className="text-base">Writing {count} ad {count === 1 ? "copy" : "copies"}</CardTitle>
            <CardDescription>AI is crafting high-converting variations for your selected angle…</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-muted/20 p-4 space-y-2 animate-pulse" style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="h-3.5 rounded-md bg-primary/10 w-3/4" />
              <div className="space-y-1.5 pt-1">
                <div className="h-2.5 rounded bg-muted w-full" />
                <div className="h-2.5 rounded bg-muted w-[85%]" />
                <div className="h-2.5 rounded bg-muted w-[60%]" />
              </div>
              <div className="pt-1 flex gap-1.5 flex-wrap">
                <div className="h-5 w-16 rounded-full bg-primary/10" />
                <div className="h-5 w-12 rounded-full bg-primary/10" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Tone picker ─────────────────────────────────────────────────────────────

function TonePicker({
  value,
  onChange,
}: {
  value: AdCopyTone;
  onChange: (tone: AdCopyTone) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {AD_COPY_TONES.map((tone) => (
        <button
          key={tone.value}
          type="button"
          onClick={() => onChange(tone.value)}
          className={cn(
            "flex flex-col items-start gap-0.5 rounded-xl border-2 px-3 py-2.5 text-left transition-all duration-150",
            value === tone.value
              ? "border-primary bg-primary/5 shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
              : "border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40"
          )}
        >
          <p className={cn("text-[13px] font-semibold leading-none", value === tone.value ? "text-primary" : "text-foreground")}>
            {tone.label}
          </p>
          <p className="text-[11px] text-muted-foreground leading-snug">{tone.description}</p>
        </button>
      ))}
    </div>
  );
}

// ─── Size picker ──────────────────────────────────────────────────────────────

function SizePicker({
  value,
  onChange,
}: {
  value: AdCopySize;
  onChange: (size: AdCopySize) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {AD_COPY_SIZES.map((size) => (
        <button
          key={size.value}
          type="button"
          onClick={() => onChange(size.value)}
          className={cn(
            "flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-center transition-all duration-150",
            value === size.value
              ? "border-primary bg-primary/5 shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
              : "border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40"
          )}
        >
          <p className={cn("text-[13px] font-semibold leading-none", value === size.value ? "text-primary" : "text-foreground")}>
            {size.label}
          </p>
          <p className="text-[10px] text-muted-foreground leading-tight">{size.description}</p>
        </button>
      ))}
    </div>
  );
}

// ─── Count picker ─────────────────────────────────────────────────────────────

function CountPicker({
  value,
  onChange,
}: {
  value: AdCopyCount;
  onChange: (count: AdCopyCount) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {AD_COPY_COUNTS.map((count) => (
        <button
          key={count}
          type="button"
          onClick={() => onChange(count)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl border-2 text-sm font-semibold transition-all duration-150",
            value === count
              ? "border-primary bg-primary/5 text-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
              : "border-border bg-muted/20 text-foreground hover:border-primary/40 hover:bg-muted/40"
          )}
        >
          {count}
        </button>
      ))}
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step, phase }: { step: number; phase: string }) {
  const steps = [
    { label: "Product",  desc: "Images & name" },
    { label: "Settings", desc: "Language & tone" },
    { label: "Pricing",  desc: "Price & format" },
  ];

  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => {
        const idx       = i + 1;
        const isDone    = idx < step;
        const isCurrent = idx === step;
        return (
          <div key={i} className="flex items-center gap-1">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
                  isDone    ? "bg-primary text-primary-foreground" :
                  isCurrent ? "bg-primary/15 text-primary ring-2 ring-primary/30" :
                              "bg-muted text-muted-foreground"
                )}
              >
                {isDone ? <Check className="size-3" /> : idx}
              </div>
              <div className="hidden sm:block">
                <p className={cn("text-xs font-medium leading-none", isCurrent ? "text-foreground" : "text-muted-foreground")}>
                  {s.label}
                </p>
                <p className="text-[10px] text-muted-foreground/70 leading-none mt-0.5">{s.desc}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("mx-1 h-px w-6 sm:w-10", isDone ? "bg-primary/40" : "bg-border")} />
            )}
          </div>
        );
      })}
      <div className="ml-2 flex items-center gap-1.5">
        <div className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
          phase === "Angles" || phase === "Copies"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}>
          <Sparkles className="size-3" />
        </div>
        <p className={cn(
          "hidden sm:block text-xs font-medium leading-none",
          phase === "Angles" || phase === "Copies" ? "text-foreground" : "text-muted-foreground"
        )}>
          {phase === "Copies" ? "Copies" : "Generate"}
        </p>
      </div>
    </div>
  );
}

// ─── Copy card ────────────────────────────────────────────────────────────────

function CopyCard({ copy, index }: { copy: { headline: string; body: string; cta: string; hashtags: string[] | null }; index: number }) {
  const [copied, setCopied] = useState(false);

  const fullText = [
    copy.headline,
    "",
    copy.body,
    "",
    copy.cta,
    ...(copy.hashtags?.length ? ["", copy.hashtags.map((h) => `#${h}`).join(" ")] : []),
  ].join("\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative flex flex-col rounded-xl border bg-card transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border/50">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Copy {index + 1}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-all",
            copied
              ? "bg-green-500/10 text-green-600"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {copied ? (
            <><ClipboardCheck className="size-3" />Copied</>
          ) : (
            <><Copy className="size-3" />Copy</>
          )}
        </button>
      </div>

      <div className="flex-1 space-y-3 p-4">
        <p className="text-[15px] font-bold leading-snug text-foreground">{copy.headline}</p>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{copy.body}</p>

        <div className="flex items-center gap-2 pt-1">
          <span className="rounded-lg bg-primary/10 px-3 py-1 text-[12px] font-semibold text-primary">
            {copy.cta}
          </span>
        </div>

        {copy.hashtags && copy.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {copy.hashtags.map((tag) => (
              <span key={tag} className="text-[11px] text-primary/70 font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Angle card ───────────────────────────────────────────────────────────────

const ANGLE_ICONS: Record<string, string> = {
  "benefit":      "✦",
  "pain-point":   "⚡",
  "lifestyle":    "◈",
  "urgency":      "◉",
  "social-proof": "★",
  "curiosity":    "◎",
};

function AngleCard({
  angle,
  selected,
  onSelect,
}: {
  angle: { id: string; name: string; description: string; headline_preview: string; hook: string };
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative w-full rounded-xl border-2 p-4 text-left transition-all duration-150",
        selected
          ? "border-primary bg-primary/5 shadow-[0_0_0_4px_hsl(var(--primary)/0.10)]"
          : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-base transition-colors",
            selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {ANGLE_ICONS[angle.id] ?? "◆"}
          </span>
          <div>
            <p className={cn("text-[13px] font-semibold leading-none", selected ? "text-primary" : "text-foreground")}>
              {angle.name}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{angle.description}</p>
          </div>
        </div>
        {selected && (
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
            <Check className="size-3 text-primary-foreground" />
          </div>
        )}
      </div>

      <div className="mt-3 rounded-lg bg-muted/40 px-3 py-2.5 space-y-1">
        <p className={cn("text-[13px] font-semibold leading-snug", selected ? "text-foreground" : "text-foreground/80")}>
          "{angle.headline_preview}"
        </p>
        <p className="text-[11px] text-muted-foreground italic leading-snug">
          {angle.hook}
        </p>
      </div>
    </button>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function AdCopiesGeneratorForm() {
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

  // ── Angles generation ─────────────────────────────────────────────────────
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

  // ── Copies generation ─────────────────────────────────────────────────────
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
      {/* ── Step indicator ── */}
      {!generatedCopies && (
        <StepIndicator step={formStep} phase={phase} />
      )}

      {/* ── Angles generating skeleton ── */}
      {isAnglesPending && <AnglesGeneratingSkeleton />}

      {/* ── Multi-step input form ── */}
      {!angles && !isAnglesPending && !generatedCopies && (
        <Card>
          <CardHeader>
            <CardTitle>
              {formStep === 1 && "Product details"}
              {formStep === 2 && "Language & tone"}
              {formStep === 3 && "Pricing & format"}
            </CardTitle>
            <CardDescription>
              {formStep === 1 && "Upload product photos and enter the product name."}
              {formStep === 2 && "Choose the language, tone, and emoji preference."}
              {formStep === 3 && "Set the price and ad copy format options."}
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

                  <Field>
                    <FieldLabel>
                      <FieldTitle>Tone</FieldTitle>
                    </FieldLabel>
                    <TonePicker value={tone} onChange={setTone} />
                  </Field>

                  <Field>
                    <FieldLabel>
                      <FieldTitle>Emojis</FieldTitle>
                    </FieldLabel>
                    <div className="flex gap-2">
                      {[
                        { label: "Without emojis", value: false },
                        { label: "With emojis",    value: true  },
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
                      <FieldTitle>Copy size</FieldTitle>
                    </FieldLabel>
                    <SizePicker value={copySize} onChange={setCopySize} />
                  </Field>

                  <Field>
                    <FieldLabel>
                      <FieldTitle>Number of copies</FieldTitle>
                    </FieldLabel>
                    <CountPicker value={copyCount} onChange={setCopyCount} />
                  </Field>

                  <Field>
                    <FieldLabel>
                      <FieldTitle>Custom instructions (optional)</FieldTitle>
                    </FieldLabel>
                    <Textarea
                      placeholder="e.g. Focus on eco-friendly angle, use urgency…"
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
              <Button
                onClick={handleGenerateAngles}
                disabled={isAnglesPending || productImages.length === 0}
              >
                {isAnglesPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 mr-1.5" />
                    Generate angles
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      )}

      {/* ── Angle selection ── */}
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
            <h2 className="text-lg font-semibold">Choose your angle</h2>
            <p className="text-sm text-muted-foreground">
              The AI found {uniqueAngles.length} marketing angles. Pick the one that best fits your campaign.
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
                <ChevronLeft className="size-4 mr-1" />
                Back
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateAngles}
                disabled={isAnglesPending}
              >
                <RefreshCw className={cn("size-3.5 mr-1.5", isAnglesPending && "animate-spin")} />
                Regenerate
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
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Writing…
                  </>
                ) : (
                  <>
                    <Zap className="size-4 mr-1.5" />
                    Generate {copyCount} {copyCount === 1 ? "copy" : "copies"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ── Copies generating skeleton ── */}
      {isCopiesPending && <CopiesGeneratingSkeleton count={copyCount} />}

      {/* ── Generated copies ── */}
      {generatedCopies && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-semibold">
                {generatedCopies.length} ad {generatedCopies.length === 1 ? "copy" : "copies"} ready
              </h2>
              <p className="text-sm text-muted-foreground">
                {selectedAngle?.name} angle · {copySize} · {useEmojis ? "with emojis" : "no emojis"} · {language.toUpperCase()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateCopies}
                disabled={isCopiesPending}
              >
                <RefreshCw className={cn("size-3.5 mr-1.5", isCopiesPending && "animate-spin")} />
                Regenerate
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setGeneratedCopies(null);
                }}
              >
                Change angle
              </Button>
              <Button variant="ghost" size="sm" onClick={reset}>
                Start over
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
