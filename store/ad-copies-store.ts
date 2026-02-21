import { create } from "zustand";
import type { CopyLanguage, ArabicDialect, Currency } from "@/types/landing-page";
import type {
  AdCopyTone,
  AdCopySize,
  AdCopyCount,
  AdCopyAngleId,
  CopyAngle,
  GeneratedCopy,
} from "@/types/ad-copies";

export type AdCopiesPhase =
  | "Product"
  | "Settings"
  | "Pricing"
  | "Angles"
  | "Copies";

const initialState = {
  formStep:        1 as 1 | 2 | 3,
  productImages:   [] as File[],
  productName:     "",
  language:        "en"          as CopyLanguage,
  dialect:         "standard"    as ArabicDialect,
  tone:            "casual"      as AdCopyTone,
  useEmojis:       false,
  price:           "",
  currency:        "DZD"         as Currency,
  copySize:        "medium"      as AdCopySize,
  copyCount:       3             as AdCopyCount,
  angles:          null          as CopyAngle[] | null,
  selectedAngleId: null          as AdCopyAngleId | null,
  generatedCopies: null          as GeneratedCopy[] | null,
};

type AdCopiesState = typeof initialState & {
  setFormStep:        (step: 1 | 2 | 3) => void;
  setProductImages:   (images: File[]) => void;
  setProductName:     (name: string) => void;
  setLanguage:        (language: CopyLanguage) => void;
  setDialect:         (dialect: ArabicDialect) => void;
  setTone:            (tone: AdCopyTone) => void;
  setUseEmojis:       (value: boolean) => void;
  setPrice:           (price: string) => void;
  setCurrency:        (currency: Currency) => void;
  setCopySize:        (size: AdCopySize) => void;
  setCopyCount:       (count: AdCopyCount) => void;
  setAngles:          (angles: CopyAngle[] | null) => void;
  setSelectedAngleId: (id: AdCopyAngleId | null) => void;
  setGeneratedCopies: (copies: GeneratedCopy[] | null) => void;
  reset:              () => void;
};

export const useAdCopiesStore = create<AdCopiesState>((set) => ({
  ...initialState,
  setFormStep:        (step)     => set({ formStep: step }),
  setProductImages:   (images)   => set({ productImages: images }),
  setProductName:     (name)     => set({ productName: name }),
  setLanguage:        (language) => set({ language }),
  setDialect:         (dialect)  => set({ dialect }),
  setTone:            (tone)     => set({ tone }),
  setUseEmojis:       (value)    => set({ useEmojis: value }),
  setPrice:           (price)    => set({ price }),
  setCurrency:        (currency) => set({ currency }),
  setCopySize:        (size)     => set({ copySize: size }),
  setCopyCount:       (count)    => set({ copyCount: count }),
  setAngles:          (angles)   => set({ angles }),
  setSelectedAngleId: (id)       => set({ selectedAngleId: id }),
  setGeneratedCopies: (copies)   => set({ generatedCopies: copies }),
  reset:              ()         => set(initialState),
}));
