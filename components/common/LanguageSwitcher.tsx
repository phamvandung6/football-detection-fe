"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { locales, localeNames, Locale } from "@/lib/i18n/locales";

interface LanguageSwitcherProps {
  locale: string;
  pathname: string;
}

export function LanguageSwitcher({ locale, pathname }: LanguageSwitcherProps) {
  const t = useTranslations();
  const router = useRouter();

  const handleLocaleChange = (newLocale: Locale) => {
    // Redirect to the same page but with different locale
    router.push(`/${newLocale}${pathname}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("common.language")}>
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => handleLocaleChange(l)}
            className={l === locale ? "bg-accent font-semibold" : ""}
          >
            {localeNames[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
