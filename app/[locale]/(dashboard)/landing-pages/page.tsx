import { LandingPageGeneratorForm } from "@/components/landing-page/landing-page-generator-form";
import { useTranslations } from "next-intl";

export default function LandingPagesPage() {
  const t = useTranslations("landingPagesPage");

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-muted-foreground">
          {t("description")}
        </p>
      </div>
      <LandingPageGeneratorForm />
    </div>
  );
}
