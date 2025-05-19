"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Locale, localeNames, locales } from "@/lib/i18n/locales";
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

interface LanguageSwitcherProps {
  locale: string;
  pathname: string;
}

export function LanguageSwitcher({ locale, pathname }: LanguageSwitcherProps) {
  const t = useTranslations();
  const currentPathname = usePathname();

  const handleLocaleChange = (newLocale: Locale) => {
    // Sử dụng hard redirect để đảm bảo việc chuyển đổi ngôn ngữ
    // Lấy đường dẫn hiện tại (không bao gồm locale)
    let pathWithoutLocale = pathname;
    
    // Nếu đường dẫn hiện tại bắt đầu với locale, bỏ phần locale
    if (currentPathname) {
      // Bỏ locale hiện tại nếu có
      locales.forEach(l => {
        if (currentPathname.startsWith(`/${l}`)) {
          pathWithoutLocale = currentPathname.substring(l.length + 1) || "/";
        }
      });
    }

    // Tạo URL mới với locale mới
    const newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
    window.location.href = newPath;
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
