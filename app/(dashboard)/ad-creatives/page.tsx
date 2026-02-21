import { AdCreativeGeneratorForm } from "@/components/ad-creative/ad-creative-generator-form";

export default function AdCreativesPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Ad Creatives
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Generate a single-panel ad creative from product images. Choose your format and the AI builds the whole composition.
        </p>
      </div>
      <AdCreativeGeneratorForm />
    </div>
  );
}
