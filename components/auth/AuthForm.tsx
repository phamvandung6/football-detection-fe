"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface AuthFormProps {
  type: "login" | "register";
  locale: string;
}

export function AuthForm({ type, locale }: AuthFormProps) {
  const t = useTranslations();
  const isLogin = type === "login";

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isLogin ? t("auth.login") : t("auth.register")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isLogin ? t("auth.loginRequired") : t("auth.noAccount")}
        </p>
      </div>
      <div className="grid gap-6">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-4">
            {!isLogin && (
              <div className="grid gap-2">
                <Label htmlFor="name">{t("auth.name")}</Label>
                <Input
                  id="name"
                  type="text"
                  autoCapitalize="words"
                  autoComplete="name"
                  autoCorrect="off"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
              />
            </div>
            <div className="grid gap-2">
              {isLogin && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  <Link
                    href={`/${locale}/auth/forgot-password`}
                    className="text-xs text-primary"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                </div>
              )}
              {!isLogin && (
                <Label htmlFor="password">{t("auth.password")}</Label>
              )}
              <Input
                id="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>
            {!isLogin && (
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">
                  {t("auth.confirmPassword")}
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                />
              </div>
            )}
            <Button type="submit">
              {isLogin ? t("auth.login") : t("auth.register")}
            </Button>
          </div>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {isLogin ? t("auth.noAccount") : t("auth.haveAccount")}
            </span>
          </div>
        </div>
        <Link href={`/${locale}/auth/${isLogin ? "register" : "login"}`}>
          <Button variant="outline" className="w-full">
            {isLogin ? t("auth.register") : t("auth.login")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
