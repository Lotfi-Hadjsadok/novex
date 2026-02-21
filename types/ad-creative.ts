export type AdAspectRatio = "1:1" | "9:16" | "4:5" | "16:9" | "2:3";

export const AD_ASPECT_RATIOS: {
  value: AdAspectRatio;
  label: string;
  description: string;
  width: number;
  height: number;
}[] = [
  { value: "1:1",  label: "1:1",  description: "Square",    width: 1080, height: 1080 },
  { value: "9:16", label: "9:16", description: "Story / Reel", width: 1080, height: 1920 },
  { value: "4:5",  label: "4:5",  description: "Portrait",   width: 1080, height: 1350 },
  { value: "16:9", label: "16:9", description: "Landscape",  width: 1920, height: 1080 },
  { value: "2:3",  label: "2:3",  description: "Pinterest",  width: 1000, height: 1500 },
];

export function getRatioDimensions(ratio: AdAspectRatio) {
  return AD_ASPECT_RATIOS.find((r) => r.value === ratio)!;
}

export function getRatioCssAspect(ratio: AdAspectRatio): string {
  const map: Record<AdAspectRatio, string> = {
    "1:1":  "1 / 1",
    "9:16": "9 / 16",
    "4:5":  "4 / 5",
    "16:9": "16 / 9",
    "2:3":  "2 / 3",
  };
  return map[ratio];
}
