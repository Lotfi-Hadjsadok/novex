"use client";

import "./landing-page.css";
import { useTranslations } from "next-intl";
import { ImageIcon, Type, Tag } from "lucide-react";
import { PagePreviewSkeleton } from "./page-preview-skeleton";

const STEP_ICONS = { 1: ImageIcon, 2: Type, 3: Tag } as const;

export function StepCanvasSkeleton({
  step,
  generating = false,
}: {
  step: 1 | 2 | 3;
  generating?: boolean;
}) {
  const tc = useTranslations("common");
  const ts = useTranslations("landingPage.steps");
  const Icon = STEP_ICONS[step];
  const label = ts(`step${step}Label`);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden select-none border border-border bg-card">
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

      <div className="relative overflow-hidden bg-muted/30">
        <PagePreviewSkeleton step={step} generating={generating} />
      </div>

      <div className="border-t border-border px-4 py-3 bg-muted/50">
        <div className="flex items-center gap-2.5">
          <Icon className="size-4 shrink-0 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {generating ? tc("generating") : label}
          </span>
          <span className="ml-auto text-xs font-medium text-muted-foreground">
            {tc("stepOfThree", { step })}
          </span>
        </div>
      </div>
    </div>
  );
}
