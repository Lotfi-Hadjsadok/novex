"use client";

import { use } from "react";
import type { LandingPageGraphState } from "@/lib/landing-page/types";
import { LandingPagePreview } from "./landing-page-preview";
import { AlertCircle } from "lucide-react";

type Props = {
  promise: Promise<LandingPageGraphState>;
  compact?: boolean;
};

export function LandingPageOutput({ promise, compact = true }: Props) {
  const state = use(promise);

  if (state.error) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        <AlertCircle className="size-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Generation failed</p>
          <p className="text-sm opacity-90">{state.error}</p>
        </div>
      </div>
    );
  }

  return <LandingPagePreview state={state} compact={compact} />;
}
