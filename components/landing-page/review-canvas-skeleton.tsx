"use client";

import "./landing-page.css";
import { useTranslations } from "next-intl";
import type { z } from "zod";
import type { adCopyOutputSchema } from "@/lib/ai/product-landing-page/copy";

type CopyData = z.infer<typeof adCopyOutputSchema>;
type FeatureItem = { text: string; visual: string };

export function ReviewCanvasSkeleton({
  copyData,
  features,
}: {
  copyData: CopyData;
  features: FeatureItem[];
}) {
  const tc = useTranslations("common");
  const featureCount = Math.min(Math.max(features.length, 3), 5);
  const hasTag = (copyData.section_1.tag?.length ?? 0) > 0;
  const hasBadge = !!copyData.section_1.badge_text;
  const hasSection2Headline = !!copyData.section_2?.headline;
  const hasShopInfo = !!copyData.section_3.shop_info;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-border bg-card">
      <div className="p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-0.5">
          {tc("previewLayout")}
        </p>
        <div className="mx-auto max-w-[240px] rounded-xl overflow-hidden aspect-[600/1584] border border-primary/15 bg-muted/20 flex flex-col">
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
