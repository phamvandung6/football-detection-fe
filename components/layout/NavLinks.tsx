"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import { NAVIGATION_ROUTES } from "@/lib/constants/navigation";
import { Link } from "@/lib/i18n/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

interface NavLinksProps {
  locale: string;
  mobile?: boolean;
  onClick?: () => void;
}

interface NavLinkItemProps {
  href: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
  locale: string;
  mobile?: boolean;
}

// Tách thành component riêng để dễ quản lý
const NavLinkItem = ({
  href,
  label,
  isActive,
  onClick,
  locale,
  mobile,
}: NavLinkItemProps) => {
  if (mobile) {
    return (
      <Link
        href={href}
        className="text-sm font-medium transition-colors hover:text-primary"
        onClick={onClick}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-all duration-200 hover:text-primary relative 
        ${isActive ? "text-primary font-semibold" : ""}
      `}
    >
      <span>{label}</span>
      {isActive && (
        <motion.span
          className="absolute -bottom-1.5 left-0 w-full h-0.5 bg-primary rounded-full"
          layoutId="navbar-indicator"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
    </Link>
  );
};

export function NavLinks({ locale, mobile = false, onClick }: NavLinksProps) {
  const pathname = usePathname();
  const t = useTranslations();
  const { user, isAuthenticated, isLoading } = useAuthSession();

  const isAdmin = user?.roles.includes("admin");

  // Check if current page is active
  const isActive = (path: string) => pathname === `/${locale}${path}`;

  // Tạo danh sách liên kết dựa trên trạng thái đăng nhập và quyền admin
  const getLinks = () => {
    const links = [
      ...NAVIGATION_ROUTES.PUBLIC.map((route) => ({
        href: route.href,
        label: t(route.translationKey),
      })),
    ];

    if (isAuthenticated) {
      links.push(
        ...NAVIGATION_ROUTES.AUTHENTICATED.map((route) => ({
          href: route.href,
          label: t(route.translationKey),
        }))
      );
    }

    if (isAdmin) {
      links.push(
        ...NAVIGATION_ROUTES.ADMIN.map((route) => ({
          href: route.href,
          label: t(route.translationKey),
        }))
      );
    }

    return links;
  };

  const links = getLinks();

  if (isLoading && !mobile) {
    return (
      <nav className="hidden md:flex items-center gap-6 h-6">
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-4 w-16 rounded" />
      </nav>
    );
  }

  if (mobile) {
    return (
      <nav className="flex flex-col space-y-3">
        {links.map((link) => (
          <NavLinkItem
            key={link.href}
            {...link}
            isActive={isActive(link.href)}
            onClick={onClick}
            locale={locale}
            mobile={true}
          />
        ))}
      </nav>
    );
  }

  return (
    <nav className="hidden md:flex items-center gap-6">
      {links.map((link) => (
        <NavLinkItem
          key={link.href}
          {...link}
          isActive={isActive(link.href)}
          locale={locale}
        />
      ))}
    </nav>
  );
}
