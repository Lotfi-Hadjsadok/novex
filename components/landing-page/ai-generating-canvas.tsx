"use client";

import { Sparkles, Layers, Wand2, ImageIcon, Type, Tag } from "lucide-react";
import type { DesignerOutput } from "@/lib/ai/product-landing-page/designer";
import type { z } from "zod";
import type { adCopyOutputSchema } from "@/lib/ai/product-landing-page/copy";

interface AIGeneratingCanvasProps {
  designer?: DesignerOutput | null;
}

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

function buildGradient(designer: DesignerOutput): string {
  const stops = designer.background_system?.gradient_stops;
  const direction = designer.background_system?.gradient_direction ?? "to bottom";
  if (stops && stops.length >= 2) {
    const stopsCss = stops.map((s) => `${s.hex} ${s.position}`).join(", ");
    return `linear-gradient(${direction}, ${stopsCss})`;
  }
  return `linear-gradient(160deg, ${designer.background_hex} 0%, #0a0a0a 100%)`;
}

function isDark(hex: string): boolean {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

const PALETTE_TASKS = [
  { text: "Checking the right color palette", delay: "0s", pct: 85 },
  { text: "Picking typography & aesthetic", delay: "0.45s", pct: 52 },
  { text: "Building gradient & motif system", delay: "0.9s", pct: 25 },
] as const;

function LandingPageSkeleton() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-card border border-border">
      <style>{`
        @keyframes lp-shimmer {
          0%   { background-position: -400% 0; }
          100% { background-position:  400% 0; }
        }
        @keyframes lp-fill {
          0%   { width: 0%; opacity: 0; }
          8%   { opacity: 1; }
          45%  { width: var(--fill-pct); }
          90%  { width: var(--fill-pct); opacity: 1; }
          100% { width: var(--fill-pct); opacity: 0; }
        }
        @keyframes lp-bar-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes lp-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .lp-block {
          background: linear-gradient(
            90deg,
            color-mix(in oklch, var(--primary) 6%, transparent) 0%,
            color-mix(in oklch, var(--primary) 6%, transparent) 30%,
            color-mix(in oklch, var(--primary) 14%, transparent) 50%,
            color-mix(in oklch, var(--primary) 6%, transparent) 70%,
            color-mix(in oklch, var(--primary) 6%, transparent) 100%
          );
          background-size: 400% 100%;
          animation: lp-shimmer 3.5s ease-in-out infinite;
        }
        @keyframes lp-color-cycle {
          0%   { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        .lp-color-cycle {
          animation: lp-color-cycle 5s linear infinite;
        }
        .lp-fill-bar {
          width: 0;
          animation: lp-fill 4s ease-out infinite, lp-bar-shimmer 2s linear infinite;
          background: linear-gradient(90deg,
            color-mix(in oklch, var(--primary) 70%, transparent) 0%,
            var(--primary) 45%,
            var(--primary) 55%,
            color-mix(in oklch, var(--primary) 85%, transparent) 100%
          );
          background-size: 200% 100%;
        }
        .lp-task-item { animation: lp-fade-in 0.4s ease-out backwards; }
      `}</style>

      <div className="relative p-4">
        <div className="rounded-2xl border border-primary/20 bg-background/85 backdrop-blur-sm px-5 py-5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Layers className="size-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Picking design system</p>
                <p className="text-[10px] text-muted-foreground">Color, typography & aesthetic</p>
              </div>
            </div>
            <div className="space-y-2">
              {PALETTE_TASKS.map((task, i) => (
                <div
                  key={i}
                  className="lp-task-item flex items-center gap-2"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0 bg-primary animate-bounce"
                    style={{ animationDelay: task.delay }}
                  />
                  <span className="text-xs text-foreground/90 flex-1">{task.text}</span>
                  <div
                    className="w-14 h-1.5 rounded-full bg-muted overflow-hidden shrink-0"
                    style={{ '--fill-pct': `${task.pct}%` } as any}
                  >
                    <div
                      className="lp-fill-bar h-full rounded-full block"
                      style={{ animationDelay: `${i * 0.35}s` } as any}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-primary/10 flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Choosing colors…
              </p>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="lp-color-cycle flex-1 h-10 rounded-lg border border-white/20 overflow-hidden shrink-0"
                    style={{
                      background: `linear-gradient(145deg, hsl(${50 + i * 45}, 70%, 50%) 0%, hsl(${20 + i * 50}, 80%, 35%) 100%)`,
                      animationDelay: `${i * 0.08}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step preview: minimal card + progress ───────────────────────────────────

const STEP_META = {
  1: {
    label: "Product Setup",
    icon: ImageIcon,
    description: "Upload clear product photos and enter your product name. AI will scan them to craft compelling copy.",
  },
  2: {
    label: "Language & Dialect",
    icon: Type,
    description: "Choose the output language for your landing page. If Arabic is selected, you can also pick a regional dialect.",
  },
  3: {
    label: "Pricing & Currency",
    icon: Tag,
    description: "Set your product price and currency, then hit Generate — AI will write your copy and build the feature list.",
  },
} as const;

const GENERATING_TASKS = [
  { text: "Scanning product images", delay: "0s", pct: 75 },
  { text: "Writing headlines & copy", delay: "0.45s", pct: 50 },
  { text: "Building feature cards", delay: "0.9s", pct: 28 },
] as const;

function PagePreviewSkeleton({
  step,
  meta,
  generating,
}: {
  step: 1 | 2 | 3;
  meta: (typeof STEP_META)[1] | (typeof STEP_META)[2] | (typeof STEP_META)[3];
  generating: boolean;
}) {
  const Icon = meta.icon;

  return (
    <div className="relative p-4">
      <style>{`
        @keyframes pp-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pp-fill {
          0%   { width: 0%; opacity: 0; }
          8%   { opacity: 1; }
          45%  { width: var(--fill-pct); }
          90%  { width: var(--fill-pct); opacity: 1; }
          100% { width: var(--fill-pct); opacity: 0; }
        }
        @keyframes pp-bar-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .pp-instruction { animation: pp-fade-in 0.45s ease-out; }
        .pp-task-item { animation: pp-fade-in 0.4s ease-out backwards; }
        .pp-fill-bar {
          width: 0;
          animation: pp-fill 4s ease-out infinite, pp-bar-shimmer 2s linear infinite;
          background: linear-gradient(90deg,
            color-mix(in oklch, var(--primary) 70%, transparent) 0%,
            var(--primary) 45%,
            var(--primary) 55%,
            color-mix(in oklch, var(--primary) 85%, transparent) 100%
          );
          background-size: 200% 100%;
        }
      `}</style>
      {generating ? (
        <div className="pp-instruction rounded-2xl border border-primary/20 bg-background/85 backdrop-blur-sm px-5 py-5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Sparkles className="size-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Generating copy</p>
                <p className="text-[10px] text-muted-foreground">Step 3 of 3</p>
              </div>
            </div>
            <div className="space-y-2">
              {GENERATING_TASKS.map((task, i) => (
                <div
                  key={i}
                  className="pp-task-item flex items-center gap-2"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="sc-dot w-1.5 h-1.5 rounded-full shrink-0 bg-primary" style={{ animationDelay: task.delay }} />
                  <span className="text-xs text-foreground/90 flex-1">{task.text}</span>
                  <div
                    className="w-14 h-1.5 rounded-full bg-muted overflow-hidden shrink-0"
                    style={{ '--fill-pct': `${task.pct}%` } as any}
                  >
                    <div
                      className="pp-fill-bar h-full rounded-full block"
                      style={{ animationDelay: `${i * 0.35}s` } as any}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="pp-instruction rounded-2xl border border-primary/20 bg-background/80 backdrop-blur-sm px-5 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20">
              <Icon className="size-5" />
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80">
                Step {step}
              </p>
              <h3 className="text-sm font-semibold text-foreground leading-tight">
                {meta.label}
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground max-w-[200px] mx-auto">
                {meta.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type CopyData = z.infer<typeof adCopyOutputSchema>;
type FeatureItem = { text: string; visual: string };

export function ReviewCanvasSkeleton({
  copyData,
  features,
}: {
  copyData: CopyData;
  features: FeatureItem[];
}) {
  const featureCount = Math.min(Math.max(features.length, 3), 5);
  const hasTag = copyData.section_1.tag.length > 0;
  const hasBadge = !!copyData.section_1.badge_text;
  const hasSection2Headline = !!copyData.section_2?.headline;
  const hasShopInfo = !!copyData.section_3.shop_info;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-border bg-card">
      <style>{`
        @keyframes rv-shimmer {
          0%   { background-position: -400% 0; }
          100% { background-position:  400% 0; }
        }
        .rv-block {
          background: linear-gradient(
            90deg,
            color-mix(in oklch, var(--primary) 6%, transparent) 0%,
            color-mix(in oklch, var(--primary) 6%, transparent) 30%,
            color-mix(in oklch, var(--primary) 14%, transparent) 50%,
            color-mix(in oklch, var(--primary) 6%, transparent) 70%,
            color-mix(in oklch, var(--primary) 6%, transparent) 100%
          );
          background-size: 400% 100%;
          animation: rv-shimmer 3.5s ease-in-out infinite;
        }
      `}</style>
      <div className="p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-0.5">
          Preview layout
        </p>
        <div className="mx-auto max-w-[240px] rounded-xl overflow-hidden aspect-[600/1584] border border-primary/15 bg-muted/20 flex flex-col">
          {/* Section 1 — Hero (1:1 square, product 55–70%, tag/badge/headline/subheadline) */}
          <div className="rv-block shrink-0 aspect-square relative flex flex-col items-center justify-end p-3 gap-2.5">
            {hasTag && (
              <div className="absolute top-2.5 left-2.5 h-6 w-16 rounded-full bg-primary/20" />
            )}
            {hasBadge && (
              <div className="absolute top-2.5 right-2.5 h-6 w-14 rounded-full bg-primary/18" />
            )}
            <div className="w-[58%] h-[55%] min-h-[90px] rounded-xl bg-primary/15 border border-primary/25 shrink-0" />
            <div className="h-3 w-4/5 rounded-md bg-primary/25" />
            <div className="h-2.5 w-3/5 rounded-md bg-primary/18" />
          </div>
          {/* Section 2 — Features (product ≥35%, 3–5 feature cards, optional headline) */}
          <div className="rv-block flex-1 min-h-0 p-2.5 flex flex-col gap-2 border-t border-primary/10">
            {hasSection2Headline && (
              <div className="h-2.5 w-28 rounded bg-primary/20 shrink-0" />
            )}
            <div className="flex gap-2.5 items-stretch min-h-0 flex-1">
              <div className="w-[38%] min-w-[38%] flex-1 rounded-lg bg-primary/12 border border-primary/20" />
              <div className="grid grid-cols-2 gap-1.5 flex-1 content-start min-w-0">
                {Array.from({ length: featureCount }).map((_, i) => (
                  <div
                    key={i}
                    className="rv-block rounded-lg p-2 flex flex-col items-center gap-1 border border-primary/12"
                  >
                    <div className="w-7 h-7 rounded-lg bg-primary/22 shrink-0" />
                    <div className="h-2 w-full rounded bg-primary/16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Section 3 — Conversion (ownership: product + CTA dominant + price adjacent, shop_info) */}
          <div className="rv-block flex-1 min-h-0 p-2.5 flex flex-col justify-end gap-2.5 border-t border-primary/10">
            <div className="h-2.5 w-4/5 rounded-md bg-primary/22" />
            <div className="h-2 w-3/5 rounded-md bg-primary/16" />
            <div className="flex gap-2.5 items-end">
              <div className="w-[35%] aspect-[2/3] shrink-0 rounded-lg bg-primary/12 border border-primary/20" />
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="h-10 rounded-lg bg-primary/40 border border-primary/50 shrink-0" />
                <div className="h-6 w-20 rounded-full bg-primary/25 shrink-0" />
              </div>
            </div>
            {hasShopInfo && (
              <div className="h-2 w-full max-w-[85%] rounded bg-primary/12" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StepCanvasSkeleton({
  step,
  generating = false,
}: {
  step: 1 | 2 | 3;
  generating?: boolean;
}) {
  const meta = STEP_META[step];
  const Icon = meta.icon;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden select-none border border-border bg-card">
      <style>{`
        .sc-dot { animation: sc-dot 2.2s ease-in-out infinite; }
        @keyframes sc-dot {
          0%, 80%, 100% { transform: scale(1); opacity: 0.7; }
          40%            { transform: scale(1.08); opacity: 1; }
        }
      `}</style>

      {/* Step stepper */}
      <div className="flex items-center justify-center gap-1 px-4 py-3 border-b border-border bg-muted/50">
        {([1, 2, 3] as const).map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                s === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`mx-1 w-8 h-0.5 rounded-full ${
                  s < step ? "bg-primary/60" : "bg-muted-foreground/20"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Instruction card */}
      <div className="relative overflow-hidden bg-muted/30">
        <PagePreviewSkeleton step={step} meta={meta} generating={generating} />
      </div>

      {/* Footer — step title (instructions live in canvas) */}
      <div className="border-t border-border px-4 py-3 bg-muted/50">
        <div className="flex items-center gap-2.5">
          <Icon className="size-4 shrink-0 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {generating ? "Generating…" : meta.label}
          </span>
          <span className="ml-auto text-xs font-medium text-muted-foreground">
            Step {step} of 3
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── AIGeneratingCanvas ─────────────────────────────────────────────────────

export function AIGeneratingCanvas({ designer }: AIGeneratingCanvasProps) {
  if (!designer) {
    return <LandingPageSkeleton />;
  }

  const accentRgb = hexToRgb(designer.accent_hex);
  const textHex = isDark(designer.background_hex) ? designer.primary_text_hex : "#0a0a0a";
  const bgGradient = buildGradient(designer);
  const accentHex = designer.accent_hex;
  const aestheticWords = designer.aesthetic.split(/[\s,·]+/).slice(0, 3).join(" · ");

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-border bg-card">
      <div className="p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-0.5">
          Generating image
        </p>
        <div
          className="relative mx-auto max-w-[240px] rounded-xl overflow-hidden aspect-[600/1584] border border-white/10"
          style={{ background: bgGradient }}
        >
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
          0%, 100% { opacity: 0.75; }
          50%      { opacity: 1; }
        }
        @keyframes float-up {
          0%   { transform: translateY(0px) scale(1);   opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(-80px) scale(0.8); opacity: 0; }
        }
        @keyframes blob-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(15px, -10px) scale(1.05); }
          66%       { transform: translate(-10px, 12px) scale(0.96); }
        }
        @keyframes ring-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 0.85; transform: scale(1.02); }
        }
        .scan-line      { animation: scan-line 2.4s ease-in-out infinite; }
        .grid-drift     { animation: grid-drift 4s linear infinite; }
        .shimmer-txt    { animation: shimmer-text 1.8s ease-in-out infinite; }
        .float-particle { animation: float-up 3.2s ease-in-out infinite; }
        .blob-drift     { animation: blob-drift 7s ease-in-out infinite; }
        .ring-pulse     { animation: ring-pulse 3.5s ease-in-out infinite; }
      `}</style>

      {/* Background blobs */}
      <div
        className="blob-drift absolute -top-8 -left-6 w-32 h-32 rounded-full blur-2xl pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(${accentRgb}, 0.28) 0%, transparent 70%)`,
          animationDelay: "0s",
        }}
      />
      <div
        className="blob-drift absolute -bottom-6 -right-4 w-28 h-28 rounded-full blur-2xl pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(${accentRgb}, 0.2) 0%, transparent 70%)`,
          animationDelay: "2.5s",
        }}
      />
      <div
        className="blob-drift absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-24 rounded-full blur-2xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse, rgba(${accentRgb}, 0.12) 0%, transparent 65%)`,
          animationDelay: "1.2s",
        }}
      />

      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none grid-drift"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: !isDark(designer.background_hex) ? 0.3 : 1,
        }}
      />

      {/* Scan line */}
      <div
        className="scan-line absolute left-0 right-0 h-[2px] pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${accentHex}cc 40%, ${accentHex} 50%, ${accentHex}cc 60%, transparent 100%)`,
          boxShadow: `0 0 14px 4px ${accentHex}55`,
        }}
      />

      {/* Floating particles */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="float-particle absolute w-1 h-1 rounded-full pointer-events-none"
          style={{
            left: `${15 + i * 17}%`,
            bottom: `${10 + (i % 3) * 8}%`,
            background: accentHex,
            boxShadow: `0 0 6px 2px ${accentHex}88`,
            animationDelay: `${i * 0.6}s`,
            animationDuration: `${3 + i * 0.4}s`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center px-3 py-6 h-full">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md px-4 py-4 shadow-lg">

          {/* Spinner ring */}
          <div className="relative w-12 h-12">
            <div
              className="ring-pulse absolute inset-0 rounded-full border"
              style={{ borderColor: `${accentHex}60` }}
            />
            <div
              className="absolute inset-0.5 rounded-full border animate-spin [animation-duration:6s]"
              style={{ borderColor: `${accentHex}45` }}
            />
            <div
              className="absolute inset-1 rounded-full border animate-spin [animation-duration:3.5s] [animation-direction:reverse]"
              style={{ borderColor: `${accentHex}60` }}
            />
            <div
              className="absolute inset-1.5 rounded-full border-2 border-transparent animate-spin [animation-duration:2s]"
              style={{ borderTopColor: accentHex, borderRightColor: `${accentHex}70` }}
            />
            <div
              className="absolute inset-2.5 rounded-full border animate-spin [animation-duration:1.3s] [animation-direction:reverse]"
              style={{ borderTopColor: accentHex }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles
                className="size-3 animate-pulse [animation-duration:2.5s]"
                style={{ color: accentHex }}
              />
            </div>
          </div>

          {/* Labels */}
          <div className="text-center space-y-0.5">
            <p className="shimmer-txt font-semibold text-[10px] tracking-wide text-white">
              Rendering your canvas
            </p>
            <p className="text-[9px] text-white/60">
              AI is painting your landing page image…
            </p>
          </div>

          {/* Design tokens */}
          <div className="flex flex-wrap justify-center gap-1 max-w-full">
            <span className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-medium border border-white/15 bg-white/10 text-white">
              <span className="flex gap-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: designer.background_hex, border: "1px solid rgba(255,255,255,0.3)" }} />
                <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: accentHex }} />
                <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: designer.primary_text_hex, border: "1px solid rgba(255,255,255,0.3)" }} />
              </span>
              Palette
            </span>
            <span className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-medium border border-white/15 bg-white/10 text-white">
              <Layers className="size-2.5" />
              {designer.font_family}
            </span>
            <span className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-medium border border-white/15 bg-white/10 text-white">
              <Wand2 className="size-2.5" />
              {aestheticWords}
            </span>
          </div>

          {/* Dot bounce */}
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-1 rounded-full animate-bounce"
                style={{ background: accentHex, animationDelay: `${i * 0.18}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%)",
        }}
      />
        </div>
      </div>
    </div>
  );
}
