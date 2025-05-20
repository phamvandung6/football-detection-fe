"use client";

import { loginAction, registerAction } from "@/app/[locale]/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CheckIcon, InfoIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState } from "react";
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
    <Button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="relative"
    >
      {pending ? (
        <>
          <span className="opacity-0">{label}</span>
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {t("loading")}
          </span>
        </>
      ) : (
        label
      )}
    </Button>
  );
}

export function AuthForm({ type, locale }: AuthFormProps) {
  const t = useTranslations();
  const isLogin = type === "login";
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form local state for real-time validation
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // Local validation states
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    email: false,
    username: false,
    password: false,
    confirmPassword: false,
  });

  const action = isLogin ? loginAction : registerAction;
  const [formState, formAction] = useActionState(action, undefined);

  useEffect(() => {
    if (formState?.success === false && formState.message) {
      toast.error(formState.message);
    }

    if (formState?.success === true) {
      // Hiển thị thông báo thành công
      toast.success(
        isLogin ? t("auth.loginSuccess") : t("auth.registerSuccess")
      );

      // Nếu đăng nhập hoặc đăng ký thành công, invalidate cache của authSession
      if (formState.shouldInvalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ["authSession"] });

        // Redirect sau khi invalidate thành công
        const redirectPath = `/upload`;
        setTimeout(() => {
          router.push(redirectPath);
        }, 100);
      }
    }
  }, [formState, queryClient, locale, isLogin, router, t]);

  const nameError = formState?.errors?.name?.[0];
  const emailError = formState?.errors?.email?.[0];
  const usernameError = formState?.errors?.username?.[0];
  const passwordError = formState?.errors?.password?.[0];
  const confirmPasswordError = formState?.errors?.confirmPassword?.[0];

  // Hàm xử lý thay đổi giá trị input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Hàm xử lý khi blur khỏi input
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
  };

  // Kiểm tra độ mạnh của mật khẩu
  const getPasswordStrength = (password: string) => {
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    return Math.min(strength, 5); // Max 5
  };

  const passwordStrength = getPasswordStrength(formValues.password);
  const passwordStrengthText = !formValues.password
    ? ""
    : passwordStrength < 2
    ? t("auth.passwordWeak")
    : passwordStrength < 4
    ? t("auth.passwordMedium")
    : t("auth.passwordStrong");

  const passwordStrengthColor = !formValues.password
    ? "bg-gray-200"
    : passwordStrength < 2
    ? "bg-red-500"
    : passwordStrength < 4
    ? "bg-yellow-500"
    : "bg-green-500";

  // Kiểm tra một số lỗi real-time
  const passwordsMismatch =
    touchedFields.confirmPassword &&
    formValues.password !== formValues.confirmPassword;

  const passwordTooShort =
    touchedFields.password &&
    formValues.password.length > 0 &&
    formValues.password.length < 6;

  const invalidEmailFormat =
    touchedFields.email &&
    formValues.email.length > 0 &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email);

  const usernameTooShort =
    touchedFields.username &&
    formValues.username.length > 0 &&
    formValues.username.length < 3;

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isLogin ? t("auth.login") : t("auth.register")}
        </h1>
        {!isLogin && (
          <p className="text-sm text-muted-foreground">
            {t("auth.registerDescription") ||
              "Tạo tài khoản mới để sử dụng ứng dụng"}
          </p>
        )}
      </div>
      <div className="grid gap-6">
        <form action={formAction}>
          <input type="hidden" name="locale" value={locale} />
          <div className="grid gap-4">
            {!isLogin && (
              <>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="name">{t("auth.name")}</Label>
                    {touchedFields.name && !formValues.name && (
                      <span className="text-xs text-destructive flex items-center gap-1">
                        <InfoIcon size={12} />
                        {t("auth.nameRequired")}
                      </span>
                    )}
                  </div>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoCapitalize="words"
                    autoComplete="name"
                    autoCorrect="off"
                    aria-invalid={
                      !!nameError || (touchedFields.name && !formValues.name)
                    }
                    aria-describedby={nameError ? "name-error" : undefined}
                    placeholder={
                      t("auth.namePlaceholder") || "Họ và tên của bạn"
                    }
                    value={formValues.name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  />
                  {nameError && (
                    <p
                      id="name-error"
                      className="text-xs text-destructive flex items-center gap-1"
                    >
                      <XIcon size={12} />
                      {nameError}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email">{t("auth.email")}</Label>
                    {invalidEmailFormat && (
                      <span className="text-xs text-destructive flex items-center gap-1">
                        <InfoIcon size={12} />
                        {t("auth.invalidEmail")}
                      </span>
                    )}
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    aria-invalid={!!emailError || invalidEmailFormat}
                    aria-describedby={emailError ? "email-error" : undefined}
                    placeholder={
                      t("auth.emailPlaceholder") || "email@example.com"
                    }
                    value={formValues.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  />
                  {emailError && (
                    <p
                      id="email-error"
                      className="text-xs text-destructive flex items-center gap-1"
                    >
                      <XIcon size={12} />
                      {emailError}
                    </p>
                  )}
                </div>
              </>
            )}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="username">{t("auth.username")}</Label>
                {usernameTooShort && (
                  <span className="text-xs text-destructive flex items-center gap-1">
                    <InfoIcon size={12} />
                    {t("auth.usernameTooShort")}
                  </span>
                )}
              </div>
              <Input
                id="username"
                name="username"
                type="text"
                autoCapitalize="none"
                autoComplete="username"
                autoCorrect="off"
                aria-invalid={!!usernameError || usernameTooShort}
                aria-describedby={usernameError ? "username-error" : undefined}
                placeholder={t("auth.usernamePlaceholder") || "username"}
                value={formValues.username}
                onChange={handleInputChange}
                onBlur={handleBlur}
              />
              {usernameError && (
                <p
                  id="username-error"
                  className="text-xs text-destructive flex items-center gap-1"
                >
                  <XIcon size={12} />
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  {passwordTooShort && (
                    <span className="text-xs text-destructive flex items-center gap-1">
                      <InfoIcon size={12} />
                      {t("auth.passwordTooShort")}
                    </span>
                  )}
                </div>
              )}
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                aria-invalid={!!passwordError || passwordTooShort}
                aria-describedby={passwordError ? "password-error" : undefined}
                placeholder={
                  isLogin
                    ? undefined
                    : t("auth.passwordPlaceholder") || "Ít nhất 6 ký tự"
                }
                value={formValues.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
              />
              {passwordError && (
                <p
                  id="password-error"
                  className="text-xs text-destructive flex items-center gap-1"
                >
                  <XIcon size={12} />
                  {passwordError}
                </p>
              )}

              {!isLogin && formValues.password && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span>{t("auth.passwordStrength")}</span>
                    <span
                      className={
                        passwordStrength >= 4
                          ? "text-green-500"
                          : passwordStrength >= 2
                          ? "text-yellow-500"
                          : "text-red-500"
                      }
                    >
                      {passwordStrengthText}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrengthColor} transition-all duration-300`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>

                  <ul className="space-y-1 text-xs text-muted-foreground mt-2">
                    <li
                      className={`flex items-center gap-1 ${
                        formValues.password.length >= 6 ? "text-green-500" : ""
                      }`}
                    >
                      {formValues.password.length >= 6 ? (
                        <CheckIcon size={12} />
                      ) : (
                        <InfoIcon size={12} />
                      )}
                      {t("auth.passwordMinLength") || "Ít nhất 6 ký tự"}
                    </li>
                    <li
                      className={`flex items-center gap-1 ${
                        /[A-Z]/.test(formValues.password)
                          ? "text-green-500"
                          : ""
                      }`}
                    >
                      {/[A-Z]/.test(formValues.password) ? (
                        <CheckIcon size={12} />
                      ) : (
                        <InfoIcon size={12} />
                      )}
                      {t("auth.passwordUppercase") || "Ít nhất 1 chữ hoa"}{" "}
                      <span className="text-xs italic">
                        {t("auth.optional") || "(không bắt buộc)"}
                      </span>
                    </li>
                    <li
                      className={`flex items-center gap-1 ${
                        /[0-9]/.test(formValues.password)
                          ? "text-green-500"
                          : ""
                      }`}
                    >
                      {/[0-9]/.test(formValues.password) ? (
                        <CheckIcon size={12} />
                      ) : (
                        <InfoIcon size={12} />
                      )}
                      {t("auth.passwordNumber") || "Ít nhất 1 chữ số"}{" "}
                      <span className="text-xs italic">
                        {t("auth.optional") || "(không bắt buộc)"}
                      </span>
                    </li>
                    <li
                      className={`flex items-center gap-1 ${
                        /[^A-Za-z0-9]/.test(formValues.password)
                          ? "text-green-500"
                          : ""
                      }`}
                    >
                      {/[^A-Za-z0-9]/.test(formValues.password) ? (
                        <CheckIcon size={12} />
                      ) : (
                        <InfoIcon size={12} />
                      )}
                      {t("auth.passwordSpecialChar") ||
                        "Ít nhất 1 ký tự đặc biệt"}{" "}
                      <span className="text-xs italic">
                        {t("auth.optional") || "(không bắt buộc)"}
                      </span>
                    </li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    {t("auth.passwordStrengthNote") ||
                      "Mật khẩu chỉ cần tối thiểu 6 ký tự, nhưng thêm các yếu tố khác sẽ giúp tài khoản của bạn an toàn hơn."}
                  </p>
                </div>
              )}
            </div>
            {!isLogin && (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="confirmPassword">
                    {t("auth.confirmPassword")}
                  </Label>
                  {passwordsMismatch && (
                    <span className="text-xs text-destructive flex items-center gap-1">
                      <InfoIcon size={12} />
                      {t("auth.passwordsDoNotMatch")}
                    </span>
                  )}
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!confirmPasswordError || passwordsMismatch}
                  aria-describedby={
                    confirmPasswordError ? "confirm-password-error" : undefined
                  }
                  placeholder={
                    t("auth.confirmPasswordPlaceholder") || "Nhập lại mật khẩu"
                  }
                  value={formValues.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                {confirmPasswordError && (
                  <p
                    id="confirm-password-error"
                    className="text-xs text-destructive flex items-center gap-1"
                  >
                    <XIcon size={12} />
                    {confirmPasswordError}
                  </p>
                )}
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
