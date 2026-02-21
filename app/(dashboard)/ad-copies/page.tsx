import { AdCopiesGeneratorForm } from "@/components/ad-copies/ad-copies-generator-form";

export default function AdCopiesPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Ad copies
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Upload product photos, pick a marketing angle, and generate multiple ready-to-use ad copies with your tone, language, and format.
        </p>
      </div>
      <AdCopiesGeneratorForm />
    </div>
  );
}
