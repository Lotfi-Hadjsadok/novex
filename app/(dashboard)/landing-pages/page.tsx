import { LandingPageGeneratorForm } from "@/components/landing-page/landing-page-generator-form";

export default function LandingPagesPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Landing Pages
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Generate a landing page from product images. The output is an image.
        </p>
      </div>
      <LandingPageGeneratorForm />
    </div>
  );
}
