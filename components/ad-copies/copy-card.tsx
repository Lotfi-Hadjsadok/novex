"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyCard({ copy, index }: { copy: { headline: string; body: string; cta: string; hashtags: string[] | null }; index: number }) {
  const [copied, setCopied] = useState(false);
  const tc = useTranslations("common");
  const t = useTranslations("adCopies.results");

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
          {t("copyLabel", { index: index + 1 })}
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
            <><ClipboardCheck className="size-3" />{tc("copied")}</>
          ) : (
            <><Copy className="size-3" />{tc("copy")}</>
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
