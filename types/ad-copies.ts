export type AdCopyTone =
  | "professional"
  | "playful"
  | "luxury"
  | "urgent"
  | "casual"
  | "inspirational";

export type AdCopySize = "short" | "medium" | "long";

export type AdCopyAngleId =
  | "benefit"
  | "pain-point"
  | "lifestyle"
  | "urgency"
  | "social-proof"
  | "curiosity";

export interface CopyAngle {
  id:               AdCopyAngleId;
  name:             string;
  description:      string;
  headline_preview: string;
  hook:             string;
}

export interface GeneratedCopy {
  headline:  string;
  body:      string;
  cta:       string;
  hashtags:  string[] | null;
}

export const AD_COPY_TONES: { value: AdCopyTone; label: string; description: string }[] = [
  { value: "professional",  label: "Professional",  description: "Authoritative & trustworthy"       },
  { value: "playful",       label: "Playful",        description: "Fun, energetic & light-hearted"    },
  { value: "luxury",        label: "Luxury",         description: "Premium, exclusive & elevated"     },
  { value: "urgent",        label: "Urgent",         description: "Scarcity-driven & action-pushing"  },
  { value: "casual",        label: "Casual",         description: "Friendly, relatable & everyday"    },
  { value: "inspirational", label: "Inspirational",  description: "Motivating & empowering"           },
];

export const AD_COPY_SIZES: { value: AdCopySize; label: string; description: string }[] = [
  { value: "short",  label: "Short",  description: "Headline + 1 line + CTA"            },
  { value: "medium", label: "Medium", description: "Headline + 2–3 lines + CTA"         },
  { value: "long",   label: "Long",   description: "Full paragraph + features + CTA"    },
];

export const AD_COPY_COUNTS = [1, 2, 3, 4, 5, 6] as const;
export type AdCopyCount = (typeof AD_COPY_COUNTS)[number];
