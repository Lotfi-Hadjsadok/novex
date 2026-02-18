"use client";

import { useTransition, useState, type SubmitEventHandler } from "react";
import {
  ARABIC_DIALECTS,
  LANGUAGES,
  type ArabicDialect,
  type CopyLanguage,
} from "@/types/landing-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { ImagePicker } from "@/components/ui/image-picker";
import { generateLandingPage } from "@/app/actions/landing-page";

export function LandingPageGeneratorForm() {
  const [productImages, setProductImages] = useState<File[]>([]);
  const [language, setLanguage] = useState<CopyLanguage>("en");
  const [dialect, setDialect] = useState<ArabicDialect>("standard");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [isPending, startTransition] = useTransition();
 
  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    startTransition(async () => {
      await generateLandingPage(
        productImages,
        language,
        dialect,
        productName,
        price
      );
    });
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Landing page generator</CardTitle>
        <CardDescription>
          Add product name, images, language, and price to generate a landing
          page.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel>
                <FieldTitle>Product images</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <ImagePicker
                  value={productImages}
                  onChange={setProductImages}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>
                <FieldTitle>Output text language</FieldTitle>
              </FieldLabel>
              <Select
                value={language}
                onValueChange={(v) => setLanguage(v as CopyLanguage)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {language === "ar" && (
              <Field>
                <FieldLabel>
                  <FieldTitle>Arabic dialect</FieldTitle>
                </FieldLabel>
                <Select
                  value={dialect}
                  onValueChange={(v) => setDialect(v as ArabicDialect)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ARABIC_DIALECTS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
            <Field>
              <FieldLabel>
                <FieldTitle>Product name</FieldTitle>
              </FieldLabel>
              <Input
                type="text"
                placeholder="e.g. NovaX Pro Headphones"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>
                <FieldTitle>Product price</FieldTitle>
              </FieldLabel>
              <Input
                type="text"
                placeholder="e.g. 29.99 USD"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Generating…" : "Generate"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
