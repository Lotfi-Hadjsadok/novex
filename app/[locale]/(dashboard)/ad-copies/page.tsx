import { AdCopiesGeneratorForm } from "@/components/ad-copies/ad-copies-generator-form";
import { useTranslations } from "next-intl";

export default function AdCopiesPage() {
  const t = useTranslations("adCopiesPage");

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
      <AdCopiesGeneratorForm />
    </div>
  );
}
