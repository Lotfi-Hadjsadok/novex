import { create } from "zustand";
import type { CopyLanguage, ArabicDialect, Currency } from "@/types/landing-page";
import type { AdAspectRatio } from "@/types/ad-creative";
import type { AdCreativeCopy } from "@/lib/ai/ad-creative/copy";
import type { AdCreativeDesignerOutput } from "@/lib/ai/ad-creative/designer";

export const AD_CREATIVE_PHASES = ["Product", "Language", "Pricing", "Review", "Design"] as const;
export type AdCreativePhase = (typeof AD_CREATIVE_PHASES)[number];

export type AdCreativeFeatureItem = { text: string; visual: string };
export type AdCreativeResult = { imageDataUrl: string | null };

const initialState = {
  formStep:      1 as 1 | 2 | 3,
  productImages: [] as File[],
  productName:   "",
  language:      "en" as CopyLanguage,
  dialect:       "standard" as ArabicDialect,
  price:         "",
  currency:      "DZD" as Currency,
  customPrompt:  "",
  aspectRatio:   "1:1" as AdAspectRatio,
  copyData:      null as AdCreativeCopy | null,
  designer:      null as AdCreativeDesignerOutput | null,
  result:        null as AdCreativeResult | null,
};

type AdCreativeState = typeof initialState & {
  setFormStep:      (step: 1 | 2 | 3) => void;
  setProductImages: (images: File[]) => void;
  setProductName:   (name: string) => void;
  setLanguage:      (language: CopyLanguage) => void;
  setDialect:       (dialect: ArabicDialect) => void;
  setPrice:         (price: string) => void;
  setCurrency:      (currency: Currency) => void;
  setCustomPrompt:  (customPrompt: string) => void;
  setAspectRatio:   (ratio: AdAspectRatio) => void;
  setCopyData:      (copy: AdCreativeCopy | null) => void;
  updateCopy:       (field: keyof AdCreativeCopy, value: AdCreativeCopy[keyof AdCreativeCopy]) => void;
  updateFeature:    (index: number, field: keyof AdCreativeFeatureItem, value: string) => void;
  addFeature:       () => void;
  removeFeature:    (index: number) => void;
  setDesigner:      (designer: AdCreativeDesignerOutput | null) => void;
  setResult:        (result: AdCreativeResult | null) => void;
  reset:            () => void;
};

export const useAdCreativeStore = create<AdCreativeState>((set) => ({
  ...initialState,
  setFormStep:      (step)     => set({ formStep: step }),
  setProductImages: (images)   => set({ productImages: images }),
  setProductName:   (name)     => set({ productName: name }),
  setLanguage:      (language) => set({ language }),
  setDialect:       (dialect)  => set({ dialect }),
  setPrice:         (price)    => set({ price }),
  setCurrency:      (currency) => set({ currency }),
  setCustomPrompt:  (customPrompt) => set({ customPrompt }),
  setAspectRatio:   (ratio)    => set({ aspectRatio: ratio }),
  setCopyData:      (copy)     => set({ copyData: copy }),
  updateCopy: (field, value) =>
    set((state) => ({
      copyData: state.copyData ? { ...state.copyData, [field]: value } : state.copyData,
    })),
  updateFeature: (index, field, value) =>
    set((state) => ({
      copyData: state.copyData
        ? {
            ...state.copyData,
            features: state.copyData.features.map((f, i) =>
              i === index ? { ...f, [field]: value } : f
            ),
          }
        : state.copyData,
    })),
  addFeature: () =>
    set((state) => ({
      copyData: state.copyData
        ? { ...state.copyData, features: [...state.copyData.features, { text: "", visual: "" }] }
        : state.copyData,
    })),
  removeFeature: (index) =>
    set((state) => ({
      copyData: state.copyData
        ? { ...state.copyData, features: state.copyData.features.filter((_, i) => i !== index) }
        : state.copyData,
    })),
  setDesigner: (designer) => set({ designer }),
  setResult:   (result)   => set({ result }),
  reset:       ()         => set(initialState),
}));
