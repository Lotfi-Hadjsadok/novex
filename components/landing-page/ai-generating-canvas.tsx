"use client";

import "./landing-page.css";
import { Sparkles, Layers, Wand2 } from "lucide-react";
import type { DesignerOutput } from "@/lib/ai/product-landing-page/designer";
import { LandingPageSkeleton } from "./landing-page-skeleton";

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

export function AIGeneratingCanvas({ designer }: AIGeneratingCanvasProps) {
  if (!designer) {
    return <LandingPageSkeleton />;
  }

  const accentRgb = hexToRgb(designer.accent_hex);
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

      <div
        className="absolute inset-0 pointer-events-none grid-drift"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: !isDark(designer.background_hex) ? 0.3 : 1,
        }}
      />

      <div
        className="scan-line absolute left-0 right-0 h-[2px] pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${accentHex}cc 40%, ${accentHex} 50%, ${accentHex}cc 60%, transparent 100%)`,
          boxShadow: `0 0 14px 4px ${accentHex}55`,
        }}
      />

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

      <div className="relative flex flex-col items-center justify-center px-3 py-6 h-full">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md px-4 py-4 shadow-lg">

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

          <div className="text-center space-y-0.5">
            <p className="shimmer-txt font-semibold text-[10px] tracking-wide text-white">
              Rendering your canvas
            </p>
            <p className="text-[9px] text-white/60">
              AI is painting your landing page image…
            </p>
          </div>

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
