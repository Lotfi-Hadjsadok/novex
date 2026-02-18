"use client";

import { use, useState } from "react";
import type { ArabicDialect, CopyLanguage } from "@/types/landing-page";
import type { FormOptions } from "@/app/actions/landing-page";
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

type Step = 1 | 2;

export function LandingPageGeneratorForm({
  optionsPromise,
}: {
  optionsPromise: Promise<FormOptions>;
}) {
  const options = use(optionsPromise);
  const [step, setStep] = useState<Step>(1);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [language, setLanguage] = useState<CopyLanguage>("en");
  const [dialect, setDialect] = useState<ArabicDialect>("standard");
  const [price, setPrice] = useState("");

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Landing page generator</CardTitle>
        <CardDescription>
          Step {step} of 2 — {step === 1 ? "Products & language" : "Price"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
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
                  {options.languages.map((opt) => (
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
                    {options.arabicDialects.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          </FieldGroup>
        )}
        {step === 2 && (
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
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {step === 1 ? (
          <Button onClick={() => setStep(2)}>Next</Button>
        ) : (
          <>
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit">Generate</Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
