"use client";

import { logoutAction } from "@/app/[locale]/auth/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import { usePermissions } from "@/lib/auth/usePermissions";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useTransition } from "react";

interface UserMenuProps {
  locale: string;
  mobile?: boolean;
  onClick?: () => void;
}

export function UserMenu({ locale, mobile = false, onClick }: UserMenuProps) {
  const t = useTranslations();
  const { user, isAuthenticated, isLoading } = useAuthSession();
  const { isAdmin } = usePermissions();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction(locale);
    });
    if (onClick) onClick();
  };

  if (isLoading) {
    return <div className="h-10 w-24 animate-pulse rounded-md bg-muted"></div>;
  }

  if (mobile) {
    return (
      <div className="flex flex-col space-y-2">
        {isAuthenticated && user ? (
          <>
            <div className="flex items-center gap-3 py-2">
              <Avatar>
                <AvatarImage
                  src="/placeholder-avatar.jpg"
                  alt={user.name || user.username}
                />
                <AvatarFallback>
                  {user.name
                    ? user.name.charAt(0)
                    : user.username
                    ? user.username.charAt(0)
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {user.name || user.username}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            {isAdmin() && (
              <Link href={`/${locale}/admin`} onClick={onClick}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left"
                  disabled={isPending}
                >
                  {t("admin.title")}
                </Button>
              </Link>
            )}
            <Link href={`/${locale}/dashboard`} onClick={onClick}>
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
                disabled={isPending}
              >
                {t("dashboard.title")}
              </Button>
            </Link>
            <Link href={`/${locale}/upload`} onClick={onClick}>
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
                disabled={isPending}
              >
                {t("upload.title")}
              </Button>
            </Link>
            <Link href={`/${locale}/videos`} onClick={onClick}>
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
                disabled={isPending}
              >
                {t("videos.title")}
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-left"
              onClick={handleLogout}
              disabled={isPending}
            >
              {isPending ? t("common.loading") : t("auth.logout")}
            </Button>
          </>
        ) : (
          <>
            <Link href={`/${locale}/auth/login`} onClick={onClick}>
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
                disabled={isPending}
              >
                {t("auth.login")}
              </Button>
            </Link>
            <Link href={`/${locale}/auth/register`} onClick={onClick}>
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
                disabled={isPending}
              >
                {t("auth.register")}
              </Button>
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      {isAuthenticated && user ? (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <motion.button
              className="flex items-center gap-2 rounded-full border p-1 pr-3 hover:bg-accent"
              whileTap={{ scale: 0.97 }}
              disabled={isPending}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src="/placeholder-avatar.jpg"
                  alt={user.name || user.username}
                />
                <AvatarFallback>
                  {user.name
                    ? user.name.charAt(0)
                    : user.username
                    ? user.username.charAt(0)
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {user.name || user.username}
              </span>
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2 p-2">
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium">
                  {user.name || user.username}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <Link href={`/${locale}/dashboard`} onClick={onClick}>
              <DropdownMenuItem disabled={isPending}>
                {t("dashboard.title")}
              </DropdownMenuItem>
            </Link>
            <Link href={`/${locale}/upload`} onClick={onClick}>
              <DropdownMenuItem disabled={isPending}>
                {t("upload.title")}
              </DropdownMenuItem>
            </Link>
            <Link href={`/${locale}/videos`} onClick={onClick}>
              <DropdownMenuItem disabled={isPending}>
                {t("videos.title")}
              </DropdownMenuItem>
            </Link>
            {isAdmin() && (
              <Link href={`/${locale}/admin`} onClick={onClick}>
                <DropdownMenuItem disabled={isPending}>
                  {t("admin.title")}
                </DropdownMenuItem>
              </Link>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={isPending}>
              {isPending ? t("common.loading") : t("auth.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center gap-2">
          <Link href={`/${locale}/auth/login`} onClick={onClick}>
            <Button variant="ghost" size="sm" disabled={isPending}>
              {t("auth.login")}
            </Button>
          </Link>
          <Link href={`/${locale}/auth/register`} onClick={onClick}>
            <Button variant="default" size="sm" disabled={isPending}>
              {t("auth.register")}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
