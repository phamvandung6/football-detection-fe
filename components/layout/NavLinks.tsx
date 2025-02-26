"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

interface NavLinksProps {
  locale: string;
  mobile?: boolean;
  onClick?: () => void;
}

export function NavLinks({ locale, mobile = false, onClick }: NavLinksProps) {
  const pathname = usePathname();
  const t = useTranslations();

  // Check if current page is active
  const isActive = (path: string) => {
    return pathname === `/${locale}${path}`;
  };

  // Links data
  const links = [
    { href: "/dashboard", label: t("dashboard.title") },
    { href: "/admin", label: t("admin.title") },
  ];

  if (mobile) {
    return (
      <nav className="flex flex-col space-y-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={`/${locale}${link.href}`}
            className="text-sm font-medium transition-colors hover:text-primary"
            onClick={onClick}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="hidden md:flex items-center gap-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={`/${locale}${link.href}`}
          className={`text-sm font-medium transition-all duration-200 hover:text-primary relative 
            ${isActive(link.href) ? "text-primary font-semibold" : ""}
          `}
        >
          <span>{link.label}</span>
          {isActive(link.href) && (
            <motion.span
              className="absolute -bottom-1.5 left-0 w-full h-0.5 bg-primary rounded-full"
              layoutId="navbar-indicator"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
        </Link>
      ))}
    </nav>
  );
}
