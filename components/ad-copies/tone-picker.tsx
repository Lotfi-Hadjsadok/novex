"use client";

import { useTranslations } from "next-intl";
import { AD_COPY_TONES, type AdCopyTone } from "@/types/ad-copies";
import { cn } from "@/lib/utils";

export function TonePicker({
  value,
  onChange,
}: {
  value: AdCopyTone;
  onChange: (tone: AdCopyTone) => void;
}) {
  const t = useTranslations("adCopies.tones");

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
            {t(tone.value)}
          </p>
          <p className="text-[11px] text-muted-foreground leading-snug">{t(`${tone.value}Desc`)}</p>
        </button>
      ))}
    </div>
  );
}
