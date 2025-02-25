"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface NavbarProps {
  locale: string;
}

export function Navbar({ locale }: NavbarProps) {
  const pathname = usePathname();
  const t = useTranslations();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Create a pathname without the locale prefix for links
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, "");

  // Check if current page is active
  const isActive = (path: string) => {
    return pathname === `/${locale}${path}`;
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md shadow-sm"
          : "bg-background border-b"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            href={`/${locale}`}
            className="text-xl font-bold flex items-center gap-2 transition-transform hover:scale-105"
          >
            <FootballIcon className="h-6 w-6 text-primary animate-pulse-slow" />
            <span className="gradient-text">{t("app.title")}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href={`/${locale}/dashboard`}
              className={`text-sm font-medium transition-all duration-200 hover:text-primary relative 
                ${isActive("/dashboard") ? "text-primary font-semibold" : ""}
              `}
            >
              <span>{t("dashboard.title")}</span>
              {isActive("/dashboard") && (
                <span className="absolute -bottom-1.5 left-0 w-full h-0.5 bg-primary rounded-full"></span>
              )}
            </Link>
            <Link
              href={`/${locale}/admin`}
              className={`text-sm font-medium transition-all duration-200 hover:text-primary relative 
                ${isActive("/admin") ? "text-primary font-semibold" : ""}
              `}
            >
              <span>{t("admin.title")}</span>
              {isActive("/admin") && (
                <span className="absolute -bottom-1.5 left-0 w-full h-0.5 bg-primary rounded-full"></span>
              )}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher locale={locale} pathname={pathnameWithoutLocale} />
          <ThemeToggle />

          <div className="hidden md:flex items-center gap-4 animate-fade-in">
            <Link href={`/${locale}/auth/login`}>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full transition-transform hover:scale-105"
              >
                {t("auth.login")}
              </Button>
            </Link>
            <Link href={`/${locale}/auth/register`}>
              <Button
                size="sm"
                className="rounded-full transition-transform hover:scale-105 hover:shadow-md"
              >
                {t("auth.register")}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-1.5 rounded-md hover:bg-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? "max-h-60 opacity-100 border-b" : "max-h-0 opacity-0"
        }`}
      >
        <div className="container mx-auto px-4 py-4 space-y-4">
          <nav className="flex flex-col space-y-3">
            <Link
              href={`/${locale}/dashboard`}
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("dashboard.title")}
            </Link>
            <Link
              href={`/${locale}/admin`}
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("admin.title")}
            </Link>
          </nav>
          <div className="flex flex-col space-y-2">
            <Link
              href={`/${locale}/auth/login`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
              >
                {t("auth.login")}
              </Button>
            </Link>
            <Link
              href={`/${locale}/auth/register`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button className="w-full justify-start text-left">
                {t("auth.register")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function FootballIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
      <path d="M12 7v4l3 3" />
      <path d="m7 17 2.5-2.5" />
      <path d="m14.5 14.5 2.5 2.5" />
      <path d="M7 7.5 9.5 10" />
      <path d="m14.5 9.5 2.5-2" />
    </svg>
  );
}
