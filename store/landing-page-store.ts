import { create } from "zustand";
import type { CopyLanguage, ArabicDialect, Currency } from "@/types/landing-page";
import type { adCopyOutputSchema } from "@/lib/ai/product-landing-page/copy";
import type { z } from "zod";
import type { DesignerOutput, FullDesignerSpec } from "@/lib/ai/product-landing-page/designer";

export const PHASES = ["Product", "Language", "Pricing", "Review", "Design"] as const;
export type Phase = (typeof PHASES)[number];

type CopyData = z.infer<typeof adCopyOutputSchema>;
export type FeatureItem = { visual: string; text: string };
export type GenerateResult = { creative: FullDesignerSpec; imageDataUrl: string | null };

const initialState = {
  formStep: 1 as 1 | 2 | 3,
  productImages: [] as File[],
  productName: "",
  language: "en" as CopyLanguage,
  dialect: "standard" as ArabicDialect,
  price: "",
  currency: "DZD" as Currency,
  customPrompt: "",
  copyData: null as CopyData | null,
  features: [] as FeatureItem[],
  designer: null as DesignerOutput | null,
  result: null as GenerateResult | null,
};

type LandingPageState = typeof initialState & {
  setFormStep: (step: 1 | 2 | 3) => void;
  setProductImages: (images: File[]) => void;
  setProductName: (name: string) => void;
  setLanguage: (language: CopyLanguage) => void;
  setDialect: (dialect: ArabicDialect) => void;
  setPrice: (price: string) => void;
  setCurrency: (currency: Currency) => void;
  setCustomPrompt: (customPrompt: string) => void;
  setCopyData: (copyData: CopyData | null) => void;
  setFeatures: (features: FeatureItem[]) => void;
  setDesigner: (designer: DesignerOutput | null) => void;
  setResult: (result: GenerateResult | null) => void;
  updateSection1: (field: string, value: string | null) => void;
  updateSection3: (field: string, value: string | null) => void;
  updateFeature: (targetIndex: number, field: keyof FeatureItem, value: string) => void;
  addFeature: () => void;
  removeFeature: (targetIndex: number) => void;
  reset: () => void;
};

export const useLandingPageStore = create<LandingPageState>((set) => ({
  ...initialState,
  setFormStep: (step) => set({ formStep: step }),
  setProductImages: (images) => set({ productImages: images }),
  setProductName: (name) => set({ productName: name }),
  setLanguage: (language) => set({ language }),
  setDialect: (dialect) => set({ dialect }),
  setPrice: (price) => set({ price }),
  setCurrency: (currency) => set({ currency }),
  setCustomPrompt: (customPrompt) => set({ customPrompt }),
  setCopyData: (copyData) => set({ copyData }),
  setFeatures: (features) => set({ features }),
  setDesigner: (designer) => set({ designer }),
  setResult: (result) => set({ result }),
  updateSection1: (field, value) =>
    set((state) => ({
      copyData: state.copyData
        ? { ...state.copyData, section_1: { ...state.copyData.section_1, [field]: value } }
        : state.copyData,
    })),
  updateSection3: (field, value) =>
    set((state) => ({
      copyData: state.copyData
        ? { ...state.copyData, section_3: { ...state.copyData.section_3, [field]: value } }
        : state.copyData,
    })),
  updateFeature: (targetIndex, field, value) =>
    set((state) => ({
      features: state.features.map((featureItem, featureIndex) =>
        featureIndex === targetIndex ? { ...featureItem, [field]: value } : featureItem
      ),
    })),
  addFeature: () =>
    set((state) => ({
      features: [...state.features, { visual: "", text: "" }],
    })),
  removeFeature: (targetIndex) =>
    set((state) => ({
      features: state.features.filter(
        (_, filterIndex) => filterIndex !== targetIndex
      ),
    })),
  reset: () => set(initialState),
}));
