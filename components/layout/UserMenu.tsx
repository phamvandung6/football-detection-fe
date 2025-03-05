"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth/AuthContext";
import { usePermissions } from "@/lib/auth/usePermissions";

interface UserMenuProps {
  locale: string;
  mobile?: boolean;
  onClick?: () => void;
}

export function UserMenu({ locale, mobile = false, onClick }: UserMenuProps) {
  const t = useTranslations();
  const { user, isAuthenticated, logout } = useAuth();
  const { isAdmin } = usePermissions();

  if (mobile) {
    return (
      <div className="flex flex-col space-y-2">
        {isAuthenticated && user ? (
          <>
            <div className="flex items-center gap-3 py-2">
              <Avatar>
                <AvatarImage
                  src="/placeholder-avatar.jpg"
                  alt={user.full_name}
                />
                <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user.full_name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            {isAdmin() && (
              <Link href={`/${locale}/admin`} onClick={onClick}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left"
                >
                  {t("admin.title")}
                </Button>
              </Link>
            )}
            <Link href={`/${locale}/dashboard`} onClick={onClick}>
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
              >
                {t("dashboard.title")}
              </Button>
            </Link>
            <Link href={`/${locale}/upload`} onClick={onClick}>
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
              >
                {t("upload.title")}
              </Button>
            </Link>
            <Link href={`/${locale}/videos`} onClick={onClick}>
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
              >
                {t("videos.title")}
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-left"
              onClick={() => {
                logout();
                if (onClick) onClick();
              }}
            >
              {t("auth.logout")}
            </Button>
          </>
        ) : (
          <>
            <Link href={`/${locale}/auth/login`} onClick={onClick}>
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
              >
                {t("auth.login")}
              </Button>
            </Link>
            <Link href={`/${locale}/auth/register`} onClick={onClick}>
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              className="flex items-center gap-2 rounded-full border p-1 pr-3 hover:bg-accent"
              whileTap={{ scale: 0.97 }}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src="/placeholder-avatar.jpg"
                  alt={user.full_name}
                />
                <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.full_name}</span>
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2 p-2">
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium">{user.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />

            <Link href={`/${locale}/dashboard`}>
              <DropdownMenuItem>{t("dashboard.title")}</DropdownMenuItem>
            </Link>

            <Link href={`/${locale}/upload`}>
              <DropdownMenuItem>{t("upload.title")}</DropdownMenuItem>
            </Link>

            <Link href={`/${locale}/videos`}>
              <DropdownMenuItem>{t("videos.title")}</DropdownMenuItem>
            </Link>

            {isAdmin() && (
              <>
                <DropdownMenuSeparator />
                <Link href={`/${locale}/admin`}>
                  <DropdownMenuItem>{t("admin.title")}</DropdownMenuItem>
                </Link>
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              {t("auth.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center gap-2">
          <Link href={`/${locale}/auth/login`}>
            <Button variant="ghost" size="sm">
              {t("auth.login")}
            </Button>
          </Link>
          <Link href={`/${locale}/auth/register`}>
            <Button variant="default" size="sm">
              {t("auth.register")}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
