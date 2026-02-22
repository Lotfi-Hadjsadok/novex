"use client";

import { Sparkles, Layers, Wand2, ImageIcon, Type, Tag } from "lucide-react";
import type { AdCreativeDesignerOutput } from "@/lib/ai/ad-creative/designer";
import type { AdCreativeCopy } from "@/lib/ai/ad-creative/copy";
import type { AdAspectRatio } from "@/types/ad-creative";
import { getRatioCssAspect } from "@/types/ad-creative";

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

function buildGradient(designer: AdCreativeDesignerOutput): string {
  const stops     = designer.background_system?.gradient_stops;
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

// ─── Design System Skeleton (no designer yet) ────────────────────────────────

const PALETTE_TASKS = [
  { text: "Picking color palette",      delay: "0s",    pct: 85 },
  { text: "Choosing typography",        delay: "0.45s", pct: 52 },
  { text: "Building background system", delay: "0.9s",  pct: 25 },
] as const;

function DesignSystemSkeleton({ aspectRatio }: { aspectRatio: AdAspectRatio }) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-card border border-border">
      <style>{`
        @keyframes ac-shimmer {
          0%   { background-position: -400% 0; }
          100% { background-position:  400% 0; }
        }
        @keyframes ac-fill {
          0%   { width: 0%; opacity: 0; }
          8%   { opacity: 1; }
          45%  { width: var(--fill-pct); }
          90%  { width: var(--fill-pct); opacity: 1; }
          100% { width: var(--fill-pct); opacity: 0; }
        }
        @keyframes ac-bar-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes ac-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ac-block {
          background: linear-gradient(
            90deg,
            color-mix(in oklch, var(--primary) 6%, transparent) 0%,
            color-mix(in oklch, var(--primary) 6%, transparent) 30%,
            color-mix(in oklch, var(--primary) 14%, transparent) 50%,
            color-mix(in oklch, var(--primary) 6%, transparent) 70%,
            color-mix(in oklch, var(--primary) 6%, transparent) 100%
          );
          background-size: 400% 100%;
          animation: ac-shimmer 3.5s ease-in-out infinite;
        }
        @keyframes ac-color-cycle {
          0%   { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        .ac-color-cycle { animation: ac-color-cycle 5s linear infinite; }
        .ac-fill-bar {
          width: 0;
          animation: ac-fill 4s ease-out infinite, ac-bar-shimmer 2s linear infinite;
          background: linear-gradient(90deg,
            color-mix(in oklch, var(--primary) 70%, transparent) 0%,
            var(--primary) 45%,
            var(--primary) 55%,
            color-mix(in oklch, var(--primary) 85%, transparent) 100%
          );
          background-size: 200% 100%;
        }
        .ac-task-item { animation: ac-fade-in 0.4s ease-out backwards; }
      `}</style>

      <div className="p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-0.5">
          Picking design system
        </p>
        <div
          className="mx-auto ac-block rounded-xl overflow-hidden border border-primary/15 bg-muted/20 flex items-center justify-center"
          style={{ aspectRatio: getRatioCssAspect(aspectRatio), maxHeight: "340px" }}
        >
          <div className="rounded-2xl border border-primary/20 bg-background/85 backdrop-blur-sm px-4 py-4 shadow-md mx-3 w-full max-w-[220px]">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary shrink-0">
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
                    className="ac-task-item flex items-center gap-2"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0 bg-primary animate-bounce"
                      style={{ animationDelay: task.delay }}
                    />
                    <span className="text-xs text-foreground/90 flex-1">{task.text}</span>
                    <div
                      className="w-10 h-1.5 rounded-full bg-muted overflow-hidden shrink-0"
                      style={{ '--fill-pct': `${task.pct}%` } as any}
                    >
                      <div
                        className="ac-fill-bar h-full rounded-full block"
                        style={{ animationDelay: `${i * 0.35}s` } as any}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-primary/10 flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="ac-color-cycle flex-1 h-6 rounded-md border border-white/20"
                    style={{
                      background: `linear-gradient(145deg, hsl(${50 + i * 55}, 70%, 50%) 0%, hsl(${20 + i * 50}, 80%, 35%) 100%)`,
                      animationDelay: `${i * 0.1}s`,
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

// ─── Step preview skeleton ────────────────────────────────────────────────────

const STEP_META = {
  1: {
    label: "Product Setup",
    icon:  ImageIcon,
    description: "Upload clear product photos and enter your product name.",
  },
  2: {
    label: "Language & Dialect",
    icon:  Type,
    description: "Choose the output language for your ad creative copy.",
  },
  3: {
    label: "Pricing & Format",
    icon:  Tag,
    description: "Set the ad format ratio (and optionally price), then hit Generate.",
  },
} as const;

const GENERATING_TASKS = [
  { text: "Scanning product images", delay: "0s",    pct: 75 },
  { text: "Writing ad copy",         delay: "0.45s", pct: 50 },
  { text: "Building feature labels", delay: "0.9s",  pct: 28 },
] as const;

function StepPreview({
  step,
  meta,
  generating,
  aspectRatio,
}: {
  step: 1 | 2 | 3;
  meta: (typeof STEP_META)[1 | 2 | 3];
  generating: boolean;
  aspectRatio: AdAspectRatio;
}) {
  const Icon = meta.icon;
  return (
    <div
      className="mx-auto w-full max-w-full rounded-xl overflow-hidden border border-primary/15 bg-muted/20 flex items-center justify-center flex-1 min-h-[320px]"
      style={{ aspectRatio: getRatioCssAspect(aspectRatio), maxHeight: "420px" }}
    >
      <style>{`
        @keyframes sp-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sp-fill {
          0%   { width: 0%; opacity: 0; }
          8%   { opacity: 1; }
          45%  { width: var(--fill-pct); }
          90%  { width: var(--fill-pct); opacity: 1; }
          100% { width: var(--fill-pct); opacity: 0; }
        }
        @keyframes sp-bar-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .sp-instruction { animation: sp-fade-in 0.45s ease-out; }
        .sp-task-item   { animation: sp-fade-in 0.4s ease-out backwards; }
        .sp-fill-bar {
          width: 0;
          animation: sp-fill 4s ease-out infinite, sp-bar-shimmer 2s linear infinite;
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
        <div className="sp-instruction rounded-2xl border border-primary/20 bg-background/85 backdrop-blur-sm px-5 py-5 shadow-md mx-3 w-full max-w-[300px]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary shrink-0">
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
                  className="sp-task-item flex items-center gap-2"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0 bg-primary animate-bounce"
                    style={{ animationDelay: task.delay }}
                  />
                  <span className="text-xs text-foreground/90 flex-1">{task.text}</span>
                  <div
                    className="w-10 h-1.5 rounded-full bg-muted overflow-hidden shrink-0"
                    style={{ '--fill-pct': `${task.pct}%` } as any}
                  >
                    <div
                      className="sp-fill-bar h-full rounded-full block"
                      style={{ animationDelay: `${i * 0.35}s` } as any}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="sp-instruction rounded-2xl border border-primary/20 bg-background/80 backdrop-blur-sm px-5 py-6 shadow-md mx-3 w-full max-w-[280px] text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20">
              <Icon className="size-6" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80">
                Step {step}
              </p>
              <h3 className="text-sm font-semibold text-foreground leading-tight">{meta.label}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{meta.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Review skeleton (shows copy layout preview) ─────────────────────────────

export function AdCreativeReviewSkeleton({
  copy,
  aspectRatio,
}: {
  copy: AdCreativeCopy;
  aspectRatio: AdAspectRatio;
}) {
  const hasTag   = copy.tag.length > 0;
  const hasBadge = !!copy.badge_text;
  const isLandscape = aspectRatio === "16:9";

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-border bg-card">
      <style>{`
        @keyframes rv2-shimmer {
          0%   { background-position: -400% 0; }
          100% { background-position:  400% 0; }
        }
        .rv2-block {
          background: linear-gradient(
            90deg,
            color-mix(in oklch, var(--primary) 6%, transparent) 0%,
            color-mix(in oklch, var(--primary) 6%, transparent) 30%,
            color-mix(in oklch, var(--primary) 14%, transparent) 50%,
            color-mix(in oklch, var(--primary) 6%, transparent) 70%,
            color-mix(in oklch, var(--primary) 6%, transparent) 100%
          );
          background-size: 400% 100%;
          animation: rv2-shimmer 3.5s ease-in-out infinite;
        }
      `}</style>
      <div className="p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-0.5">
          Preview layout
        </p>
        <div
          className="mx-auto rv2-block rounded-xl overflow-hidden border border-primary/15 relative"
          style={{ aspectRatio: getRatioCssAspect(aspectRatio), maxHeight: "340px" }}
        >
          {hasTag && (
            <div className="absolute top-2 left-2 h-4 w-12 rounded-full bg-primary/25 z-10" />
          )}
          {hasBadge && (
            <div className="absolute top-2 right-2 h-4 w-10 rounded-full bg-primary/30 z-10" />
          )}

          {isLandscape ? (
            /* Landscape: product on right, text on left */
            <div className="absolute inset-0 flex">
              <div className="flex-1 flex flex-col justify-center gap-1.5 p-3">
                <div className="h-3 w-4/5 rounded-md bg-primary/30" />
                <div className="h-2 w-3/5 rounded-md bg-primary/20" />
                <div className="flex gap-1 mt-1 flex-wrap">
                  {copy.features.slice(0, 3).map((_, i) => (
                    <div key={i} className="h-3 w-10 rounded-full bg-primary/18 shrink-0" />
                  ))}
                </div>
                <div className="mt-2 h-6 w-24 rounded-md bg-primary/40" />
                <div className="h-3 w-12 rounded-full bg-primary/22" />
              </div>
              <div className="w-[45%] shrink-0 flex items-center justify-center p-2">
                <div className="w-full h-4/5 rounded-lg bg-primary/18 border border-primary/25" />
              </div>
            </div>
          ) : (
            /* Portrait / Square / Story: product above, text below */
            <div className="absolute inset-0 flex flex-col">
              <div className="flex-1 flex items-center justify-center p-3">
                <div className="w-[55%] h-full rounded-xl bg-primary/18 border border-primary/25" />
              </div>
              <div className="p-2 flex flex-col gap-1.5">
                <div className="h-2.5 w-4/5 rounded-md bg-primary/30" />
                <div className="h-2 w-3/5 rounded-md bg-primary/20" />
                <div className="flex gap-1 flex-wrap">
                  {copy.features.slice(0, 3).map((_, i) => (
                    <div key={i} className="h-2.5 w-8 rounded-full bg-primary/18 shrink-0" />
                  ))}
                </div>
                <div className="mt-1 h-6 w-full max-w-[80%] mx-auto rounded-md bg-primary/40 shrink-0" />
                <div className="h-2.5 w-12 rounded-full bg-primary/22 mx-auto" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step canvas (idle / generating copy) ────────────────────────────────────

export function AdCreativeStepCanvas({
  step,
  generating = false,
  aspectRatio,
}: {
  step: 1 | 2 | 3;
  generating?: boolean;
  aspectRatio: AdAspectRatio;
}) {
  const meta = STEP_META[step];
  const Icon = meta.icon;

  return (
    <div className="relative w-full flex flex-col flex-1 min-h-[420px] rounded-2xl overflow-hidden select-none border border-border bg-card">
      <style>{`
        .sc2-dot { animation: sc2-dot 2.2s ease-in-out infinite; }
        @keyframes sc2-dot {
          0%, 80%, 100% { transform: scale(1);    opacity: 0.7; }
          40%            { transform: scale(1.08); opacity: 1;   }
        }
      `}</style>

      <div className="flex items-center justify-center gap-1 px-4 py-3 border-b border-border bg-muted/50 shrink-0">
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

      <div className="relative flex-1 flex items-center justify-center min-h-[320px] overflow-hidden bg-muted/30 p-4">
        <StepPreview step={step} meta={meta} generating={generating} aspectRatio={aspectRatio} />
      </div>

      <div className="border-t border-border px-4 py-3 bg-muted/50 shrink-0">
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

// ─── AI Generating Canvas (while image is being rendered) ────────────────────

export function AdCreativeGeneratingCanvas({
  designer,
  aspectRatio,
}: {
  designer?: AdCreativeDesignerOutput | null;
  aspectRatio: AdAspectRatio;
}) {
  if (!designer) {
    return <DesignSystemSkeleton aspectRatio={aspectRatio} />;
  }

  const accentRgb   = hexToRgb(designer.accent_hex);
  const textHex     = isDark(designer.background_hex) ? designer.primary_text_hex : "#0a0a0a";
  const bgGradient  = buildGradient(designer);
  const accentHex   = designer.accent_hex;
  const aestheticWords = designer.aesthetic.split(/[\s,·]+/).slice(0, 3).join(" · ");

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-border bg-card">
      <div className="p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-0.5">
          Generating image
        </p>
        <div
          className="relative mx-auto rounded-xl overflow-hidden border border-white/10"
          style={{ aspectRatio: getRatioCssAspect(aspectRatio), maxHeight: "440px", background: bgGradient }}
        >
          <style>{`
            @keyframes ac-scan {
              0%   { top: -2px; opacity: 0; }
              8%   { opacity: 1; }
              92%  { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
            @keyframes ac-grid-drift {
              0%   { background-position: 0 0; }
              100% { background-position: 40px 40px; }
            }
            @keyframes ac-shimmer-txt {
              0%, 100% { opacity: 0.75; }
              50%      { opacity: 1; }
            }
            @keyframes ac-float {
              0%   { transform: translateY(0px) scale(1);   opacity: 0; }
              15%  { opacity: 1; }
              85%  { opacity: 1; }
              100% { transform: translateY(-60px) scale(0.8); opacity: 0; }
            }
            @keyframes ac-blob {
              0%, 100% { transform: translate(0, 0) scale(1); }
              33%       { transform: translate(12px, -8px) scale(1.05); }
              66%       { transform: translate(-8px, 10px) scale(0.96); }
            }
            @keyframes ac-ring-pulse {
              0%, 100% { opacity: 0.5; transform: scale(1); }
              50%      { opacity: 0.85; transform: scale(1.02); }
            }
            .ac-scan        { animation: ac-scan 2.4s ease-in-out infinite; }
            .ac-grid-drift  { animation: ac-grid-drift 4s linear infinite; }
            .ac-shimmer-txt { animation: ac-shimmer-txt 1.8s ease-in-out infinite; }
            .ac-float       { animation: ac-float 3.2s ease-in-out infinite; }
            .ac-blob        { animation: ac-blob 7s ease-in-out infinite; }
            .ac-ring-pulse  { animation: ac-ring-pulse 3.5s ease-in-out infinite; }
          `}</style>

          {/* Blobs */}
          <div
            className="ac-blob absolute -top-6 -left-4 w-28 h-28 rounded-full blur-2xl pointer-events-none"
            style={{ background: `radial-gradient(circle, rgba(${accentRgb}, 0.28) 0%, transparent 70%)` }}
          />
          <div
            className="ac-blob absolute -bottom-4 -right-3 w-24 h-24 rounded-full blur-2xl pointer-events-none"
            style={{ background: `radial-gradient(circle, rgba(${accentRgb}, 0.2) 0%, transparent 70%)`, animationDelay: "2.5s" }}
          />

          {/* Grid */}
          <div
            className="absolute inset-0 pointer-events-none ac-grid-drift"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              opacity: !isDark(designer.background_hex) ? 0.3 : 1,
            }}
          />

          {/* Scan line */}
          <div
            className="ac-scan absolute left-0 right-0 h-[2px] pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${accentHex}cc 40%, ${accentHex} 50%, ${accentHex}cc 60%, transparent 100%)`,
              boxShadow: `0 0 14px 4px ${accentHex}55`,
            }}
          />

          {/* Particles */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="ac-float absolute w-1 h-1 rounded-full pointer-events-none"
              style={{
                left: `${20 + i * 20}%`,
                bottom: `${12 + (i % 3) * 10}%`,
                background: accentHex,
                boxShadow: `0 0 6px 2px ${accentHex}88`,
                animationDelay: `${i * 0.6}s`,
                animationDuration: `${3 + i * 0.4}s`,
              }}
            />
          ))}

          {/* Center content */}
          <div className="relative flex flex-col items-center justify-center px-3 py-4 h-full">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md px-4 py-4 shadow-lg">
              <div className="relative w-10 h-10">
                <div className="ac-ring-pulse absolute inset-0 rounded-full border" style={{ borderColor: `${accentHex}60` }} />
                <div className="absolute inset-0.5 rounded-full border animate-spin [animation-duration:6s]" style={{ borderColor: `${accentHex}45` }} />
                <div className="absolute inset-1 rounded-full border animate-spin [animation-duration:3.5s] [animation-direction:reverse]" style={{ borderColor: `${accentHex}60` }} />
                <div className="absolute inset-1.5 rounded-full border-2 border-transparent animate-spin [animation-duration:2s]" style={{ borderTopColor: accentHex, borderRightColor: `${accentHex}70` }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="size-3 animate-pulse [animation-duration:2.5s]" style={{ color: accentHex }} />
                </div>
              </div>

              <div className="text-center space-y-0.5">
                <p className="ac-shimmer-txt font-semibold text-[10px] tracking-wide text-white">
                  Rendering your ad creative
                </p>
                <p className="text-[9px] text-white/60">
                  AI is painting your ad…
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-1 max-w-full">
                <span
                  className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-medium border border-white/15 bg-white/10 text-white"
                >
                  <span className="flex gap-0.5">
                    {[designer.background_hex, accentHex, designer.primary_text_hex].map((c, i) => (
                      <span key={i} className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: c, border: "1px solid rgba(255,255,255,0.3)" }} />
                    ))}
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

              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1 h-1 rounded-full animate-bounce" style={{ background: accentHex, animationDelay: `${i * 0.18}s` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%)" }}
          />
        </div>
      </div>
    </div>
  );
}
