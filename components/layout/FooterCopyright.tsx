"use client";

import { useTranslations } from "next-intl";

export function FooterCopyright() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <div className="border-t pt-6 mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} Football Detection.{" "}
          {t("common.allRightsReserved")}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">
            {t("common.terms")}
          </a>
          <span className="text-muted-foreground/50">•</span>
          <a href="#" className="hover:text-primary transition-colors">
            {t("common.privacy")}
          </a>
          <span className="text-muted-foreground/50">•</span>
          <a href="#" className="hover:text-primary transition-colors">
            {t("common.cookies")}
          </a>
        </div>
      </div>
    </div>
  );
}
