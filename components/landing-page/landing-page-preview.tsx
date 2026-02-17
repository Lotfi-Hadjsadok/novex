"use client";

import { useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import type { LandingPageGraphState } from "@/lib/landing-page/types";
import type { CreativeResult } from "@/lib/landing-page/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type Props = {
  state: LandingPageGraphState;
  className?: string;
  /** When true, render in a compact card suitable for dashboard; when false, full-width landing page. */
  compact?: boolean;
};

function getAccentColor(creative?: CreativeResult): string {
  const accent =
    (creative?.theme as { accentColor?: string } | undefined)?.accentColor ??
    (creative?.section_1 as { accentColor?: string } | undefined)?.accentColor;
  return accent ?? "hsl(var(--primary))";
}

export function LandingPagePreview({ state, className, compact }: Props) {
  const articleRef = useRef<HTMLElement>(null);
  const { copy, features, creative, productImageUrls, generatedSectionImageUrls } = state;

  const handleExportPng = useCallback(() => {
    if (!articleRef.current) return;
    toPng(articleRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "landing-page.png";
        a.click();
      })
      .catch((err) => console.error(err));
  }, []);

  if (!copy?.section_1 || !copy?.section_3) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center text-muted-foreground">
        Missing copy or creative data.
      </div>
    );
  }

  const accent = getAccentColor(creative);
  const featureList = features?.section_2?.features ?? [];
  const heroImage = generatedSectionImageUrls?.[0] ?? productImageUrls?.[0];
  const section2Image = generatedSectionImageUrls?.[1] ?? productImageUrls?.[1] ?? productImageUrls?.[0];
  const section3Image = generatedSectionImageUrls?.[2] ?? productImageUrls?.[0];

  const wrapperClass = compact
    ? "max-w-lg mx-auto overflow-hidden rounded-xl border border-border shadow-lg"
    : "min-h-screen";

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleExportPng} className="gap-2">
          <Download className="size-4" />
          Export as image
        </Button>
      </div>
      <article
      ref={articleRef}
      className={cn("bg-background text-foreground", wrapperClass, className)}
      style={{ ["--accent" as string]: accent }}
    >
      {/* Section 1 — Hero (SQR 1:1) */}
      <section
        className="relative flex flex-col items-center justify-center gap-4 px-6 py-10 text-center"
        style={{ aspectRatio: "1", minHeight: compact ? "320px" : "50vh" }}
      >
        {heroImage && (
          <div className="absolute inset-0 -z-10">
            <img
              src={heroImage}
              alt=""
              className="h-full w-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
          </div>
        )}
        {copy.section_1.tag && (
          <span
            className="rounded-full px-3 py-1 text-xs font-medium text-white/95"
            style={{ backgroundColor: accent }}
          >
            {copy.section_1.tag}
          </span>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md md:text-4xl">
          {copy.section_1.headline}
        </h1>
        <p className="max-w-md text-lg text-white/90 drop-shadow">
          {copy.section_1.subheadline}
        </p>
      </section>

      {/* Section 2 — Features (WIDE 4:5) */}
      <section
        className="flex flex-col gap-6 px-6 py-10"
        style={{ aspectRatio: "4/5", minHeight: compact ? "360px" : "60vh" }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureList.map((f, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/80 bg-card/60 p-4 shadow-sm"
            >
              <p className="font-semibold text-foreground" style={{ color: accent }}>
                {f.text}
              </p>
              {f.description && (
                <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
              )}
            </div>
          ))}
        </div>
        {section2Image && (
          <div className="flex justify-center">
            <img
              src={section2Image}
              alt=""
              className="max-h-48 rounded-lg object-contain"
            />
          </div>
        )}
      </section>

      {/* Section 3 — Conversion (WIDE 4:5) */}
      <section
        className="flex flex-col items-center justify-center gap-4 px-6 py-10 text-center"
        style={{ aspectRatio: "4/5", minHeight: compact ? "360px" : "60vh" }}
      >
        {section3Image && (
          <img
            src={section3Image}
            alt=""
            className="max-h-40 w-auto rounded-lg object-contain"
          />
        )}
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {copy.section_3.headline}
        </h2>
        <p className="max-w-md text-muted-foreground">
          {copy.section_3.subheadline}
        </p>
        {copy.section_3.price && (
          <p className="text-xl font-semibold" style={{ color: accent }}>
            {copy.section_3.price}
          </p>
        )}
        <a
          href="#"
          className="rounded-full px-6 py-3 text-base font-semibold text-white shadow-lg transition-opacity hover:opacity-95"
          style={{ backgroundColor: accent }}
        >
          {copy.section_3.cta}
        </a>
        {copy.section_3.shop_info && (
          <p className="text-sm text-muted-foreground">{copy.section_3.shop_info}</p>
        )}
      </section>
    </article>
    </div>
  );
}
