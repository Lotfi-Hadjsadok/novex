"use client";

import { useState, useTransition } from "react";
import { Suspense } from "react";
import { generateLandingPage } from "@/app/actions/landing-page";
import type { CopyLanguage, ArabicDialect } from "@/lib/landing-page/types";
import { LandingPageOutput } from "./landing-page-output";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ImagePlus, Sparkles } from "lucide-react";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function LandingPageGeneratorForm() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [language, setLanguage] = useState<CopyLanguage>("en");
  const [dialect, setDialect] = useState<ArabicDialect | "">("");
  const [userFeaturesText, setUserFeaturesText] = useState("");
  const [rawPriceLines, setRawPriceLines] = useState("");
  const [promise, setPromise] = useState<Promise<unknown> | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    Promise.all(Array.from(files).map(readFileAsDataUrl)).then((urls) => {
      setImageUrls((prev) => [...prev, ...urls]);
    });
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrls.length) return;
    startTransition(() => {
      const p = generateLandingPage({
        productImageUrls: imageUrls,
        language,
        dialect: language === "ar" && dialect ? dialect : undefined,
        userFeatures: userFeaturesText
          ? userFeaturesText
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        rawPriceLines: rawPriceLines.trim() || undefined,
      });
      setPromise(p);
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <Card className="h-fit border-border/80 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="size-5 text-primary" />
            Generate landing page
          </CardTitle>
          <CardDescription>
            Upload product image(s), set language and options, then generate. The output is your landing page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-2">
              <Label>Product images</Label>
              <div className="flex flex-wrap gap-2">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={url}
                      alt=""
                      className="size-16 rounded-md border border-border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <label className="flex size-16 cursor-pointer items-center justify-center rounded-md border border-dashed border-muted-foreground/50 bg-muted/30 transition-colors hover:bg-muted/50">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={handleFiles}
                  />
                  <ImagePlus className="size-6 text-muted-foreground" />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                At least one image required. Used for copy, features, and preview.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={language}
                onValueChange={(v) => setLanguage(v as CopyLanguage)}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {language === "ar" && (
              <div className="space-y-2">
                <Label htmlFor="dialect">Dialect (optional)</Label>
                <Select
                  value={dialect || "standard"}
                  onValueChange={(v) => setDialect(v === "standard" ? "" : (v as ArabicDialect))}
                >
                  <SelectTrigger id="dialect">
                    <SelectValue placeholder="Standard" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="algerian">Algerian</SelectItem>
                    <SelectItem value="tunisian">Tunisian</SelectItem>
                    <SelectItem value="moroccan">Moroccan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="features">Feature bullets (optional)</Label>
              <Textarea
                id="features"
                placeholder="One per line. Leave empty to extract from images."
                value={userFeaturesText}
                onChange={(e) => setUserFeaturesText(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Raw price line (optional)</Label>
              <Input
                id="price"
                placeholder='e.g. "1 for 2500"'
                value={rawPriceLines}
                onChange={(e) => setRawPriceLines(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={!imageUrls.length || isPending}
              className="gap-2"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Generate landing page
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="min-w-0">
        {promise && (
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/20 py-16">
                <Loader2 className="size-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Building preview…
                </p>
              </div>
            }
          >
            <LandingPageOutput
              promise={promise as Promise<import("@/lib/landing-page/types").LandingPageGraphState>}
              compact={true}
            />
          </Suspense>
        )}
        {!promise && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 py-24 text-center">
            <p className="text-muted-foreground">
              Configure options and click &quot;Generate landing page&quot; to see the result here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
