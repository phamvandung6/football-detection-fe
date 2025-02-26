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
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

interface UserMenuProps {
  locale: string;
  mobile?: boolean;
  onClick?: () => void;
}

export function UserMenu({ locale, mobile = false, onClick }: UserMenuProps) {
  const t = useTranslations();
  // Mock user state - in a real app, this would come from auth context
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );

  if (mobile) {
    return (
      <div className="flex flex-col space-y-2">
        {user ? (
          <>
            <div className="flex items-center gap-3 py-2">
              <Avatar>
                <AvatarImage src="/placeholder-avatar.jpg" alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-left"
              onClick={() => {
                setUser(null);
                onClick?.();
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
              <Button className="w-full justify-start text-left">
                {t("auth.register")}
              </Button>
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-4 animate-fade-in">
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full"
              aria-label="User menu"
            >
              <Avatar>
                <AvatarImage src="/placeholder-avatar.jpg" alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="flex items-center gap-2 p-2">
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <DropdownMenuItem
              onClick={() => {
                setUser(null);
              }}
            >
              {t("auth.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <Link href={`/${locale}/auth/login`}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full transition-transform"
              >
                {t("auth.login")}
              </Button>
            </motion.div>
          </Link>
          <Link href={`/${locale}/auth/register`}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                className="rounded-full transition-transform hover:shadow-md"
              >
                {t("auth.register")}
              </Button>
            </motion.div>
          </Link>
        </>
      )}
    </div>
  );
}
