"use client";

import { loginAction, registerAction } from "@/app/[locale]/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

interface AuthFormProps {
  type: "login" | "register";
  locale: string;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  const t = useTranslations("common");
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? t("loading") : label}
    </Button>
  );
}

export function AuthForm({ type, locale }: AuthFormProps) {
  const t = useTranslations();
  const isLogin = type === "login";

  const action = isLogin ? loginAction : registerAction;

  const [formState, formAction] = useActionState(action, undefined);

  useEffect(() => {
    if (formState?.success === false && formState.message) {
      toast.error(formState.message);
    }
  }, [formState]);

  const nameError = formState?.errors?.name?.[0];
  const emailError = formState?.errors?.email?.[0];
  const usernameError = formState?.errors?.username?.[0];
  const passwordError = formState?.errors?.password?.[0];

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isLogin ? t("auth.login") : t("auth.register")}
        </h1>
      </div>
      <div className="grid gap-6">
        <form action={formAction}>
          <input type="hidden" name="locale" value={locale} />
          <div className="grid gap-4">
            {!isLogin && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("auth.name")}</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoCapitalize="words"
                    autoComplete="name"
                    autoCorrect="off"
                    aria-invalid={!!nameError}
                    aria-describedby={nameError ? "name-error" : undefined}
                  />
                  {nameError && (
                    <p id="name-error" className="text-xs text-destructive">
                      {nameError}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "email-error" : undefined}
                  />
                  {emailError && (
                    <p id="email-error" className="text-xs text-destructive">
                      {emailError}
                    </p>
                  )}
                </div>
              </>
            )}
            <div className="grid gap-2">
              <Label htmlFor="username">{t("auth.username")}</Label>
              <Input
                id="username"
                name="username"
                type="text"
                autoCapitalize="none"
                autoComplete="username"
                autoCorrect="off"
                aria-invalid={!!usernameError}
                aria-describedby={usernameError ? "username-error" : undefined}
              />
              {usernameError && (
                <p id="username-error" className="text-xs text-destructive">
                  {usernameError}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              {isLogin && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  <Link
                    href="/auth/forgot-password"
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
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? "password-error" : undefined}
              />
              {passwordError && (
                <p id="password-error" className="text-xs text-destructive">
                  {passwordError}
                </p>
              )}
            </div>
            {!isLogin && (
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">
                  {t("auth.confirmPassword")}
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                />
              </div>
            )}
            <SubmitButton
              label={isLogin ? t("auth.login") : t("auth.register")}
            />
          </div>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t("common.orContinueWith")}
            </span>
          </div>
        </div>
      </div>
      <p className="px-8 text-center text-sm text-muted-foreground">
        {isLogin ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
        <Link
          href={`/auth/${isLogin ? "register" : "login"}`}
          className="underline underline-offset-4 hover:text-primary"
        >
          {isLogin ? t("auth.register") : t("auth.login")}
        </Link>
      </p>
    </div>
  );
}
