"use client";

import "./ad-creative.css";
import { useTranslations } from "next-intl";
import type { AdCreativeCopy } from "@/lib/ai/ad-creative/copy";
import type { AdAspectRatio } from "@/types/ad-creative";
import { getRatioCssAspect } from "@/types/ad-creative";

export function AdCreativeReviewSkeleton({
  copy,
  aspectRatio,
}: {
  copy: AdCreativeCopy;
  aspectRatio: AdAspectRatio;
}) {
  const tc = useTranslations("common");
  const hasTag   = (copy.tag?.length ?? 0) > 0;
  const hasBadge = !!copy.badge_text;
  const isLandscape = aspectRatio === "16:9";

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-border bg-card">
      <div className="p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-0.5">
          {tc("previewLayout")}
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
