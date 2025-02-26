"use client";

import { useTranslations } from "next-intl";
import { FooterBrand } from "./FooterBrand";
import { FooterLinks } from "./FooterLinks";
import { FooterNewsletter } from "./FooterNewsletter";
import { FooterCopyright } from "./FooterCopyright";

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations();

  // Quick links data
  const quickLinks = [
    { href: "/dashboard", label: t("dashboard.title") },
    { href: "/about", label: t("common.about") },
    { href: "/contact", label: t("common.contact") },
  ];

  // Account links data
  const accountLinks = [
    { href: "/auth/login", label: t("auth.login") },
    { href: "/auth/register", label: t("auth.register") },
  ];

  // Support links data
  const supportLinks = [
    { href: "/faq", label: t("common.faq") },
    { href: "/help", label: t("common.help") },
    { href: "/docs", label: t("common.docs") },
  ];

  return (
    <footer className="border-t bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand section - full width on mobile, normal on larger screens */}
          <div className="sm:col-span-2 lg:col-span-1">
            <FooterBrand />
          </div>

          {/* Links sections - responsive grid */}
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-8 sm:gap-0">
            <FooterLinks
              locale={locale}
              title={t("common.quickLinks")}
              links={quickLinks}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-1 gap-8 sm:gap-0">
            <FooterLinks
              locale={locale}
              title={t("common.account")}
              links={accountLinks}
            />
          </div>

          {/* Newsletter section - full width on mobile, normal on larger screens */}
          <div className="sm:col-span-2 lg:col-span-1">
            <FooterNewsletter />
          </div>
        </div>

        {/* Mobile-only quick access */}
        <div className="mt-8 pt-6 border-t border-border/50 lg:hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <a
              href="#"
              className="text-center py-2 px-3 rounded-md bg-muted/50 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {t("common.help")}
            </a>
            <a
              href="#"
              className="text-center py-2 px-3 rounded-md bg-muted/50 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {t("common.faq")}
            </a>
            <a
              href="#"
              className="text-center py-2 px-3 rounded-md bg-muted/50 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {t("common.terms")}
            </a>
            <a
              href="#"
              className="text-center py-2 px-3 rounded-md bg-muted/50 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {t("common.privacy")}
            </a>
          </div>
        </div>

        {/* Copyright section */}
        <FooterCopyright />
      </div>
    </footer>
  );
}
