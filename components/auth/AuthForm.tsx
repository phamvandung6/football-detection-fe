"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth/AuthContext";
import { toast } from "sonner";

interface AuthFormProps {
  type: "login" | "register";
  locale: string;
}

export function AuthForm({ type, locale }: AuthFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const { login, register } = useAuth();
  const isLogin = type === "login";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = t("auth.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("common.invalidEmail");
    }

    if (!formData.password) {
      newErrors.password = t("auth.passwordRequired");
    } else if (formData.password.length < 6) {
      newErrors.password = t("auth.passwordTooShort");
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = t("auth.nameRequired");
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t("auth.passwordsDoNotMatch");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const success = await login(formData.email, formData.password);
        if (success) {
          router.push(`/${locale}/dashboard`);
        }
      } else {
        const success = await register(
          formData.name,
          formData.email,
          formData.password
        );
        if (success) {
          router.push(`/${locale}/auth/login`);
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error(
        error instanceof Error ? error.message : "Authentication failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            {!isLogin && (
              <div className="grid gap-2">
                <Label htmlFor="name">{t("auth.name")}</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  autoCapitalize="words"
                  autoComplete="name"
                  autoCorrect="off"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isSubmitting}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
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
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete={isLogin ? "current-password" : "new-password"}
                disabled={isSubmitting}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
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
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.confirmPassword}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t("common.loading")
                : isLogin
                ? t("auth.login")
                : t("auth.register")}
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
