import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import FeatureCard from "./FeatureCard";

export default function FeaturesSection() {
  const t = useTranslations();

  return (
    <section className="w-full py-16 md:py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 radial-gradient-ellipse"></div>

      <div className="container px-4 md:px-6 relative z-20">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 relative">
            <span className="px-4 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary relative z-10">
              {t("features.title")}
            </span>
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/10 to-blue-500/10 blur-md z-0"></div>
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
            <span className="gradient-text inline-block">
              {t("features.title")}
            </span>
          </h2>
          <p className="mx-auto max-w-[800px] text-muted-foreground text-lg">
            {t("features.description")}
          </p>

          <Separator className="my-8 max-w-[100px] mx-auto opacity-30" />
        </div>

        <div className="grid gap-8 md:gap-12 lg:grid-cols-3">
          <FeatureCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="m22 8-6 4 6 4V8Z" />
                <rect x="2" y="6" width="14" height="12" rx="2" />
              </svg>
            }
            title={t("features.upload")}
            description={t("video.upload.requirements")}
            delay={0}
            gradientFrom="primary/5"
          />

          <FeatureCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-blue-500"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M12 8v8" />
                <path d="m8 12 8 0" />
              </svg>
            }
            title={t("features.process")}
            description={t("video.processing.status")}
            delay={0.2}
            gradientFrom="blue-500/5"
            iconBg="blue-500/10"
            iconBorder="blue-500/20"
          />

          <FeatureCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-green-500"
              >
                <path d="M21 15V6" />
                <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                <path d="M12 12H3" />
                <path d="M16 6H3" />
                <path d="M12 18H3" />
              </svg>
            }
            title={t("features.analyze")}
            description={t("dashboard.videoDetails")}
            delay={0.4}
            gradientFrom="green-500/5"
            iconBg="green-500/10"
            iconBorder="green-500/20"
          />
        </div>
      </div>
    </section>
  );
}
