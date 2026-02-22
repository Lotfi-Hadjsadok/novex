"use client";

import { useTranslations } from "next-intl";
import { AD_COPY_SIZES, type AdCopySize } from "@/types/ad-copies";
import { cn } from "@/lib/utils";

export function SizePicker({
  value,
  onChange,
}: {
  value: AdCopySize;
  onChange: (size: AdCopySize) => void;
}) {
  const t = useTranslations("adCopies.sizes");

  return (
    <div className="grid grid-cols-3 gap-2">
      {AD_COPY_SIZES.map((size) => (
        <button
          key={size.value}
          type="button"
          onClick={() => onChange(size.value)}
          className={cn(
            "flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-center transition-all duration-150",
            value === size.value
              ? "border-primary bg-primary/5 shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
              : "border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40"
          )}
        >
          <p className={cn("text-[13px] font-semibold leading-none", value === size.value ? "text-primary" : "text-foreground")}>
            {t(size.value)}
          </p>
          <p className="text-[10px] text-muted-foreground leading-tight">{t(`${size.value}Desc`)}</p>
        </button>
      ))}
    </div>
  );
}
