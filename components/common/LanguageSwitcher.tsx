"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Locale, localeNames, locales } from "@/lib/i18n/locales";
import { useRouter } from "@/lib/i18n/navigation";
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";

interface LanguageSwitcherProps {
  locale: string;
  pathname: string;
}

export function LanguageSwitcher({ locale, pathname }: LanguageSwitcherProps) {
  const t = useTranslations();
  const router = useRouter();

  const handleLocaleChange = (newLocale: Locale) => {
    // Sử dụng API của next-intl để chuyển đổi locale
    // pathname được truyền vào đã bao gồm phần đường dẫn sau locale
    // Ví dụ: với URL /vi/dashboard, pathname sẽ là /dashboard
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu modal={false}>
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
